import { useState, useEffect, useCallback } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Image01Icon,
  Link01Icon,
  Add01Icon,
  Delete02Icon,
} from "@hugeicons/core-free-icons"

type PortfolioItem = {
  title: string
  imageUrl: string
  projectUrl: string
}

type PortfolioData = {
  items: PortfolioItem[]
  portfolioUrl?: string
}

type PortfolioStepProps = {
  initialData?: PortfolioData
  onSave: (data: PortfolioData) => void
  onNext?: (data: unknown) => void
  onSkip?: () => void
  isSaving?: boolean
  isSkipping?: boolean
}

export function PortfolioStep({ initialData, onSave, onNext, onSkip, isSaving, isSkipping }: PortfolioStepProps) {
  const [items, setItems] = useState<PortfolioItem[]>(
    initialData?.items ?? [],
  )
  const [portfolioUrl, setPortfolioUrl] = useState(
    initialData?.portfolioUrl ?? "",
  )

  useEffect(() => {
    if (initialData) {
      setItems(initialData.items ?? [])
      setPortfolioUrl(initialData.portfolioUrl ?? "")
    }
  }, [initialData])

  const addItem = useCallback(() => {
    setItems((prev) => [
      ...prev,
      { title: "", imageUrl: "", projectUrl: "" },
    ])
  }, [])

  const updateItem = (index: number, field: keyof PortfolioItem, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const data = { items, portfolioUrl }
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
          Portfolio & Past Projects
        </h2>
        <p className="mt-1 text-sm text-brand-black/60">
          Showcase your best work. Clients are more likely to hire contractors
          with visible project history.
        </p>
      </div>

      <Field label="Portfolio website (optional)" icon={Link01Icon}>
        <input
          type="url"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          placeholder="https://your-portfolio.com"
          className={inputClass}
        />
      </Field>

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-brand-black">
            Project entries
          </label>
          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-orange hover:underline"
          >
                  <HugeiconsIcon icon={Add01Icon} className="size-3.5" />
            Add project
          </button>
        </div>

        {items.length === 0 && (
          <div className="mt-4 rounded-md border border-dashed border-brand-black/20 py-8 text-center text-sm text-brand-black/40">
            No projects added yet. Click &ldquo;Add project&rdquo; to get
            started.
          </div>
        )}

        <div className="mt-3 space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-md border border-brand-black/10 bg-white p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-black/60">
                  Project {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="text-brand-black/30 hover:text-destructive"
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                </button>
              </div>

              <input
                type="text"
                value={item.title}
                onChange={(e) => updateItem(index, "title", e.target.value)}
                placeholder="Project title (e.g. 2-Storey House in QC)"
                className={inputClass}
              />

              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand-black/40">
                  <HugeiconsIcon icon={Image01Icon} className="size-4" />
                </span>
                <input
                  type="url"
                  value={item.imageUrl}
                  onChange={(e) => updateItem(index, "imageUrl", e.target.value)}
                  placeholder="Cover photo URL"
                  className={`${inputClass} pl-10`}
                />
              </div>

              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand-black/40">
                  <HugeiconsIcon icon={Link01Icon} className="size-4" />
                </span>
                <input
                  type="url"
                  value={item.projectUrl}
                  onChange={(e) => updateItem(index, "projectUrl", e.target.value)}
                  placeholder="Project detail page URL"
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>
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
  icon: typeof Link01Icon
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
