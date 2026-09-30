# RentGuard — Tenant Agreement Explainer

> Understand your rental agreement in plain English, spot the red flags, and know exactly what to ask before you sign.

RentGuard is an AI-powered assistant that takes a messy rental or PG agreement and turns it into something a first-time renter can actually understand — key terms at a glance, a risk radar that quotes the exact worrying clauses, ready-to-ask landlord questions, and a pre-signing checklist you can print.

---

## 🎯 Target Persona & Problem

**Persona:** First-Time Renter / Student / PG Resident

**The Problem:** Students and first-job workers sign rental and PG agreements without really understanding them. Clauses about the security deposit, lock-in period, and notice period are easy to miss — and the language is dense, one-sided, and intimidating. By the time a problem shows up (a forfeited deposit, a surprise rent hike, a 15-day eviction notice), it's too late.

**The Solution:** RentGuard reads the agreement and explains it like a knowledgeable friend would:
- **Key Terms Summary** — rent, deposit, lock-in, notice period, and repairs, each pulled straight from the text.
- **Risk Radar** — High / Medium / Low severity cards, each quoting the exact clause, explaining why it matters in plain English, and saying what you can do about it.
- **Questions for Your Landlord** — practical, copy-ready questions to raise before signing.
- **Pre-Signing Checklist** — interactive checkboxes plus a one-click print/save summary.

---

## ⚖️ Constraint Addressed

The problem statement sets two hard constraints. RentGuard enforces both — not just in wording, but in code.

### 1. Explicit Non-Lawyer Guardrail

RentGuard **never acts like a lawyer or gives formal legal advice.** This is enforced at multiple layers:

- **System prompt:** the model is instructed, as a hard rule, that it is *not* a lawyer, must explain neutrally, and must set a `consult_lawyer` flag on any clause that seriously affects the renter's money or rights.
- **Persistent UI disclaimer:** a fixed banner sits under the header on every screen — *"Not legal advice. Consult a lawyer for disputes."*
- **Per-clause escalation:** high-impact clauses render a dedicated *"worth asking a lawyer before you sign"* callout.
- **Repeated in output:** the disclaimer is re-shown at the bottom of the analysis and is included in the printed/exported summary.

### 2. Exact Clause Grounding (Verified, Not Trusted)

Every risky clause **must quote the exact sentence from the agreement.** RentGuard does not trust the model to behave — it *verifies*:

- The prompt forbids paraphrasing, correcting, or inventing quotes.
- **Server-side grounding guard:** in `ai_service.normalize_response()`, every quote returned by the model is checked to be a literal substring of the submitted agreement text. Any risk flag whose quote can't be found is **dropped**; any key-term quote that can't be found is **blanked**. The model physically cannot surface a fabricated citation past this layer.
- The pre-cached fail-safe sample is covered by a self-test (`sample_data.verify_fallback_quotes()`) that confirms every fallback quote is an exact substring of the sample agreement.

---

## 🧠 Core AI Architecture

RentGuard uses a **three-tier resilience chain** so the demo never crashes, even on a flaky network or an exhausted API key.

```
┌─────────────────────┐   fails / rate-limited   ┌──────────────────────┐   both fail   ┌─────────────────────────┐
│  PRIMARY             │ ───────────────────────► │  FALLBACK            │ ────────────► │  FAIL-SAFE              │
│  Groq · LLaMA 3.3    │                          │  Google Gemini       │               │  Pre-cached sample      │
│  70B Versatile       │                          │  2.0 Flash           │               │  analysis (grounded)    │
│  (blazing fast)      │                          │  (reliable backup)   │               │  → demo never breaks    │
└─────────────────────┘                          └──────────────────────┘               └─────────────────────────┘
```

- **Primary — Groq (LLaMA 3.3 70B Versatile):** chosen for near-instant inference, ideal for a live demo. Uses Groq's JSON mode for structured output.
- **Fallback — Google Gemini (2.0 Flash):** automatically used if Groq errors or rate-limits. Uses Gemini's JSON response mime type.
- **Fail-safe — Pre-cached response:** if *both* providers fail on the sample agreement, RentGuard serves a hand-verified, fully-grounded cached analysis so judges always see the complete flow.
- **Configurable AI Settings modal:** a glassmorphic in-app Settings dialog (⚙️ in the header) lets you pick the **active provider** (Groq or Gemini), the **specific model** (LLaMA 3.3 70B / LLaMA 3.1 8B, or Gemini 2.0 Flash / 1.5 Flash), and toggle **Auto-fallback** on or off. These map to the API's `preferred_model` and `allow_fallback` fields, while the backend always keeps the offline cache as a final safety net.
- **Strict JSON schema:** regardless of provider, output is coerced into one strict shape (`key_terms`, `risk_flags`, `questions_for_landlord`, `presigning_checklist`, `disclaimer`).

