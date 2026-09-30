import { useEffect, useState } from 'react'
import {
  X,
  Zap,
  Sparkles,
  ShieldCheck,
  Check,
  KeyRound,
  Eye,
  EyeOff,
  ChevronDown,
} from 'lucide-react'

const PROVIDERS = {
  groq: {
    label: 'Groq',
    tagline: 'Blazing-fast inference',
    Icon: Zap,
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'LLaMA 3.3 70B', tag: 'Recommended · 280 T/s' },
      { id: 'llama-3.1-8b-instant', name: 'LLaMA 3.1 8B', tag: 'Ultra Fast · 560 T/s' },
      { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', tag: 'Flagship Open-Weight · 500 T/s' },
      { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', tag: 'Blazing · 1000 T/s' },
      { id: 'qwen/qwen3.8-27b', name: 'Qwen 3.8 27B', tag: 'Balanced reasoning' },
    ],
  },
  gemini: {
    label: 'Google Gemini',
    tagline: 'Reliable multimodal model',
    Icon: Sparkles,
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tag: 'Default · Recommended' },
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', tag: 'High Quota Free Tier' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tag: 'Deep Legal Reasoning' },
    ],
  },
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
        checked ? 'bg-orange-500' : 'bg-slate-300'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function KeyInput({ label, placeholder, value, onChange, show, onToggleShow }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-600">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 pr-10 text-sm text-slate-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
        <button
          type="button"
          onClick={onToggleShow}
          aria-label={show ? 'Hide key' : 'Show key'}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

export default function SettingsModal({ open, settings, onSave, onClose }) {
  // Draft state so backdrop/ESC cancels without committing changes.
  const [draft, setDraft] = useState(settings)
  const [byokOpen, setByokOpen] = useState(false)
  const [showGroqKey, setShowGroqKey] = useState(false)
  const [showGeminiKey, setShowGeminiKey] = useState(false)

  // Reset the draft each time the modal opens.
  useEffect(() => {
    if (open) {
      setDraft(settings)
      setByokOpen(Boolean(settings.groqKey || settings.geminiKey))
      setShowGroqKey(false)
      setShowGeminiKey(false)
    }
  }, [open, settings])

  // Close on ESC.
  useEffect(() => {
    if (!open) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const provider = PROVIDERS[draft.provider] || PROVIDERS.groq
  const modelKey = draft.provider === 'gemini' ? 'geminiModel' : 'groqModel'
  const activeModel = draft[modelKey]

  const selectProvider = (key) => setDraft((d) => ({ ...d, provider: key }))
  const selectModel = (id) => setDraft((d) => ({ ...d, [modelKey]: id }))
  const setField = (field, val) => setDraft((d) => ({ ...d, [field]: val }))

  const hasByok = Boolean((draft.groqKey || '').trim() || (draft.geminiKey || '').trim())

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onMouseDown={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="AI Settings"
        onMouseDown={(e) => e.stopPropagation()}
        className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-orange-100/70 bg-white/90 shadow-2xl shadow-orange-500/10 backdrop-blur-xl"
      >
        <div className="flex items-start justify-between border-b border-slate-100 p-6 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">AI Settings</h2>
            <p className="text-sm text-slate-500">
              Choose which model analyzes your agreement.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close settings"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Provider selection */}
          <div className="mb-5">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              Active Provider
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PROVIDERS).map(([key, p]) => {
                const active = draft.provider === key
                const { Icon } = p
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => selectProvider(key)}
                    className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${
                      active
                        ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-200'
                        : 'border-slate-200 bg-white hover:border-orange-200'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                        active ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-slate-800">
                        {p.label}
                      </span>
                      <span className="block text-[11px] text-slate-500">{p.tagline}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Model picker */}
          <div className="mb-5">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-500">
              {provider.label} Model
            </label>
            <div className="flex flex-col gap-2">
              {provider.models.map((m) => {
                const active = activeModel === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => selectModel(m.id)}
                    className={`flex items-center justify-between rounded-xl border p-3 text-left transition ${
                      active
                        ? 'border-orange-400 bg-orange-50 ring-2 ring-orange-200'
                        : 'border-slate-200 bg-white hover:border-orange-200'
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-semibold text-slate-800">
                        {m.name}
                      </span>
                      <span className="block text-[11px] font-medium text-orange-600">
                        {m.tag}
                      </span>
                    </span>
                    {active && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-white">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* BYOK collapsible */}
          <div className="mb-5 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setByokOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-2 rounded-xl p-3 text-left transition hover:bg-slate-50"
            >
              <span className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-semibold text-slate-800">
                  Bring Your Own Key (BYOK)
                </span>
                {hasByok && (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    Active
                  </span>
                )}
              </span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition ${byokOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {byokOpen && (
              <div className="flex flex-col gap-3 border-t border-slate-100 p-3">
                <KeyInput
                  label="Groq API Key"
                  placeholder="gsk_..."
                  value={draft.groqKey || ''}
                  onChange={(v) => setField('groqKey', v)}
                  show={showGroqKey}
                  onToggleShow={() => setShowGroqKey((s) => !s)}
                />
                <KeyInput
                  label="Gemini API Key"
                  placeholder="AIza..."
                  value={draft.geminiKey || ''}
                  onChange={(v) => setField('geminiKey', v)}
                  show={showGeminiKey}
                  onToggleShow={() => setShowGeminiKey((s) => !s)}
                />
                <p className="text-[11px] leading-relaxed text-slate-500">
                  Leave blank to use RentGuard's managed server keys. Keys stay
                  strictly in your session.
                </p>
              </div>
            )}
          </div>

          {/* Fallback toggle */}
          <div className="mb-4 flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3">
            <div className="pr-4">
              <p className="text-sm font-semibold text-slate-800">
                Auto-fallback to secondary provider
              </p>
              <p className="text-[11px] text-slate-500">
                If the primary provider fails or rate-limits, automatically try the other one.
              </p>
            </div>
            <Toggle
              checked={draft.autoFallback}
              onChange={(v) => setField('autoFallback', v)}
            />
          </div>

          {/* Safe fallback indicator */}
          <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-xs text-emerald-800">
              <span className="font-bold">Safe Fallback Mode.</span> If both providers
              fail, RentGuard serves a verified offline cache of the sample analysis, so
              the demo never breaks and every quote stays grounded.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-slate-100 p-6 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(draft)}
            className="sunset-gradient rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-md shadow-orange-500/30 transition hover:brightness-105"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  )
}
