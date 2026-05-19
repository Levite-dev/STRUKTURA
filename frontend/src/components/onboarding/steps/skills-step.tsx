import { useState, useEffect, useCallback } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Tag01Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons"

type SkillsData = {
  skills: string[]
  yearsExperience: number
}

type SkillsStepProps = {
  initialData?: SkillsData
  onSave: (data: SkillsData) => void
  onNext?: (data: unknown) => void
  onSkip?: () => void
  isSaving?: boolean
  isSkipping?: boolean
}

const COMMON_SKILLS = [
  "Carpentry",
  "Electrical Work",
  "Plumbing",
  "Masonry",
  "Painting",
  "Welding",
  "Roofing",
  "Tiling",
  "HVAC",
  "Landscaping",
  "Project Management",
  "AutoCAD",
  "Blueprint Reading",
  "Safety Compliance",
]

export function SkillsStep({ initialData, onSave, onNext, onSkip, isSaving, isSkipping }: SkillsStepProps) {
  const [skills, setSkills] = useState<string[]>(initialData?.skills ?? [])
  const [yearsExperience, setYearsExperience] = useState(
    String(initialData?.yearsExperience ?? 0),
  )
  const [skillInput, setSkillInput] = useState("")

  useEffect(() => {
    if (initialData) {
      setSkills(initialData.skills ?? [])
      setYearsExperience(String(initialData.yearsExperience ?? 0))
    }
  }, [initialData])

  const addSkill = useCallback(() => {
    const trimmed = skillInput.trim()
    if (trimmed && !skills.includes(trimmed)) {
      setSkills((prev) => [...prev, trimmed])
      setSkillInput("")
    }
  }, [skillInput, skills])

  const removeSkill = (skill: string) => {
    setSkills((prev) => prev.filter((s) => s !== skill))
  }

  const addCommonSkill = (skill: string) => {
    if (!skills.includes(skill)) {
      setSkills((prev) => [...prev, skill])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { skills, yearsExperience: parseInt(yearsExperience, 10) || 0 }
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
          Skills & Experience
        </h2>
        <p className="mt-1 text-sm text-brand-black/60">
          List your skills so employers can find you for the right jobs.
        </p>
      </div>

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

      <div>
        <label className="text-sm font-semibold text-brand-black">
          Your skills
        </label>
        <div className="mt-2 flex items-center gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand-black/40">
              <HugeiconsIcon icon={Tag01Icon} className="size-4" />
            </span>
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addSkill()
                }
              }}
              placeholder="e.g. Carpentry, Electrical work"
              className={`${inputClass} pr-20`}
            />
            <button
              type="button"
              onClick={addSkill}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded bg-brand-orange px-3 py-1 text-xs font-semibold text-white hover:bg-brand-orange-soft"
            >
              Add
            </button>
          </div>
        </div>

        {skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-full bg-brand-orange/10 px-3 py-1 text-xs font-medium text-brand-orange"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-0.5 text-brand-orange/60 hover:text-brand-orange"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-semibold text-brand-black">
          Quick-add common skills
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {COMMON_SKILLS.filter((s) => !skills.includes(s)).map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => addCommonSkill(skill)}
              className="rounded-full border border-brand-black/15 bg-white px-3 py-1.5 text-xs font-medium text-brand-black/70 transition-colors hover:border-brand-orange/40 hover:bg-brand-orange/5"
            >
              + {skill}
            </button>
          ))}
        </div>
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
  icon: typeof Calendar01Icon
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
