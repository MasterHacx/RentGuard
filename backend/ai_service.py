"""
RentGuard AI service.

Responsibilities:
  1. Build a prompt that enforces our two hard rules:
       - NEVER act like a lawyer; always include a non-lawyer disclaimer and
         flag when professional counsel is advised.
       - Every clause reference MUST quote the EXACT text from the agreement.
  2. Call Groq (primary), fall back to Gemini, then fall back to a cached
     sample response so a demo NEVER crashes.
  3. Coerce/validate whatever the model returns into our strict schema.

Public entry point: analyze(text, preferred_model=None) -> dict
"""

import json
import os
import re

from sample_data import DISCLAIMER, FALLBACK_RESPONSE, SAMPLE_AGREEMENT

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

DEFAULT_GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()
DEFAULT_GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash").strip()

# Models the UI selector may request, mapped to a provider.
GROQ_MODELS = {"llama-3.3-70b-versatile", "llama-3.1-8b-instant"}
GEMINI_MODELS = {"gemini-2.0-flash", "gemini-1.5-flash"}

VALID_SEVERITIES = {"High", "Medium", "Low"}

# ---------------------------------------------------------------------------
# Prompt
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are RentGuard, a careful assistant that helps first-time renters, \
students, and PG residents understand rental agreements in plain English.

HARD RULES (never break these):
1. You are NOT a lawyer and must NOT give formal legal advice. Explain things \
simply and neutrally. When a clause could seriously affect the renter's money \
or legal rights, set "consult_lawyer" to true for that item.
2. GROUNDING: Every "quote" field MUST be copied word-for-word from the \
agreement text provided. Do not paraphrase, summarize, correct, or invent \
quotes. If you cannot find a relevant exact sentence, use an empty string "" \
for the quote and set the value to "Not specified in the agreement".
3. Do not invent facts, numbers, or clauses that are not present in the text.
4. Keep explanations short, friendly, and jargon-free. Assume the reader has \
never rented before.

Return ONLY a single valid JSON object. No markdown, no commentary."""

JSON_INSTRUCTIONS = """Analyze the rental agreement below and return a JSON object with EXACTLY this shape:

{
  "key_terms": {
    "rent": {"value": "string", "quote": "exact text or ''", "notes": "string"},
    "security_deposit": {"value": "string", "quote": "exact text or ''", "notes": "string"},
    "lock_in_period": {"value": "string", "quote": "exact text or ''", "notes": "string"},
    "notice_period": {"value": "string", "quote": "exact text or ''", "notes": "string"},
    "repairs_maintenance": {"value": "string", "quote": "exact text or ''", "notes": "string"}
  },
  "risk_flags": [
    {
      "severity": "High" | "Medium" | "Low",
      "title": "short label",
      "quote": "exact sentence copied from the agreement",
      "explanation": "plain-English explanation of why this matters",
      "recommendation": "what the renter could ask for or do",
      "consult_lawyer": true | false
    }
  ],
  "questions_for_landlord": ["question string", ...],
  "presigning_checklist": [
    {"item": "actionable checklist item", "done": false}, ...
  ]
}

Rules for the content:
- key_terms: fill each field from the agreement. If a term is absent, set value \
to "Not specified in the agreement" and quote to "".
- risk_flags: list every clause that is unusual, one-sided, or risky for the \
renter. Order them High severity first. Each MUST have an exact quote.
- questions_for_landlord: 4-8 concrete questions to ask before signing.
- presigning_checklist: 6-10 practical items, each with "done": false.

