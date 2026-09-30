import { useState } from 'react'
import { ShieldCheck, Sparkles, Cpu, Scale, CheckCircle2 } from 'lucide-react'

import Header from './components/Header'
import DisclaimerBanner from './components/DisclaimerBanner'
import FallbackBanner from './components/FallbackBanner'
import InputPanel from './components/InputPanel'
import RiskSummary from './components/RiskSummary'
import KeyTerms from './components/KeyTerms'
import RiskRadar from './components/RiskRadar'
import LandlordQuestions from './components/LandlordQuestions'
import Checklist from './components/Checklist'
import SettingsModal from './components/SettingsModal'
import { analyzeAgreement, fetchSample } from './api'

const MIN_CHARS = 60

const DEFAULT_SETTINGS = {
  provider: 'groq',
  groqModel: 'llama-3.3-70b-versatile',
  geminiModel: 'gemini-2.0-flash',
  autoFallback: true,
  groqKey: '',
  geminiKey: '',
}

const SETTINGS_KEY = 'rentguard.settings'

// Load persisted settings, merged over defaults so new fields stay populated.
function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    /* ignore malformed/unavailable storage */
  }
  return DEFAULT_SETTINGS
}

// Rough count of numbered clauses in the agreement, for the summary badge.
function countClauses(text) {
  if (!text) return 0
  const matches = text.match(/(?:^|\n)\s*\d{1,2}\s*[.)]/g)
  return matches ? matches.length : 0
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[24rem] flex-col items-center justify-center rounded-2xl border border-dashed border-orange-200 bg-white/50 p-8 text-center backdrop-blur-sm">
      <div className="sunset-gradient mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-md shadow-orange-500/30">
        <ShieldCheck className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-bold text-slate-900">Your analysis will appear here</h3>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        Paste an agreement on the left, or click{' '}
        <span className="font-semibold text-slate-700">Load Sample PG Agreement</span>{' '}
        to see key terms, risk flags, questions to ask, and a pre-signing
        checklist.
      </p>
    </div>
  )
}

function ModelChip({ meta }) {
  if (!meta || !meta.model || meta.fallback_used) return null
  return (
    <span className="no-print inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
      <Cpu className="h-3.5 w-3.5" />
      Analyzed by {meta.model}
    </span>
  )
}

function Toast({ message }) {
  if (!message) return null
  return (
    <div className="no-print fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-[fadeIn_0.2s_ease-out]">
      <div className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-xl">
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        {message}
      </div>
    </div>
  )
}

export default function App() {
  const [text, setText] = useState('')
  const [settings, setSettings] = useState(loadSettings)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sampleLoading, setSampleLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [clausesChecked, setClausesChecked] = useState(0)
  const [warning, setWarning] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')

  const preferredModel =
    settings.provider === 'gemini' ? settings.geminiModel : settings.groqModel

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  const handleSaveSettings = (next) => {
    setSettings(next)
    setSettingsOpen(false)
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
    } catch {
      /* storage may be unavailable (private mode); settings still apply this session */
    }
    showToast('AI settings saved')
  }

  const handleLoadSample = async () => {
    setSampleLoading(true)
    setWarning('')
    setError('')
    try {
      const data = await fetchSample()
      setText(data.text || '')
      setResult(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setSampleLoading(false)
    }
  }

  const handleAnalyze = async () => {
    const trimmed = text.trim()
    if (!trimmed) {
      setWarning('Please paste your agreement text first, or load the sample.')
      return
    }
    if (trimmed.length < MIN_CHARS) {
      setWarning(
        'That looks a little short. Please paste more of your agreement (at least a few sentences) so we can analyze it properly.',
      )
      return
    }

    setWarning('')
    setError('')
    setLoading(true)
    try {
      const data = await analyzeAgreement(trimmed, {
        preferredModel,
        allowFallback: settings.autoFallback,
        groqKey: settings.groqKey,
        geminiKey: settings.geminiKey,
      })
      setResult(data)
      setClausesChecked(countClauses(trimmed))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const hasResult = result && result.key_terms

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50/70 to-rose-50/70">
      <Header
        activeProvider={settings.provider}
        activeModelName={preferredModel}
        onOpenSettings={() => setSettingsOpen(true)}
      />
      <DisclaimerBanner />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left: input */}
          <div className="lg:col-span-4">
            <InputPanel
              text={text}
              onTextChange={setText}
              onLoadSample={handleLoadSample}
              onAnalyze={handleAnalyze}
              loading={loading}
              sampleLoading={sampleLoading}
              warning={warning}
            />
          </div>

          {/* Right: results */}
          <div className="print-full flex flex-col gap-8 lg:col-span-8">
            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800">
                {error}
              </div>
            )}

            {!hasResult && !error && <EmptyState />}

            {hasResult && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    Agreement Analysis
                  </h2>
                  <ModelChip meta={result._meta} />
                </div>

                <FallbackBanner meta={result._meta} />

                <RiskSummary
                  flags={result.risk_flags}
                  clausesChecked={clausesChecked}
                />

                <KeyTerms keyTerms={result.key_terms} />
                <RiskRadar flags={result.risk_flags} />
                <LandlordQuestions questions={result.questions_for_landlord} />
                <Checklist items={result.presigning_checklist} />

                {/* Non-lawyer disclaimer repeated in the results / printout */}
                <div className="glass-card flex items-start gap-2 rounded-xl px-4 py-3">
                  <Scale className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                  <p className="text-xs text-slate-500">
                    {result.disclaimer ||
                      'RentGuard is not a lawyer and this is not legal advice. Consult a qualified lawyer before signing or for any dispute.'}
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <footer className="no-print mx-auto max-w-7xl px-4 py-6 text-center text-xs text-slate-400 sm:px-6">
        RentGuard · Built for first-time renters · Not a substitute for legal advice
      </footer>

      <SettingsModal
        open={settingsOpen}
        settings={settings}
        onSave={handleSaveSettings}
        onClose={() => setSettingsOpen(false)}
      />
      <Toast message={toast} />
    </div>
  )
}
