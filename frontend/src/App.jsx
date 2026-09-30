import { useState } from 'react'
import { ShieldCheck, Sparkles, Cpu, Scale } from 'lucide-react'

import Header from './components/Header'
import DisclaimerBanner from './components/DisclaimerBanner'
import FallbackBanner from './components/FallbackBanner'
import InputPanel from './components/InputPanel'
import RiskSummary from './components/RiskSummary'
import KeyTerms from './components/KeyTerms'
import RiskRadar from './components/RiskRadar'
import LandlordQuestions from './components/LandlordQuestions'
import Checklist from './components/Checklist'
import { analyzeAgreement, fetchSample } from './api'

const MIN_CHARS = 60

// Rough count of numbered clauses in the agreement, for the summary badge.
function countClauses(text) {
  if (!text) return 0
  const matches = text.match(/(?:^|\n)\s*\d{1,2}\s*[.)]/g)
  return matches ? matches.length : 0
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[24rem] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
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

export default function App() {
  const [text, setText] = useState('')
  const [model, setModel] = useState('auto')
  const [loading, setLoading] = useState(false)
  const [sampleLoading, setSampleLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [clausesChecked, setClausesChecked] = useState(0)
  const [warning, setWarning] = useState('')
  const [error, setError] = useState('')

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
      const data = await analyzeAgreement(trimmed, model)
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
    <div className="min-h-screen">
      <Header model={model} onModelChange={setModel} />
      <DisclaimerBanner />

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
          {/* Left: input */}
          <InputPanel
            text={text}
            onTextChange={setText}
            onLoadSample={handleLoadSample}
            onAnalyze={handleAnalyze}
            loading={loading}
            sampleLoading={sampleLoading}
            warning={warning}
          />

          {/* Right: results */}
          <div className="print-full flex flex-col gap-6">
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
                    <Sparkles className="h-5 w-5 text-indigo-600" />
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
                <div className="flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
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
    </div>
  )
}