---

## 🛡️ Error Handling

RentGuard is built so a judge review never hits a dead end:

| Scenario | Behavior |
|----------|----------|
| Empty or too-short input | Polite inline warning before any request is made (min. 60 characters). |
| Primary LLM fails / rate-limited | Silent automatic fallback to Gemini. |
| Both LLMs fail on the sample | Pre-cached grounded analysis served; a subtle "Fallback mode" banner explains it. |
| Both LLMs fail on custom text | Valid-but-empty structure returned with a clear message — the UI never crashes. |
| Backend unreachable | Frontend shows a clear "Is the Flask server running?" message instead of a blank screen. |
| Model returns malformed JSON | Robust extraction (strips code fences, grabs the outermost JSON object) + schema normalization. |
| Oversized paste | Server rejects politely with a size-limit message (40k character cap). |
| Fabricated / hallucinated quote | Dropped by the server-side grounding guard before it ever reaches the UI. |

Stack traces are never leaked to the client.

---

## 🚀 Prerequisites & Run Instructions

### Prerequisites
- **Python 3.9+**
- **Node.js 18+** and npm
- API keys (free tiers work fine for the demo):
  - **Groq** — https://console.groq.com/keys
  - **Google Gemini** — https://aistudio.google.com/app/apikey

> RentGuard still runs the full sample flow even without keys, thanks to the pre-cached fail-safe — but live analysis of your own text needs at least one key.

### 1. Backend (Flask API)

```bash
cd backend

# (recommended) create an isolated environment
python -m venv venv
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# macOS / Linux:
# source venv/bin/activate

pip install -r requirements.txt

# configure keys
cp .env.example .env        # Windows: copy .env.example .env
# then open .env and paste your GROQ_API_KEY and GEMINI_API_KEY

python app.py
```

The API runs at **http://localhost:5000**. Quick check:

```bash
curl http://localhost:5000/api/health
```

### 2. Frontend (React + Vite)

In a **second terminal**:

```bash
cd frontend
npm install
npm run dev
```

The app opens at **http://localhost:5173** and talks to the backend at `http://localhost:5000` by default (override with `VITE_API_BASE` in a `.env` file if needed).

### 3. The 5-Second Judge Demo
1. Click **Load Sample PG Agreement**.
2. Click **Analyze Agreement**.
3. Explore the risk health bar, key terms, risk radar, landlord questions, and checklist.
4. Hit **Print / Save Summary** to export.

---

## 🗂️ Project Structure

```
RentGuard/
├── README.md
├── backend/
│   ├── app.py            # Flask app: /api/health, /api/sample, /api/analyze
│   ├── ai_service.py     # Groq → Gemini fallback, prompt, JSON grounding & validation
│   ├── sample_data.py    # Sample PG agreement + pre-cached grounded fail-safe
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── api.js
        └── components/   # Header, RiskSummary, KeyTerms, RiskRadar,
                          # LandlordQuestions, Checklist, banners…
```

---

## 🧰 Tech Stack

- **Backend:** Python, Flask, Flask-CORS, Groq SDK, Google Generative AI SDK
- **Frontend:** React (Vite), Tailwind CSS, Lucide React
- **AI Models:** Groq LLaMA 3.3 70B (primary), Google Gemini 2.0 Flash (fallback)

---

## 🔒 A Note on Scope

RentGuard is an **educational tool built for a hackathon**, not a legal product. It helps renters ask better questions — it does not replace a qualified lawyer. CORS is currently open for local development and would need to be locked down before any real deployment.

---

## 🧷 Architectural Safeguards (at a glance)

- **Configurable AI Settings modal** — pick provider, model, and fallback behavior at runtime; no code change needed.
- **Non-lawyer guardrail** enforced in the system prompt, the persistent UI banner, per-clause callouts, and the printed summary.
- **Verified exact-clause grounding** — every quote is checked server-side against the source text; unverifiable quotes are dropped before they reach the UI.
- **Three-tier resilience** — Groq → Gemini → verified offline cache, so a live demo never crashes.
- **Graceful degradation** on empty input, oversized paste, malformed model JSON, and an unreachable backend.

---

## 👥 Participant Info

<!-- Fill in your team details before submitting -->

> RentGuard ships with a configurable **AI Settings modal** (runtime provider/model/fallback control) and layered **architectural safeguards** — the non-lawyer guardrail, server-verified clause grounding, and a three-tier Groq → Gemini → offline-cache resilience chain described above.

- **Team Name:** _[Your team name]_
- **Members:** _[Name 1], [Name 2], [Name 3]_
- **Problem Statement:** #4 — Tenant Agreement Explainer
- **Hackathon:** _[Event name & date]_
- **Contact:** _[email / handle]_
