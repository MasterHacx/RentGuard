import { ShieldCheck, Cpu } from 'lucide-react'

const MODEL_OPTIONS = [
  { value: 'auto', label: 'Auto (Groq → Gemini fallback)' },
  { value: 'llama-3.3-70b-versatile', label: 'Groq — LLaMA 3.3 70B' },
  { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
]

export default function Header({ model, onModelChange }) {
  return (
    <header className="sticky top-0 z-20 border-b border-orange-100/60 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-3">
          <div className="sunset-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md shadow-orange-500/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="sunset-text text-xl font-extrabold tracking-tight">
              RentGuard
            </h1>
            <p className="text-xs text-slate-500">
              Understand your rental agreement before you sign
            </p>
          </div>
        </div>

        <div className="no-print flex items-center gap-2">
          <label
            htmlFor="model-select"
            className="flex items-center gap-1.5 text-xs font-medium text-slate-500"
          >
            <Cpu className="h-4 w-4" />
            AI Model
          </label>
          <select
            id="model-select"
            value={model}
            onChange={(e) => onModelChange(e.target.value)}
            className="rounded-lg border border-orange-200 bg-white/80 px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm outline-none backdrop-blur-sm focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          >
            {MODEL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  )
}
