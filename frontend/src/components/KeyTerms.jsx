import { Banknote, Wallet, Lock, CalendarClock, Wrench } from 'lucide-react'

const TERM_META = [
  { key: 'rent', label: 'Monthly Rent', Icon: Banknote, accent: 'text-emerald-600 bg-emerald-50' },
  { key: 'security_deposit', label: 'Security Deposit', Icon: Wallet, accent: 'text-indigo-600 bg-indigo-50' },
  { key: 'lock_in_period', label: 'Lock-in Period', Icon: Lock, accent: 'text-rose-600 bg-rose-50' },
  { key: 'notice_period', label: 'Notice Period', Icon: CalendarClock, accent: 'text-amber-600 bg-amber-50' },
  { key: 'repairs_maintenance', label: 'Maintenance & Repairs', Icon: Wrench, accent: 'text-sky-600 bg-sky-50' },
]

function TermCard({ label, Icon, accent, data }) {
  const value = data?.value || 'Not specified'
  const quote = data?.quote
  const notes = data?.notes

  return (
    <div className="glass-card flex flex-col rounded-xl p-4">
      <div className="mb-2 flex items-center gap-2">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accent}`}>
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {label}
        </span>
      </div>

      <p className="text-lg font-bold leading-snug text-slate-900">{value}</p>

      {quote ? (
        <blockquote className="mt-2 border-l-2 border-slate-300 pl-2 text-xs italic text-slate-500">
          “{quote}”
        </blockquote>
      ) : (
        <p className="mt-2 text-xs text-slate-400">No exact clause found in the text.</p>
      )}

      {notes && <p className="mt-2 text-xs text-slate-600">{notes}</p>}
    </div>
  )
}

export default function KeyTerms({ keyTerms }) {
  if (!keyTerms) return null
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-500">
        Key Terms
      </h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {TERM_META.map(({ key, label, Icon, accent }) => (
          <TermCard
            key={key}
            label={label}
            Icon={Icon}
            accent={accent}
            data={keyTerms[key]}
          />
        ))}
      </div>
    </section>
  )
}
