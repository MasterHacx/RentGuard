import { useEffect, useState } from 'react'
import { ClipboardList, Printer } from 'lucide-react'

export default function Checklist({ items }) {
  const [checked, setChecked] = useState([])

  // Reset checkbox state whenever a new analysis arrives.
  useEffect(() => {
    setChecked((items || []).map(() => false))
  }, [items])

  if (!items || items.length === 0) return null

  const toggle = (i) => {
    setChecked((prev) => {
      const next = [...prev]
      next[i] = !next[i]
      return next
    })
  }

  const doneCount = checked.filter(Boolean).length
  const pct = items.length ? Math.round((doneCount / items.length) * 100) : 0

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500">
          <ClipboardList className="h-4 w-4" />
          Pre-Signing Checklist
        </h3>
        <button
          type="button"
          onClick={() => window.print()}
          className="no-print inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
        >
          <Printer className="h-3.5 w-3.5" />
          Print / Save Summary
        </button>
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="mb-3">
          <div className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-600">
            <span>
              {doneCount} of {items.length} tasks completed{' '}
              <span className="text-slate-400">({pct}%)</span>
            </span>
            {pct === 100 && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">
                All done 🎉
              </span>
            )}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <ul className="flex flex-col gap-1">
          {items.map((item, i) => {
            const label = typeof item === 'string' ? item : item.item
            return (
              <li key={i}>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg p-2 transition hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={checked[i] || false}
                    onChange={() => toggle(i)}
                    className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span
                    className={`text-sm ${
                      checked[i] ? 'text-slate-400 line-through' : 'text-slate-700'
                    }`}
                  >
                    {label}
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