AGREEMENT TEXT:
\"\"\"
{agreement}
\"\"\"
"""


def _build_user_prompt(text: str) -> str:
    return JSON_INSTRUCTIONS.replace("{agreement}", text)


# ---------------------------------------------------------------------------
# JSON parsing helpers
# ---------------------------------------------------------------------------

def _extract_json(raw: str) -> dict:
    """Best-effort extraction of a JSON object from an LLM response."""
    if not raw:
        raise ValueError("empty response")
    raw = raw.strip()
    # Strip ```json ... ``` fences if present.
    if raw.startswith("```"):
        raw = re.sub(r"^```[a-zA-Z]*\s*", "", raw)
        raw = re.sub(r"\s*```$", "", raw)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Grab the outermost {...} block as a fallback.
        start = raw.find("{")
        end = raw.rfind("}")
        if start != -1 and end != -1 and end > start:
            return json.loads(raw[start:end + 1])
        raise


# ---------------------------------------------------------------------------
# Schema normalization
# ---------------------------------------------------------------------------

_KEY_TERM_FIELDS = [
    "rent",
    "security_deposit",
    "lock_in_period",
    "notice_period",
    "repairs_maintenance",
]


def _clean_str(v) -> str:
    return v.strip() if isinstance(v, str) else ""


def _normalize_term(raw, source_text: str) -> dict:
    raw = raw if isinstance(raw, dict) else {}
    value = _clean_str(raw.get("value")) or "Not specified in the agreement"
    quote = _clean_str(raw.get("quote"))
    # Grounding guard: drop any quote that isn't actually in the source text.
    if quote and quote not in source_text:
        quote = ""
    return {
        "value": value,
        "quote": quote,
        "notes": _clean_str(raw.get("notes")),
    }


def _normalize_flag(raw, source_text: str):
    if not isinstance(raw, dict):
        return None
    quote = _clean_str(raw.get("quote"))
    # Grounding guard: a risk flag with no verifiable quote is dropped, since
    # exact-clause grounding is a hard requirement of the project.
    if not quote or quote not in source_text:
        return None
    severity = _clean_str(raw.get("severity")).title()
    if severity not in VALID_SEVERITIES:
        severity = "Medium"
    return {
        "severity": severity,
        "title": _clean_str(raw.get("title")) or "Clause worth reviewing",
        "quote": quote,
        "explanation": _clean_str(raw.get("explanation")),
        "recommendation": _clean_str(raw.get("recommendation")),
        "consult_lawyer": bool(raw.get("consult_lawyer", False)),
    }


_SEVERITY_ORDER = {"High": 0, "Medium": 1, "Low": 2}


def normalize_response(raw: dict, source_text: str, meta: dict) -> dict:
    """Coerce arbitrary LLM output into our strict schema. Never raises on
    partial data; it repairs what it can and drops what it can't verify."""
    raw = raw if isinstance(raw, dict) else {}

    raw_terms = raw.get("key_terms") if isinstance(raw.get("key_terms"), dict) else {}
    key_terms = {
        field: _normalize_term(raw_terms.get(field), source_text)
        for field in _KEY_TERM_FIELDS
    }

    flags = []
    for item in raw.get("risk_flags", []) or []:
        f = _normalize_flag(item, source_text)
        if f:
            flags.append(f)
    flags.sort(key=lambda f: _SEVERITY_ORDER.get(f["severity"], 1))

    questions = [
        _clean_str(q) for q in (raw.get("questions_for_landlord") or [])
        if _clean_str(q)
    ]

    checklist = []
    for item in raw.get("presigning_checklist") or []:
        if isinstance(item, dict):
            label = _clean_str(item.get("item"))
        else:
            label = _clean_str(item)
        if label:
            checklist.append({"item": label, "done": False})

    return {
        "disclaimer": DISCLAIMER,
        "key_terms": key_terms,
        "risk_flags": flags,
        "questions_for_landlord": questions,
        "presigning_checklist": checklist,
        "_meta": meta,
    }


# ---------------------------------------------------------------------------
# Provider calls
# ---------------------------------------------------------------------------

def call_groq(text: str, model: str) -> dict:
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY not configured")
    from groq import Groq

    client = Groq(api_key=GROQ_API_KEY)
    completion = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": _build_user_prompt(text)},
        ],
        temperature=0.2,
        response_format={"type": "json_object"},
    )
    return _extract_json(completion.choices[0].message.content)


def call_gemini(text: str, model: str) -> dict:
    if not GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY not configured")
    import google.generativeai as genai

    genai.configure(api_key=GEMINI_API_KEY)
    gm = genai.GenerativeModel(
        model_name=model,
        system_instruction=SYSTEM_PROMPT,
        generation_config={
            "temperature": 0.2,
            "response_mime_type": "application/json",
        },
    )
    resp = gm.generate_content(_build_user_prompt(text))
    return _extract_json(resp.text)


# ---------------------------------------------------------------------------
# Orchestration
# ---------------------------------------------------------------------------

def _resolve_chain(preferred_model):
    """Return an ordered list of (provider, model) attempts based on the
    optional preferred_model, always defaulting to Groq -> Gemini."""
    chain = []
    pm = (preferred_model or "").strip()

    if pm in GEMINI_MODELS:
        chain.append(("gemini", pm))
        chain.append(("groq", DEFAULT_GROQ_MODEL))
    elif pm in GROQ_MODELS:
        chain.append(("groq", pm))
        chain.append(("gemini", DEFAULT_GEMINI_MODEL))
    else:
        # Unknown/blank -> default order.
        chain.append(("groq", DEFAULT_GROQ_MODEL))
        chain.append(("gemini", DEFAULT_GEMINI_MODEL))
    return chain


def analyze(text: str, preferred_model: str = None) -> dict:
    """Analyze agreement text. Always returns a schema-valid dict.

    The dict's `_meta` reports which model produced it and any errors along
    the way (`fallback_used` is True when the cached sample response was used).
    """
    text = (text or "").strip()
    if not text:
        raise ValueError("No agreement text provided.")

    errors = []
    for provider, model in _resolve_chain(preferred_model):
        try:
            raw = call_groq(text, model) if provider == "groq" else call_gemini(text, model)
            meta = {
                "provider": provider,
                "model": model,
                "fallback_used": False,
                "errors": errors,
            }
            return normalize_response(raw, text, meta)
        except Exception as exc:  # noqa: BLE001 - demo must stay resilient
            errors.append({"provider": provider, "model": model, "error": str(exc)})

    # Both providers failed. If the text is our sample, return the cached
    # analysis; otherwise return an empty-but-valid structure so the UI can
    # show a graceful message instead of crashing.
    if text == SAMPLE_AGREEMENT.strip() or text == SAMPLE_AGREEMENT:
        result = dict(FALLBACK_RESPONSE)
        result["_meta"] = {
            "provider": "cache",
            "model": "sample-fallback",
            "fallback_used": True,
            "errors": errors,
        }
        return result

    meta = {
        "provider": "none",
        "model": None,
        "fallback_used": True,
        "errors": errors,
    }
    return normalize_response({}, text, meta)
