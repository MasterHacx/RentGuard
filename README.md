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

### Prerequisites (install once)
- **Python 3.9+** — `python --version`
- **Node.js 18+** and **npm** — `node --version`
- **Git**
- **API keys (optional):** a free **Groq** key ([console.groq.com/keys](https://console.groq.com/keys)) and/or a **Gemini** key ([aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)).
  > 🔑 **You do NOT need keys to test the demo.** The **Load Sample PG Agreement** flow always works via a built-in verified offline cache. Keys (server `.env` **or** in-app BYOK) are only needed to analyze your *own* pasted text live.

You will need **two terminals** — one for the backend, one for the frontend.

---

### Step 1 — Clone the repository
```bash
git clone https://github.com/MasterHacx/RentGuard.git
cd RentGuard
```

### Step 2 — Backend Setup (Flask) · *Terminal 1*
```bash
cd backend

# create + activate a virtual environment (first time only)
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\activate
# Linux / macOS:
source venv/bin/activate

# install dependencies (first time only)
pip install -r requirements.txt

# create your env file (first time only)
copy .env.example .env      # Windows
# cp .env.example .env       # Linux / macOS
# (Optional) open .env and paste GROQ_API_KEY and/or GEMINI_API_KEY

# run the API
python app.py
```
✅ Backend now runs on **http://localhost:5000**. Verify with `http://localhost:5000/api/health`.

### Step 3 — Frontend Setup (React + Vite) · *Terminal 2*
```bash
cd frontend

# install dependencies (first time only)
npm install

# start the dev server
npm run dev
```
✅ Open **http://localhost:5173** in your browser.

### Step 4 — Run the demo (for judges, ~5 seconds)
1. Click **Load Sample PG Agreement**.
2. Click **Analyze Agreement**.
3. Review the **Risk Health Bar**, **Key Terms**, **Risk Radar** (with exact clause quotes), **Landlord Questions**, and the interactive **Pre-Signing Checklist**.
4. Click **Print / Save Summary** to export.

### 🔑 Using Your Own API Key (BYOK)
No server keys? Bring your own — nothing to configure in files:
1. Click the **⚙️ Settings** button in the top-right header.
2. Choose the **Provider** (Groq or Gemini) and the **Model**.
3. Expand **Bring Your Own Key (BYOK)** and paste your Groq and/or Gemini key.
4. Keep **Auto-fallback** ON so a failed provider automatically retries the other.
5. Click **Save & Close**.

> Your keys are used **only for your requests**, are never stored on the server or logged, and stay in your browser session. Leave them blank to use the server's `.env` keys instead.

## Participant Info
- **Name:** Abhishek Pawar
- **College ID:** NA
- **Day:** Day 2 (30th)
