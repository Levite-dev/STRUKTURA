import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { motion, AnimatePresence } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  ArrowDown01Icon,
  CheckmarkCircle02Icon,
  Image01Icon,
  Camera01Icon,
  Location01Icon,
  Calendar01Icon,
  Shield01Icon,
  Timer02Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { Reveal } from "@/components/motion/primitives"
import { serviceCategories, type ServiceCategory } from "@/components/services/services-data"

const budgetRanges = [
  "Under ₱25k",
  "₱25k – ₱100k",
  "₱100k – ₱500k",
  "₱500k – ₱2M",
  "₱2M+",
  "Not sure yet",
] as const

const startWindows = [
  "ASAP — within a week",
  "In the next 2–4 weeks",
  "1–3 months out",
  "Just exploring",
] as const

type FormState = {
  category: ServiceCategory | ""
  title: string
  description: string
  location: string
  startWindow: string
  budget: string
  attachments: { name: string; size: string }[]
}

const initial: FormState = {
  category: "",
  title: "",
  description: "",
  location: "",
  startWindow: "",
  budget: "",
  attachments: [],
}

export function PostJobPage({
  initialCategory,
}: {
  initialCategory?: ServiceCategory
}) {
  const [form, setForm] = useState<FormState>(() => ({
    ...initial,
    category: initialCategory ?? "",
  }))
  const [submitted, setSubmitted] = useState(false)

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }))

  return (
    <main className="bg-background">
      <Hero />

      <section className="bg-[#f5f3ef] pt-16 pb-16 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <AnimatePresence mode="wait">
            {submitted ? (
              <Confirmation key="done" form={form} />
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.3 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="grid gap-5 lg:grid-cols-[1.4fr_1fr]"
              >
                <JobForm
                  form={form}
                  update={update}
                  onSubmit={() => setSubmitted(true)}
                />
                <PreviewCard form={form} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  )
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-brand-ink pt-32 pb-20 text-white sm:pt-40 lg:pt-44">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-25"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1920&q=80&auto=format&fit=crop')",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-brand-ink/95 via-brand-ink/85 to-brand-ink"
      />
      <Reveal className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-orange/40 bg-brand-orange/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-brand-orange uppercase">
          <span className="size-1.5 rounded-none bg-brand-orange" />
          Post a Job
        </span>
        <h1 className="mt-5 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          Describe your job. Get up to 5 bids in 24 hours.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/70">
          Tell us what you need built. Verified contractors will reply with
          priced bids you can compare side-by-side.
        </p>
      </Reveal>
    </section>
  )
}

function JobForm({
  form,
  update,
  onSubmit,
}: {
  form: FormState
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void
  onSubmit: () => void
}) {
  const valid =
    form.category && form.title.length > 5 && form.description.length > 20 && form.location

  return (
    <form
      className="rounded-md border border-brand-black/10 bg-white p-7 shadow-[0_12px_30px_-15px_rgba(15,16,15,0.18)] sm:p-9"
      onSubmit={(e) => {
        e.preventDefault()
        if (!valid) return
        onSubmit()
      }}
    >
      <div className="space-y-7">
        <Field label="What service do you need?" required>
          <Select
            value={form.category}
            onChange={(v) => update("category", v as FormState["category"])}
            placeholder="Choose a trade"
            options={serviceCategories.map((c) => c.name)}
          />
        </Field>

        <Field label="Job title" hint="A short headline contractors see first.">
          <Input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Re-roof a 120 sqm two-storey house"
            maxLength={80}
          />
        </Field>

        <Field
          label="Describe the job"
          hint="What's the scope, materials, and constraints? More detail = more accurate bids."
        >
          <Textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Existing roof is rusted GI sheet. Need full re-roof in colored steel, with new gutters and downspouts. Ladder access OK from carport side…"
            rows={6}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Project location" required>
            <InputWithIcon
              icon={Location01Icon}
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
              placeholder="Brgy / City"
            />
          </Field>
          <Field label="Target start">
            <Select
              value={form.startWindow}
              onChange={(v) => update("startWindow", v)}
              placeholder="When do you want to start?"
              options={[...startWindows]}
              icon={Calendar01Icon}
            />
          </Field>
        </div>

        <Field label="Budget range">
          <div className="flex flex-wrap gap-2">
            {budgetRanges.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => update("budget", b)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                  form.budget === b
                    ? "border-brand-orange bg-brand-orange text-white"
                    : "border-brand-black/15 bg-white text-brand-black/70 hover:border-brand-orange/40 hover:text-brand-orange"
                )}
              >
                {b}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Photos or sketches (optional)" hint="Up to 5 images. Helps contractors price accurately.">
          <PhotoPlaceholder
            attachments={form.attachments}
            onAdd={() =>
              update("attachments", [
                ...form.attachments,
                {
                  name: `IMG_${(form.attachments.length + 1).toString().padStart(4, "0")}.jpg`,
                  size: "2.4 MB",
                },
              ])
            }
            onRemove={(i) =>
              update(
                "attachments",
                form.attachments.filter((_, idx) => idx !== i)
              )
            }
          />
        </Field>
      </div>

      <button
        type="submit"
        disabled={!valid}
        className="mt-9 inline-flex w-full items-center justify-center gap-2 rounded-none bg-brand-orange py-4 text-xs font-semibold tracking-[0.2em] text-white uppercase transition-colors hover:bg-brand-orange-soft disabled:cursor-not-allowed disabled:opacity-50"
      >
        Post job · Get up to 5 bids
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
      </button>
      <p className="mt-3 text-center text-[11px] text-brand-black/50">
        Free to post. You only pay when you hire — and through escrow only.
      </p>
    </form>
  )
}

