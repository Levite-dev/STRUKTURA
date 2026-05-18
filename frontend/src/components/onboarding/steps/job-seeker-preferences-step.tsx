import { useState, useEffect } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Location01Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons"

const LOCATIONS = [
  "Metro Manila",
  "Cebu",
  "Davao",
  "Pampanga",
  "Laguna",
  "Cavite",
  "Bulacan",
  "Rizal",
  "Batangas",
  "Iloilo",
]

type JobSeekerPreferencesData = {
  preferredLocations: string[]
  availableFrom: string
}

type JobSeekerPreferencesStepProps = {
  initialData?: JobSeekerPreferencesData
  onSave: (data: JobSeekerPreferencesData) => void
  onNext?: (data: unknown) => void
  onSkip?: () => void
  isSaving?: boolean
  isSkipping?: boolean
}

export function JobSeekerPreferencesStep({
  initialData,
  onSave,
  onNext,
  onSkip,
  isSaving,
  isSkipping,
}: JobSeekerPreferencesStepProps) {
  const [preferredLocations, setPreferredLocations] = useState<string[]>(
    initialData?.preferredLocations ?? [],
  )
  const [availableFrom, setAvailableFrom] = useState(
    initialData?.availableFrom ?? "",
  )

  useEffect(() => {
    if (initialData) {
      setPreferredLocations(initialData.preferredLocations ?? [])
      setAvailableFrom(initialData.availableFrom ?? "")
    }
  }, [initialData])

  const toggleLocation = (loc: string) => {
    setPreferredLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { preferredLocations, availableFrom }
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
          Job Preferences
        </h2>
        <p className="mt-1 text-sm text-brand-black/60">
          Tell employers where and when you&apos;re available to work.
        </p>
      </div>

      <Field label="Preferred work locations" icon={Location01Icon}>
        <div className="flex flex-wrap gap-2">
          {LOCATIONS.map((loc) => {
            const isActive = preferredLocations.includes(loc)
            return (
              <button
                key={loc}
                type="button"
                onClick={() => toggleLocation(loc)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                    : "border-brand-black/15 bg-white text-brand-black/70 hover:border-brand-orange/40"
                }`}
              >
                {loc}
              </button>
            )
          })}
        </div>
      </Field>

      <Field label="Available from" icon={Calendar01Icon}>
        <input
          type="date"
          value={availableFrom}
          onChange={(e) => setAvailableFrom(e.target.value)}
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
  icon: typeof Location01Icon
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
