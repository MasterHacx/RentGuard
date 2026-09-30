import { FileText, Sparkles, Loader2, AlertTriangle } from 'lucide-react'

export default function InputPanel({
  text,
  onTextChange,
  onLoadSample,
  onAnalyze,
  loading,
  sampleLoading,
  warning,
}) {
  return (
    <section className="no-print glass-card flex flex-col rounded-2xl p-6 lg:sticky lg:top-24">
      <div className="mb-3 flex items-center gap-2">
        <FileText className="h-5 w-5 text-orange-600" />
        <h2 className="text-base font-bold text-slate-900">Your Agreement</h2>
      </div>

      <p className="mb-4 text-sm text-slate-500">
        Paste your rental or PG agreement below, or load a sample to see how it
        works.
      </p>

      <textarea
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder="Paste the full text of your rental / PG agreement here..."
        spellCheck={false}
        className="h-80 w-full resize-y rounded-xl border border-orange-100 bg-white/60 p-4 font-mono text-sm leading-relaxed text-slate-700 outline-none focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-200"
      />

      {warning && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-sm text-amber-800">{warning}</p>
        </div>
      )}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onLoadSample}
          disabled={loading || sampleLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-200 bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {sampleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          Load Sample PG Agreement
        </button>

        <button
          type="button"
          onClick={onAnalyze}
          disabled={loading}
          className="sunset-gradient inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-500/30 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Analyze Agreement
            </>
          )}
        </button>
      </div>

      <p className="mt-3 text-center text-xs text-slate-400">
        {text.length.toLocaleString()} characters
      </p>
    </section>
  )
}