function PreviewCard({ form }: { form: FormState }) {
  const filled = form.title || form.description || form.category
  return (
    <aside className="lg:sticky lg:top-24 lg:h-fit">
      <div className="rounded-md border border-brand-black/10 bg-white p-6 shadow-[0_12px_30px_-15px_rgba(15,16,15,0.18)]">
        <p className="text-[10px] font-bold tracking-[0.3em] text-brand-orange uppercase">
          Live preview · what contractors see
        </p>
        <div className="mt-4 rounded-md border border-brand-black/10 bg-[#f9f7f3] p-5">
          <div className="flex items-center gap-2">
            <span className="rounded-none bg-brand-orange/10 px-2.5 py-0.5 text-[10px] font-semibold tracking-wider text-brand-orange uppercase">
              {form.category || "Trade"}
            </span>
            {form.location && (
              <span className="inline-flex items-center gap-1 text-[11px] text-brand-black/70">
                <HugeiconsIcon
                  icon={Location01Icon}
                  className="size-3 text-brand-orange"
                />
                {form.location}
              </span>
            )}
          </div>
          <h3 className="mt-3 text-base leading-snug font-bold text-brand-black">
            {form.title || "Your job title appears here"}
          </h3>
          <p className="mt-2 line-clamp-4 text-xs leading-relaxed text-brand-black/75">
            {form.description ||
              "Your description will show here. Contractors will use this to price their bids — be specific about scope, materials, and constraints."}
          </p>
          {(form.startWindow || form.budget) && (
            <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold text-brand-black/75">
              {form.startWindow && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-1">
                  <HugeiconsIcon icon={Timer02Icon} className="size-3" />
                  {form.startWindow}
                </span>
              )}
              {form.budget && (
                <span className="rounded-full bg-white px-2 py-1">
                  Budget · {form.budget}
                </span>
              )}
            </div>
          )}
          {form.attachments.length > 0 && (
            <p className="mt-3 text-[10px] text-brand-black/50">
              {form.attachments.length} attachment
              {form.attachments.length === 1 ? "" : "s"}
            </p>
          )}
        </div>

        <ul className="mt-6 space-y-3 text-[12px] text-brand-black/70">
          <li className="flex items-start gap-2">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="mt-0.5 size-3.5 shrink-0 text-brand-orange"
            />
            3 contractors typically respond within 24 hours in this category
          </li>
          <li className="flex items-start gap-2">
            <HugeiconsIcon
              icon={Shield01Icon}
              className="mt-0.5 size-3.5 shrink-0 text-brand-orange"
            />
            Every bid comes from an identity-verified STRUKTURA pro
          </li>
          <li className="flex items-start gap-2">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="mt-0.5 size-3.5 shrink-0 text-brand-orange"
            />
            Hire anyone, on price or rating — pay through escrow
          </li>
        </ul>

        {!filled && (
          <p className="mt-5 text-center text-[10px] tracking-wider text-brand-black/40 uppercase">
            Start filling the form to see the preview
          </p>
        )}
      </div>
    </aside>
  )
}

