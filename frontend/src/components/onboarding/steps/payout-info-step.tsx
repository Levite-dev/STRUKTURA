import { useState, useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  BankIcon,
  UserIcon,
  CreditCardIcon,
} from "@hugeicons/core-free-icons"

type PayoutInfoData = {
  bankName: string
  acctName: string
  acctNo: string
}

type PayoutInfoStepProps = {
  initialData?: PayoutInfoData
  onSave: (data: PayoutInfoData) => void
  onNext?: (data: unknown) => void
  onSkip?: () => void
  isSaving?: boolean
  isSkipping?: boolean
}

export function PayoutInfoStep({ initialData, onSave, onNext, onSkip, isSaving, isSkipping }: PayoutInfoStepProps) {
  const [bankName, setBankName] = useState(initialData?.bankName ?? "")
  const [acctName, setAcctName] = useState(initialData?.acctName ?? "")
  const [acctNo, setAcctNo] = useState(initialData?.acctNo ?? "")

  useEffect(() => {
    if (initialData) {
      setBankName(initialData.bankName ?? "")
      setAcctName(initialData.acctName ?? "")
      setAcctNo(initialData.acctNo ?? "")
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { bankName, acctName, acctNo }
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
          Payout Information
        </h2>
        <p className="mt-1 text-sm text-brand-black/60">
          Where should we send your earnings? This info is encrypted and
          never shared with buyers.
        </p>
      </div>

      <Field label="Bank name" icon={BankIcon}>
        <input
          type="text"
          value={bankName}
          onChange={(e) => setBankName(e.target.value)}
          placeholder="BDO, BPI, UnionBank…"
          required
          className={inputClass}
        />
      </Field>

      <Field label="Account name" icon={UserIcon}>
        <input
          type="text"
          value={acctName}
          onChange={(e) => setAcctName(e.target.value)}
          placeholder="Maria Santos"
          required
          className={inputClass}
        />
      </Field>

      <Field label="Account number" icon={CreditCardIcon}>
        <input
          type="text"
          value={acctNo}
          onChange={(e) => setAcctNo(e.target.value)}
          placeholder="1234-5678-9012"
          required
          className={inputClass}
        />
      </Field>

      <div className="rounded-md border border-brand-orange/20 bg-brand-orange/5 px-4 py-3 text-xs text-brand-black/70">
        Payouts are processed every two weeks. Minimum payout threshold is
        ₱5,000.
      </div>

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
  icon: typeof BankIcon
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
