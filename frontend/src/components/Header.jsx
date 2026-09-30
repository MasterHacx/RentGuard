import { ShieldCheck, Settings, Zap, Sparkles } from 'lucide-react'

export default function Header({ activeProvider, activeModelName, onOpenSettings }) {
  const ProviderIcon = activeProvider === 'gemini' ? Sparkles : Zap
  const providerLabel = activeProvider === 'gemini' ? 'Gemini' : 'Groq'

  return (
    <header className="sticky top-0 z-30 border-b border-orange-200/50 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="sunset-gradient flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md shadow-orange-500/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="sunset-text text-xl font-extrabold tracking-tight">
              RentGuard
            </h1>
            <p className="hidden text-xs text-slate-500 sm:block">
              Understand your rental agreement before you sign
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="no-print group flex items-center gap-2 rounded-xl border border-orange-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-400 hover:ring-2 hover:ring-orange-200"
        >
          <Settings className="h-4 w-4 text-orange-500 transition group-hover:rotate-45" />
          <span className="hidden sm:inline">Settings</span>
          <span className="hidden items-center gap-1 rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-medium text-orange-700 md:inline-flex">
            <ProviderIcon className="h-3 w-3" />
            {providerLabel}
          </span>
        </button>
      </div>
    </header>
  )
}