function Confirmation({ form }: { form: FormState }) {
  return (
    <motion.div
      key="done"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
      className="mx-auto max-w-2xl rounded-md border border-brand-black/10 bg-white p-9 text-center shadow-[0_24px_60px_-30px_rgba(15,16,15,0.25)]"
    >
      <span className="mx-auto flex size-14 items-center justify-center rounded-none bg-brand-orange/15 text-brand-orange">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-8" />
      </span>
      <h2 className="mt-5 text-2xl leading-tight font-extrabold tracking-tight text-brand-black sm:text-3xl">
        Your job is live.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-brand-black/75">
        We&rsquo;ve notified verified pros in{" "}
        <span className="font-semibold text-brand-black">
          {form.category || "your trade"}
        </span>
        {form.location && (
          <>
            {" near "}
            <span className="font-semibold text-brand-black">
              {form.location}
            </span>
          </>
        )}
        . Bids land in the next 24 hours.
      </p>

      <ol className="mx-auto mt-7 max-w-md space-y-3 text-left text-sm text-brand-black/75">
        <Step n={1} label="We notify matching pros now" />
        <Step n={2} label="Bids arrive — compare side-by-side" />
        <Step n={3} label="Hire, escrow funds, milestones release as you sign off" />
      </ol>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/services"
          className="inline-flex items-center gap-2 rounded-none bg-brand-orange px-6 py-3 text-xs font-semibold tracking-[0.2em] text-white uppercase transition-colors hover:bg-brand-orange-soft"
        >
          Browse pros while you wait
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-brand-black/15 bg-white px-6 py-3 text-xs font-semibold tracking-[0.2em] text-brand-black uppercase transition-colors hover:border-brand-orange/40 hover:text-brand-orange"
        >
          Back to home
        </Link>
      </div>
    </motion.div>
  )
}

function Step({ n, label }: { n: number; label: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded-none bg-brand-orange/10 text-xs font-bold text-brand-orange">
        {n}
      </span>
      <span className="pt-0.5">{label}</span>
    </li>
  )
}

// ---- Tiny field primitives ----

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-xs font-bold tracking-wide text-brand-black uppercase">
        {label}
        {required && <span className="ml-1 text-brand-orange">*</span>}
      </label>
      {hint && <p className="mt-1 text-[11px] text-brand-black/65">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  )
}

const inputClass =
  "w-full rounded-md border border-brand-black/15 bg-white px-4 py-3 text-sm text-brand-black placeholder:text-brand-black/45 outline-none transition-shadow focus:border-brand-orange/40 focus:ring-2 focus:ring-brand-orange/20"

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={inputClass} />
}

function InputWithIcon({
  icon,
  ...props
}: { icon: typeof Location01Icon } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand-black/45">
        <HugeiconsIcon icon={icon} className="size-4" />
      </span>
      <input {...props} className={`${inputClass} pl-10`} />
    </div>
  )
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${inputClass} resize-none`} />
}

function Select({
  value,
  onChange,
  options,
  placeholder,
  icon,
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
  icon?: typeof Calendar01Icon
}) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand-black/45">
          <HugeiconsIcon icon={icon} className="size-4" />
        </span>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          inputClass,
          "appearance-none pr-10",
          icon && "pl-10",
          !value && "text-brand-black/45"
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <HugeiconsIcon
        icon={ArrowDown01Icon}
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-brand-black/45"
      />
    </div>
  )
}

function PhotoPlaceholder({
  attachments,
  onAdd,
  onRemove,
}: {
  attachments: { name: string; size: string }[]
  onAdd: () => void
  onRemove: (i: number) => void
}) {
  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={onAdd}
        disabled={attachments.length >= 5}
        className="flex w-full items-center justify-center gap-3 rounded-md border-2 border-dashed border-brand-black/15 bg-brand-black/[0.02] px-4 py-6 text-sm text-brand-black/70 transition-colors hover:border-brand-orange/40 hover:text-brand-orange disabled:cursor-not-allowed disabled:opacity-50"
      >
        <HugeiconsIcon icon={Image01Icon} className="size-5" />
        <span>
          {attachments.length === 0
            ? "Click to add photos (or drag & drop later)"
            : `Add another (${attachments.length} / 5)`}
        </span>
      </button>
      {attachments.length > 0 && (
        <ul className="space-y-2 text-xs">
          {attachments.map((a, i) => (
            <li
              key={`${a.name}-${i}`}
              className="flex items-center gap-3 rounded-md bg-brand-black/5 px-3 py-2"
            >
              <HugeiconsIcon icon={Camera01Icon} className="size-4 text-brand-orange" />
              <span className="flex-1 truncate font-medium text-brand-black">
                {a.name}
              </span>
              <span className="text-brand-black/45">{a.size}</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={`Remove ${a.name}`}
                className="flex size-6 items-center justify-center rounded-full text-brand-black/45 hover:bg-white hover:text-brand-orange"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
