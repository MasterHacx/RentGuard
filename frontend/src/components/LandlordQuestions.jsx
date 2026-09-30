import { useState } from 'react'
import { HelpCircle, Copy, Check, CopyCheck } from 'lucide-react'

export default function LandlordQuestions({ questions }) {
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [copiedAll, setCopiedAll] = useState(false)

  if (!questions || questions.length === 0) return null

  const copy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 1500)
    } catch {
      /* clipboard may be blocked; fail silently */
    }
  }

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(questions.map((q, i) => `${i + 1}. ${q}`).join('\n'))
      setCopiedAll(true)
      setTimeout(() => setCopiedAll(false), 1500)
    } catch {
      /* ignore */
    }
  }

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          <HelpCircle className="h-4 w-4" />
          Questions for Your Landlord
        </h3>
        <button
          type="button"
          onClick={copyAll}
          className="no-print inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          {copiedAll ? <CopyCheck className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
          {copiedAll ? 'Copied' : 'Copy all'}
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {questions.map((q, i) => (
          <li
            key={i}
            className="glass-card flex items-start justify-between gap-3 rounded-xl p-3"
          >
            <span className="flex items-start gap-2 text-sm text-slate-700">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                {i + 1}
              </span>
              {q}
            </span>
            <div className="no-print relative shrink-0">
              {copiedIndex === i && (
                <span className="absolute -top-8 right-0 z-10 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-lg">
                  Copied to clipboard!
                  <span className="absolute -bottom-1 right-3 h-2 w-2 rotate-45 bg-slate-900" />
                </span>
              )}
              <button
                type="button"
                onClick={() => copy(q, i)}
                title="Copy question"
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold transition ${
                  copiedIndex === i
                    ? 'text-emerald-600'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {copiedIndex === i ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
