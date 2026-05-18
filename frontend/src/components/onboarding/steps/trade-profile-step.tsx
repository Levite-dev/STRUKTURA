import { useState, useEffect, useCallback } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Wrench01Icon,
  Calendar01Icon,
  File01Icon,
  Tag01Icon,
} from "@hugeicons/core-free-icons"

const TRADES = [
  "General Contractor",
  "Electrician",
  "Plumber",
  "Carpenter",
  "Mason / Bricklayer",
  "Painter",
  "Roofer",
  "Welder",
  "HVAC Technician",
  "Landscaper",
]

type TradeProfileData = {
  trade: string
  yearsExperience: number
  bio: string
  expertiseTags: string[]
}

type TradeProfileStepProps = {
  initialData?: TradeProfileData
  onSave: (data: TradeProfileData) => void
  onNext?: (data: unknown) => void
  onSkip?: () => void
  isSaving?: boolean
  isSkipping?: boolean
}

export function TradeProfileStep({
  initialData,
  onSave,
  onNext,
  onSkip,
  isSaving,
  isSkipping,
}: TradeProfileStepProps) {
  const [trade, setTrade] = useState(initialData?.trade ?? "")
  const [yearsExperience, setYearsExperience] = useState(
    String(initialData?.yearsExperience ?? 0),
  )
  const [bio, setBio] = useState(initialData?.bio ?? "")
  const [tagInput, setTagInput] = useState("")
  const [expertiseTags, setExpertiseTags] = useState<string[]>(
    initialData?.expertiseTags ?? [],
  )

  useEffect(() => {
    if (initialData) {
      setTrade(initialData.trade ?? "")
      setYearsExperience(String(initialData.yearsExperience ?? 0))
      setBio(initialData.bio ?? "")
      setExpertiseTags(initialData.expertiseTags ?? [])
    }
  }, [initialData])

  const addTag = useCallback(() => {
    const trimmed = tagInput.trim()
    if (trimmed && !expertiseTags.includes(trimmed)) {
      setExpertiseTags((prev) => [...prev, trimmed])
      setTagInput("")
    }
  }, [tagInput, expertiseTags])

  const removeTag = (tag: string) => {
    setExpertiseTags((prev) => prev.filter((t) => t !== tag))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = {
      trade,
      yearsExperience: parseInt(yearsExperience, 10) || 0,
      bio,
      expertiseTags,
    }
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
          Trade Profile
        </h2>
        <p className="mt-1 text-sm text-brand-black/60">
          Tell us about your trade expertise and experience.
        </p>
      </div>

      <Field label="Primary trade" icon={Wrench01Icon}>
        <select
          value={trade}
          onChange={(e) => setTrade(e.target.value)}
          required
          className={inputClass}
        >
          <option value="">Select your trade…</option>
          {TRADES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Years of experience" icon={Calendar01Icon}>
        <input
          type="number"
          min="0"
          max="60"
          value={yearsExperience}
          onChange={(e) => setYearsExperience(e.target.value)}
          required
          className={inputClass}
        />
      </Field>

      <Field label="Bio" icon={File01Icon}>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Briefly describe your skills and experience…"
          rows={4}
          className={`${inputClass} resize-none`}
        />
      </Field>

      <div>
        <label className="text-sm font-semibold text-brand-black">
          Expertise tags
        </label>
        <div className="mt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand-black/40">
              <HugeiconsIcon icon={Tag01Icon} className="size-4" />
            </span>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag()
                }
              }}
              placeholder="e.g. Residential wiring, Tile installation"
              className={`${inputClass} pr-20`}
            />
            <button
              type="button"
              onClick={addTag}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded bg-brand-orange px-3 py-1 text-xs font-semibold text-white hover:bg-brand-orange-soft"
            >
              Add
            </button>
          </div>
        </div>
        {expertiseTags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {expertiseTags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-medium text-brand-orange"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-0.5 text-brand-orange/60 hover:text-brand-orange"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
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
  icon: typeof Wrench01Icon
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
