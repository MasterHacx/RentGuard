import { Info } from 'lucide-react'

// Shown when the backend could not use a live LLM and fell back.
export default function FallbackBanner({ meta }) {
  if (!meta || !meta.fallback_used) return null

  const isCache = meta.provider === 'cache'
  const message = isCache
    ? 'Live AI was unavailable, so this is a pre-analyzed sample response. All quotes are still exact clauses from the agreement.'
    : 'Live AI was unavailable and this text could not be analyzed offline. Please check that the backend API keys are set, then try again.'

  return (
    <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-sky-600" />
      <p className="text-sm text-sky-800">
        <span className="font-semibold">Fallback mode.</span> {message}
      </p>
    </div>
  )
}
