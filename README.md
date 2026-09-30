# Tenant Agreement Explainer — RentGuard

> Built for **Vibe Coding Event 2026 — Day 2 (30th)**
> **Problem Statement #4:** Tenant Agreement Explainer
> **Target Persona:** First-Time Renter / Student / PG Resident

## Problem & Solution
First-time renters and students moving into flats or PGs frequently sign rental contracts filled with dense legal jargon, risking unfair deposit forfeiture, harsh lock-in clauses, and unreasonable repair liabilities. **RentGuard** transforms confusing agreements into plain English, detects red-flag clauses, generates landlord clarification questions, and provides an interactive pre-signing checklist.

### Constraint Addressed
1. **Non-Lawyer Guardrail:** RentGuard acts strictly as an educational translator, NOT a legal advisor. Every screen, analysis output, and print export contains prominent disclaimers advising users when to consult a licensed legal professional.
2. **Exact Clause Grounding:** All identified risks and key terms quote the verbatim clause text from the contract. A server-side verification layer drops any quote not literally found in the input text to guarantee zero hallucinations.

## Core AI Architecture
- **Model / Service:** Multi-LLM resilient pipeline:
  - **Primary LLM:** Groq API (LLaMA 3.3 70B Versatile, LLaMA 3.1 8B Instant, GPT-OSS 120B/20B) for sub-second analysis.
  - **Fallback LLM:** Google Gemini API (Gemini 2.0 Flash / 1.5 Flash) if primary exceeds rate limits.
  - **BYOK (Bring Your Own Key):** Users can optionally provide their own Groq or Gemini API keys directly in the Settings modal.
  - **Guaranteed Fail-Safe:** Pre-cached grounded response for sample agreements ensuring 100% demo reliability.
- **Workflow:** Input Text / Preset Sample ➔ Server-side Size & Input Sanitization ➔ Structured JSON Prompting (Key terms, Red flags, Landlord questions, Checklist) ➔ Substring Grounding Verification ➔ Interactive Sunset Glassmorphic Dashboard.
- **Error Handling:** Empty/short input validation, automatic provider failover on HTTP 429/500, non-blocking UI fallback banners, and safe-print styling.

## Prerequisites & Installation

### 1. Clone repository
```bash
git clone https://github.com/MasterHacx/RentGuard.git
cd RentGuard
```

### 2. Backend Setup (Flask)
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# (Optional) Add your GROQ_API_KEY or GEMINI_API_KEY in .env, or use BYOK in UI
python app.py
```
Backend runs on `http://localhost:5000`.

### 3. Frontend Setup (React + Vite)
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

## Participant Info
- **Name:** Abhishek Pawar
- **College ID:** NA
- **Day:** Day 2 (30th)
