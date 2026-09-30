// Thin client for the RentGuard Flask API.
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

export async function fetchSample() {
  const res = await fetch(`${API_BASE}/api/sample`)
  if (!res.ok) {
    throw new Error('Could not load the sample agreement. Is the backend running?')
  }
  return res.json()
}

export async function analyzeAgreement(text, { preferredModel, allowFallback = true } = {}) {
  const body = { text, allow_fallback: allowFallback }
  // 'auto' means let the backend decide (Groq -> Gemini fallback).
  if (preferredModel && preferredModel !== 'auto') {
    body.preferred_model = preferredModel
  }

  let res
  try {
    res = await fetch(`${API_BASE}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (err) {
    throw new Error('Cannot reach the backend at ' + API_BASE + '. Is the Flask server running?')
  }

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || 'Analysis failed. Please try again.')
  }
  return data
}
