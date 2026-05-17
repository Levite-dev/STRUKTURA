import { useState, useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  FileLinkIcon,
  ShieldCheck,
} from "@hugeicons/core-free-icons"

type DocumentsData = {
  licenseUrl?: string
  permitUrl?: string
  insuranceUrl?: string
}

type DocumentsStepProps = {
  role: "CONTRACTOR" | "SUPPLIER"
  initialData?: DocumentsData
  onSave: (data: DocumentsData) => void
}

export function DocumentsStep({ role, initialData, onSave }: DocumentsStepProps) {
  const [licenseUrl, setLicenseUrl] = useState(initialData?.licenseUrl ?? "")
  const [permitUrl, setPermitUrl] = useState(initialData?.permitUrl ?? "")
  const [insuranceUrl, setInsuranceUrl] = useState(
    initialData?.insuranceUrl ?? "",
  )

  useEffect(() => {
    if (initialData) {
      setLicenseUrl(initialData.licenseUrl ?? "")
      setPermitUrl(initialData.permitUrl ?? "")
      setInsuranceUrl(initialData.insuranceUrl ?? "")
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ licenseUrl, permitUrl, insuranceUrl })
  }

  const isContractor = role === "CONTRACTOR"

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-brand-black">
          Documents & Verification
        </h2>
        <p className="mt-1 text-sm text-brand-black/60">
          {isContractor
            ? "Upload links to your professional licenses and permits. This builds trust with potential clients."
            : "Provide links to your business registration and permits. Verified sellers get a badge on their storefront."}
        </p>
      </div>

      <Field label="Professional license / DTI registration" icon={FileLinkIcon}>
        <input
          type="url"
          value={licenseUrl}
          onChange={(e) => setLicenseUrl(e.target.value)}
          placeholder="https://drive.google.com/..."
          className={inputClass}
        />
      </Field>

      <Field label="Business permit / Mayor's permit" icon={ShieldCheck}>
        <input
          type="url"
          value={permitUrl}
          onChange={(e) => setPermitUrl(e.target.value)}
          placeholder="https://drive.google.com/..."
          className={inputClass}
        />
      </Field>

      <Field label="Insurance certificate (optional)" icon={ShieldCheck}>
        <input
          type="url"
          value={insuranceUrl}
          onChange={(e) => setInsuranceUrl(e.target.value)}
          placeholder="https://drive.google.com/..."
          className={inputClass}
        />
      </Field>

      <div className="rounded-md border border-brand-orange/20 bg-brand-orange/5 px-4 py-3 text-xs text-brand-black/70">
        Tip: Upload your documents to Google Drive, Dropbox, or any cloud
        storage and paste the shareable link here. Your account will be reviewed
        within 1–2 business days.
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
  icon: typeof FileLinkIcon
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
