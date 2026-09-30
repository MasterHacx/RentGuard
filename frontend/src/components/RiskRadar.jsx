import { AlertTriangle, ShieldAlert, Info, Scale, Quote, Zap } from 'lucide-react'

const SEVERITY_STYLES = {
  High: {
    badge: 'bg-rose-50 text-rose-700 border-rose-300',
    accent: 'border-l-rose-500',
    Icon: ShieldAlert,
    iconColor: 'text-rose-600',
    actionRequired: true,
  },
  Medium: {
    badge: 'bg-amber-50 text-amber-700 border-amber-300',
    accent: 'border-l-amber-400',
    Icon: AlertTriangle,
    iconColor: 'text-amber-600',
    actionRequired: true,
  },
  Low: {
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
    accent: 'border-l-slate-400',
    Icon: Info,
    iconColor: 'text-slate-500',
    actionRequired: false,
  },
}

function RiskCard({ flag }) {
  const style = SEVERITY_STYLES[flag.severity] || SEVERITY_STYLES.Medium
  const { Icon } = style
  const showAction = style.actionRequired || flag.consult_lawyer

  return (
    <div
      className={`rounded-xl border border-l-4 border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md ${style.accent}`}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 shrink-0 ${style.iconColor}`} />
          <h4 className="text-sm font-bold text-slate-900">{flag.title}</h4>
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${style.badge}`}
        >
          {flag.severity}
        </span>
      </div>

      {showAction && (
        <div className="mb-2 inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-rose-600">
          <Zap className="h-3 w-3" />
          Action Required
        </div>
      )}

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
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
        Risk Radar
      </h3>

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
