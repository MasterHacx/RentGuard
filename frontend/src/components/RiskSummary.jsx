import { ShieldAlert, ShieldCheck, AlertTriangle, Info, ListChecks } from 'lucide-react'

// Maps the overall risk picture to a status theme.
function getStatus(counts) {
  if (counts.High > 0) {
    return {
      label: 'High Attention Required',
      Icon: ShieldAlert,
      ring: 'border-rose-300',
      surface: 'bg-gradient-to-br from-rose-50 to-white',
      chip: 'bg-rose-600 text-white',
      iconWrap: 'bg-rose-100 text-rose-600',
    }
  }
  if (counts.Medium > 0) {
    return {
      label: 'Review Carefully',
      Icon: AlertTriangle,
      ring: 'border-amber-300',
      surface: 'bg-gradient-to-br from-amber-50 to-white',
      chip: 'bg-amber-500 text-white',
      iconWrap: 'bg-amber-100 text-amber-600',
    }
  }
  if (counts.Low > 0) {
    return {
      label: 'Minor Points to Note',
      Icon: Info,
      ring: 'border-slate-300',
      surface: 'bg-gradient-to-br from-slate-50 to-white',
      chip: 'bg-slate-600 text-white',
      iconWrap: 'bg-slate-200 text-slate-600',
    }
  }
  return {
    label: 'No Red Flags Found',
    Icon: ShieldCheck,
    ring: 'border-emerald-300',
    surface: 'bg-gradient-to-br from-emerald-50 to-white',
    chip: 'bg-emerald-600 text-white',
    iconWrap: 'bg-emerald-100 text-emerald-600',
  }
}

function StatTile({ label, value, tone }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/70 px-3 py-2 text-center">
      <div className={`text-2xl font-extrabold leading-none ${tone}`}>{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
    </div>
  )
}

export default function RiskSummary({ flags = [], clausesChecked = 0 }) {
  const counts = { High: 0, Medium: 0, Low: 0 }
  flags.forEach((f) => {
    if (counts[f.severity] !== undefined) counts[f.severity] += 1
  })
  const total = flags.length
  const status = getStatus(counts)
  const { Icon } = status

  // Proportions for the stacked health bar.
  const denom = total || 1
  const seg = [
    { key: 'High', w: (counts.High / denom) * 100, cls: 'bg-rose-500' },
    { key: 'Medium', w: (counts.Medium / denom) * 100, cls: 'bg-amber-400' },
    { key: 'Low', w: (counts.Low / denom) * 100, cls: 'bg-slate-400' },
  ]

  const subtitle =
    total > 0
      ? `${total} ${total === 1 ? 'risky term' : 'risky terms'} flagged for you to check`
      : 'Nothing jumped out, but always read carefully'

  return (
    <section
      className={`rounded-2xl border-2 p-5 shadow-lg shadow-orange-500/5 backdrop-blur-md ${status.ring} ${status.surface}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${status.iconWrap}`}
          >
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${status.chip}`}
              >
                {status.label}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-600">{subtitle}</p>
          </div>
        </div>

        {/* Stat tiles */}
        <div className="grid grid-cols-4 gap-2">
          <StatTile
            label="Checked"
            value={clausesChecked || total}
            tone="text-slate-700"
          />
          <StatTile label="High" value={counts.High} tone="text-rose-600" />
          <StatTile label="Medium" value={counts.Medium} tone="text-amber-600" />
          <StatTile label="Low" value={counts.Low} tone="text-slate-500" />
        </div>
      </div>

      {/* Stacked health bar */}
      <div className="mt-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <ListChecks className="h-3.5 w-3.5" />
          {clausesChecked ? `${clausesChecked} clauses scanned` : 'Risk breakdown'}
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
          {total === 0 ? (
            <div className="h-full w-full bg-emerald-400" />
          ) : (
            seg.map((s) =>
              s.w > 0 ? (
                <div
                  key={s.key}
                  className={`h-full ${s.cls}`}
                  style={{ width: `${s.w}%` }}
                  title={`${s.key}: ${counts[s.key]}`}
                />
              ) : null,
            )
          )}
        </div>
      </div>
    </section>
  )
}
