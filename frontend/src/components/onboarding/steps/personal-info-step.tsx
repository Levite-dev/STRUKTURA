import { useState, useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserIcon,
  Call02Icon,
  Location01Icon,
  CityIcon,
  Home03Icon,
} from "@hugeicons/core-free-icons"

type PersonalInfoData = {
  fullName?: string
  phone?: string
  region?: string
  city?: string
  address?: string
}

type PersonalInfoStepProps = {
  initialData?: PersonalInfoData
  onSave: (data: PersonalInfoData) => void
}

export function PersonalInfoStep({ initialData, onSave }: PersonalInfoStepProps) {
  const [fullName, setFullName] = useState(initialData?.fullName ?? "")
  const [phone, setPhone] = useState(initialData?.phone ?? "")
  const [region, setRegion] = useState(initialData?.region ?? "")
  const [city, setCity] = useState(initialData?.city ?? "")
  const [address, setAddress] = useState(initialData?.address ?? "")

  useEffect(() => {
    if (initialData) {
      setFullName(initialData.fullName ?? "")
      setPhone(initialData.phone ?? "")
      setRegion(initialData.region ?? "")
      setCity(initialData.city ?? "")
      setAddress(initialData.address ?? "")
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ fullName, phone, region, city, address })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-brand-black">
          Personal Information
        </h2>
        <p className="mt-1 text-sm text-brand-black/60">
          Tell us a bit about yourself so we can personalize your experience.
        </p>
      </div>

      <Field label="Full name" icon={UserIcon}>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Maria Santos"
          required
          className={inputClass}
        />
      </Field>

      <Field label="Phone number" icon={Call02Icon}>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+63 912 345 6789"
          className={inputClass}
        />
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Region" icon={Location01Icon}>
          <input
            type="text"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="Metro Manila"
            className={inputClass}
          />
        </Field>

        <Field label="City" icon={CityIcon}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Quezon City"
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Address" icon={Home03Icon}>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="123 Main St, Brgy. San Antonio"
          className={inputClass}
        />
      </Field>
    </form>
  )
}

function Field({
  label,
  icon,
  children,
}: {
  label: string
  icon: typeof Call02Icon
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
