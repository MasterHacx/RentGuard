import { AlertTriangle, ShieldAlert, Info, Scale, Quote } from 'lucide-react'

const SEVERITY_STYLES = {
  High: {
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    card: 'border-rose-200',
    Icon: ShieldAlert,
    iconColor: 'text-rose-600',
  },
  Medium: {
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    card: 'border-amber-200',
    Icon: AlertTriangle,
    iconColor: 'text-amber-600',
  },
  Low: {
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    card: 'border-emerald-200',
    Icon: Info,
    iconColor: 'text-emerald-600',
  },
}

function RiskCard({ flag }) {
  const style = SEVERITY_STYLES[flag.severity] || SEVERITY_STYLES.Medium
  const { Icon } = style

  return (
    <div className={`rounded-xl border bg-white p-4 shadow-sm ${style.card}`}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${style.iconColor}`} />
          <h4 className="text-sm font-bold text-slate-900">{flag.title}</h4>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${style.badge}`}
        >
          {flag.severity}
        </span>
      </div>

      {flag.quote && (
        <blockquote className="mb-3 flex gap-2 rounded-lg bg-slate-50 p-3 text-sm italic text-slate-700">
          <Quote className="h-4 w-4 shrink-0 text-slate-400" />
          <span>“{flag.quote}”</span>
        </blockquote>
      )}

      <p className="text-sm text-slate-700">{flag.explanation}</p>

      {flag.recommendation && (
        <p className="mt-2 text-sm text-slate-600">
          <span className="font-semibold text-slate-800">What you can do: </span>
          {flag.recommendation}
        </p>
      )}

      {flag.consult_lawyer && (
        <div className="mt-3 flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2">
          <Scale className="h-4 w-4 shrink-0 text-indigo-600" />
          <span className="text-xs font-medium text-indigo-800">
            This one can seriously affect your money or rights — worth asking a
            lawyer before you sign.
          </span>
        </div>
      )}
    </div>
  )
}

export default function RiskRadar({ flags }) {
  const counts = { High: 0, Medium: 0, Low: 0 }
  ;(flags || []).forEach((f) => {
    if (counts[f.severity] !== undefined) counts[f.severity] += 1
  })

  return (
    <section>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Risk Radar
        </h3>
        {flags && flags.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="rounded-full bg-rose-100 px-2 py-0.5 text-rose-700">
              {counts.High} High
            </span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700">
              {counts.Medium} Medium
            </span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
              {counts.Low} Low
            </span>
          </div>
        )}
      </div>

      {!flags || flags.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 text-center text-sm text-slate-500">
          No risky clauses were flagged. That doesn't guarantee the agreement is
          safe — read it carefully and ask a lawyer if unsure.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {flags.map((flag, i) => (
            <RiskCard key={i} flag={flag} />
          ))}
        </div>
      )}
    </section>
  )
}
