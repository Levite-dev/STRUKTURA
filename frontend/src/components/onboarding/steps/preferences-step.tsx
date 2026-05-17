import { useState, useEffect } from "react"

const CATEGORIES = [
  "Cement & Concrete",
  "Steel & Rebar",
  "Lumber & Wood",
  "Roofing & Gutters",
  "Paint & Finishes",
  "Electrical Supplies",
  "Plumbing & Pipes",
  "Tools & Equipment",
  "Safety Gear",
  "Flooring & Tiles",
]

type PreferencesData = {
  preferredCategories: string[]
}

type PreferencesStepProps = {
  initialData?: PreferencesData
  onSave: (data: PreferencesData) => void
}

export function PreferencesStep({ initialData, onSave }: PreferencesStepProps) {
  const [selected, setSelected] = useState<string[]>(
    initialData?.preferredCategories ?? [],
  )

  useEffect(() => {
    if (initialData?.preferredCategories) {
      setSelected(initialData.preferredCategories)
    }
  }, [initialData])

  const toggle = (cat: string) => {
    setSelected((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({ preferredCategories: selected })
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-brand-black">
          Your Preferences
        </h2>
        <p className="mt-1 text-sm text-brand-black/60">
          Select the categories you&apos;re most interested in. This helps us
          tailor your marketplace experience.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => {
          const isActive = selected.includes(cat)
          return (
            <button
              key={cat}
              type="button"
              onClick={() => toggle(cat)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-brand-orange bg-brand-orange/10 text-brand-orange"
                  : "border-brand-black/15 bg-white text-brand-black/70 hover:border-brand-orange/40"
              }`}
            >
              {cat}
            </button>
          )
        })}
      </div>

      {selected.length === 0 && (
        <p className="text-xs text-brand-black/40">
          Select at least one category to continue.
        </p>
      )}
    </form>
  )
}
