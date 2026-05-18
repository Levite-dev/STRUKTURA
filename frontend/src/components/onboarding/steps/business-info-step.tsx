import { useState, useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Building01Icon,
  Location01Icon,
  File01Icon,
  HashtagIcon,
} from "@hugeicons/core-free-icons"

type BusinessInfoData = {
  businessName: string
  businessAddress: string
  businessRegNo?: string
  taxId?: string
}

type BusinessInfoStepProps = {
  initialData?: BusinessInfoData
  onSave: (data: BusinessInfoData) => void
  onNext?: (data: unknown) => void
  onSkip?: () => void
  isSaving?: boolean
  isSkipping?: boolean
}

export function BusinessInfoStep({
  initialData,
  onSave,
  onNext,
  onSkip,
  isSaving,
  isSkipping,
}: BusinessInfoStepProps) {
  const [businessName, setBusinessName] = useState(
    initialData?.businessName ?? "",
  )
  const [businessAddress, setBusinessAddress] = useState(
    initialData?.businessAddress ?? "",
  )
  const [businessRegNo, setBusinessRegNo] = useState(
    initialData?.businessRegNo ?? "",
  )
  const [taxId, setTaxId] = useState(initialData?.taxId ?? "")

  useEffect(() => {
    if (initialData) {
      setBusinessName(initialData.businessName ?? "")
      setBusinessAddress(initialData.businessAddress ?? "")
      setBusinessRegNo(initialData.businessRegNo ?? "")
      setTaxId(initialData.taxId ?? "")
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { businessName, businessAddress, businessRegNo, taxId }
    if (onNext) {
      void onNext(data)
    } else {
      onSave(data)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-brand-black">
          Business Information
        </h2>
        <p className="mt-1 text-sm text-brand-black/60">
          Tell us about your business so buyers can find and trust you.
        </p>
      </div>

      <Field label="Business name" icon={Building01Icon}>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="Santos Hardware Supply"
          required
          className={inputClass}
        />
      </Field>

      <Field label="Business address" icon={Location01Icon}>
        <input
          type="text"
          value={businessAddress}
          onChange={(e) => setBusinessAddress(e.target.value)}
          placeholder="456 Commerce St, Makati City"
          required
          className={inputClass}
        />
      </Field>

      <Field label="Business registration no." icon={File01Icon}>
        <input
          type="text"
          value={businessRegNo}
          onChange={(e) => setBusinessRegNo(e.target.value)}
          placeholder="DTI-2024-XXXXX"
          className={inputClass}
        />
      </Field>

      <Field label="Tax ID (TIN)" icon={HashtagIcon}>
        <input
          type="text"
          value={taxId}
          onChange={(e) => setTaxId(e.target.value)}
          placeholder="123-456-789-000"
          className={inputClass}
        />
      </Field>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save & Continue'}
        </button>
        {onSkip && (
          <button
            type="button"
            onClick={() => void onSkip()}
            disabled={isSkipping}
            className="rounded-lg border px-4 py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {isSkipping ? 'Skipping…' : 'Skip'}
          </button>
        )}
      </div>
    </form>
  )
}

function Field({
  label,
  icon,
  children,
}: {
  label: string
  icon: typeof Building01Icon
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="text-sm font-semibold text-brand-black">{label}</label>
      <div className="relative mt-2">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand-black/40">
          <HugeiconsIcon icon={icon} className="size-4" />
        </span>
        {children}
      </div>
    </div>
  )
}

const inputClass =
  "w-full rounded-md border border-brand-black/15 bg-white px-4 py-3 pl-10 text-sm text-brand-black placeholder:text-brand-black/40 outline-none transition-shadow focus:border-brand-orange/40 focus:ring-2 focus:ring-brand-orange/20"
