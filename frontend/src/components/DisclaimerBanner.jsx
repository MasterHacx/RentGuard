import { Scale } from 'lucide-react'

// Persistent non-lawyer guardrail. Always visible, never dismissable.
export default function DisclaimerBanner() {
  return (
    <div className="border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-7xl items-center gap-2.5 px-4 py-2.5 sm:px-6">
        <Scale className="h-4 w-4 shrink-0 text-amber-600" />
        <p className="text-xs font-medium text-amber-800 sm:text-sm">
          <span className="font-bold">Not legal advice.</span> RentGuard explains
          clauses in plain English to help you ask better questions. Consult a
          qualified lawyer for disputes or before making any decision.
        </p>
      </div>
    </div>
  )
}
