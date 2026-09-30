"""
RentGuard Flask API.

Endpoints:
  GET  /api/health   -> service + key status
  GET  /api/sample   -> the sample PG agreement text (judge convenience)
  POST /api/analyze  -> analyze { text, preferred_model? } into the strict schema

Load .env before importing ai_service so it picks up the API keys at import time.
"""

import os

from dotenv import load_dotenv

load_dotenv()  # must run before ai_service reads os.getenv

from flask import Flask, jsonify, request
from flask_cors import CORS

import ai_service
from sample_data import DISCLAIMER, SAMPLE_AGREEMENT

app = Flask(__name__)
CORS(app)  # allow the Vite dev server (and any origin) to call the API

MAX_TEXT_CHARS = 40_000  # guard against pathologically large pastes


@app.get("/api/health")
def health():
    return jsonify({
        "status": "ok",
        "service": "rentguard-backend",
        "groq_configured": bool(ai_service.GROQ_API_KEY),
        "gemini_configured": bool(ai_service.GEMINI_API_KEY),
        "default_groq_model": ai_service.DEFAULT_GROQ_MODEL,
        "default_gemini_model": ai_service.DEFAULT_GEMINI_MODEL,
    })


@app.get("/api/sample")
def sample():
    return jsonify({
        "text": SAMPLE_AGREEMENT.strip(),
        "disclaimer": DISCLAIMER,
    })


@app.post("/api/analyze")
def analyze():
    data = request.get_json(silent=True) or {}
    text = data.get("text", "")
    preferred_model = data.get("preferred_model")
    allow_fallback = data.get("allow_fallback", True)
    # Optional BYOK keys — used for this request only, never stored or logged.
    custom_groq_key = data.get("custom_groq_key")
    custom_gemini_key = data.get("custom_gemini_key")

    if not isinstance(text, str) or not text.strip():
        return jsonify({"error": "Please provide agreement text in the 'text' field."}), 400

    if len(text) > MAX_TEXT_CHARS:
        return jsonify({
            "error": "Agreement text is too long. Please paste up to %d characters." % MAX_TEXT_CHARS
        }), 413

    try:
        result = ai_service.analyze(
            text,
            preferred_model=preferred_model,
            allow_fallback=bool(allow_fallback),
            custom_groq_key=custom_groq_key if isinstance(custom_groq_key, str) else None,
            custom_gemini_key=custom_gemini_key if isinstance(custom_gemini_key, str) else None,
        )
        return jsonify(result)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400
    except Exception as exc:  # noqa: BLE001 - never leak a stack trace to judges
        # analyze() already falls back internally; this is a last-resort guard.
        return jsonify({"error": "Something went wrong while analyzing.", "detail": str(exc)}), 500


if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", "5000"))
    debug = os.getenv("FLASK_DEBUG", "true").lower() in ("1", "true", "yes")
    app.run(host="0.0.0.0", port=port, debug=debug)
