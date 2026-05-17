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
  Mail01Icon,
  Call02Icon,
  Cancel01Icon,
  StarIcon,
  CheckmarkBadge02Icon,
  Shield01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { Reveal } from "@/components/motion/primitives"
import { serviceCategories, type ServiceCategory } from "./services-data"

const yearRanges = [
  "Less than 1 year",
  "1–3 years",
  "3–5 years",
  "5–10 years",
  "10+ years",
] as const

const priceUnits = ["per project", "per sqm", "per hour", "per day"] as const

type FormState = {
  companyName: string
  category: ServiceCategory | ""
  title: string
  description: string
  serviceArea: string
  startingPrice: string
  priceUnit: (typeof priceUnits)[number] | ""
  yearsInBusiness: string
  contactEmail: string
  contactPhone: string
  photos: { name: string; size: string }[]
  agree: boolean
}

const initial: FormState = {
  companyName: "",
  category: "",
  title: "",
  description: "",
  serviceArea: "",
  startingPrice: "",
  priceUnit: "per project",
  yearsInBusiness: "",
  contactEmail: "",
  contactPhone: "",
  photos: [],
  agree: false,
}

export function PostServicePage({
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

      <section className="bg-[#f5f3ef] pb-16 sm:pb-20 lg:pb-24">
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
                <ServiceForm
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
            "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80&auto=format&fit=crop')",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-brand-ink/95 via-brand-ink/85 to-brand-ink"
      />
      <Reveal className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-orange/40 bg-brand-orange/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-brand-orange uppercase">
          <span className="size-1.5 rounded-none bg-brand-orange" />
          List your service
        </span>
        <h1 className="mt-5 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          List a service. Get matched to active jobs.
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">
          Tell buyers what you build. Verified pros get matched to job posts in
          their trade and area, and can submit bids in minutes.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-white/70">
          <span className="inline-flex items-center gap-1.5">
            <HugeiconsIcon icon={CheckmarkBadge02Icon} className="size-3.5 text-brand-orange" />
            Free to list
          </span>
          <span className="inline-flex items-center gap-1.5">
            <HugeiconsIcon icon={Shield01Icon} className="size-3.5 text-brand-orange" />
            Escrow protection
          </span>
          <span className="inline-flex items-center gap-1.5">
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-3.5 text-brand-orange" />
            Pay only when you win
          </span>
        </div>
      </Reveal>
    </section>
  )
}

function ServiceForm({
  form,
  update,
  onSubmit,
}: {
  form: FormState
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void
  onSubmit: () => void
}) {
  const valid =
    form.companyName.length > 1 &&
    form.category &&
    form.title.length > 5 &&
    form.description.length > 30 &&
    form.serviceArea &&
    form.startingPrice &&
    form.contactEmail &&
    form.agree

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
        <div>
          <h2 className="text-lg font-bold text-brand-black">
            About your business
          </h2>
          <p className="mt-1 text-sm text-brand-black/70">
            Tell us who you are. This appears on your public profile.
          </p>
        </div>

        <Field label="Company or business name" required>
          <Input
            value={form.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            placeholder="e.g. Heritage Build Co."
            maxLength={80}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Service area" required hint="The area you typically work in.">
            <InputWithIcon
              icon={Location01Icon}
              value={form.serviceArea}
              onChange={(e) => update("serviceArea", e.target.value)}
              placeholder="e.g. Cebu City + nearby"
            />
          </Field>
          <Field label="Years in business">
            <Select
              value={form.yearsInBusiness}
              onChange={(v) => update("yearsInBusiness", v)}
              placeholder="Select range"
              options={[...yearRanges]}
            />
          </Field>
        </div>

        <div className="border-t border-brand-black/10 pt-7">
          <h2 className="text-lg font-bold text-brand-black">
            About the service
          </h2>
          <p className="mt-1 text-sm text-brand-black/70">
            What buyers see in search.
          </p>
        </div>

        <Field label="Trade" required>
          <Select
            value={form.category}
            onChange={(v) => update("category", v as FormState["category"])}
            placeholder="Choose a trade"
            options={serviceCategories.map((c) => c.name)}
          />
        </Field>

        <Field
          label="Service title"
          required
          hint="A short headline buyers see first."
        >
          <Input
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            placeholder="e.g. Full-service home build & renovation"
            maxLength={80}
          />
        </Field>

        <Field
          label="Describe what you do"
          required
          hint="What's your scope, specialties, and what makes you different? More detail wins more bids."
        >
          <Textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Heritage Build Co. has 14 years of full-service GC work across Visayas. We handle ground-up coastal & hillside builds end to end — concept, plans, permits, build, handover. Recent work: Cebu coastal residence (₱4.8M), Tagaytay hillside (₱6.5M)…"
            rows={6}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Starting price" required>
            <Input
              value={form.startingPrice}
              onChange={(e) => update("startingPrice", e.target.value)}
              placeholder="e.g. ₱75,000"
            />
          </Field>
          <Field label="Per…">
            <Select
              value={form.priceUnit}
              onChange={(v) => update("priceUnit", v as FormState["priceUnit"])}
              placeholder="Choose unit"
              options={[...priceUnits]}
            />
          </Field>
        </div>

        <Field
          label="Portfolio photos"
          hint="Up to 5 images. Real project photos win more jobs."
        >
          <PhotoPlaceholder
            attachments={form.photos}
            onAdd={() =>
              update("photos", [
                ...form.photos,
                {
                  name: `IMG_${(form.photos.length + 1).toString().padStart(4, "0")}.jpg`,
                  size: "2.4 MB",
                },
              ])
            }
            onRemove={(i) =>
              update(
                "photos",
                form.photos.filter((_, idx) => idx !== i)
              )
            }
          />
        </Field>

        <div className="border-t border-brand-black/10 pt-7">
          <h2 className="text-lg font-bold text-brand-black">
            How buyers reach you
          </h2>
          <p className="mt-1 text-sm text-brand-black/70">
            We never share these publicly — buyers contact you through STRUKTURA.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Contact email" required>
            <InputWithIcon
              icon={Mail01Icon}
              type="email"
              value={form.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              placeholder="hello@yourbusiness.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Phone number">
            <InputWithIcon
              icon={Call02Icon}
              type="tel"
              value={form.contactPhone}
              onChange={(e) => update("contactPhone", e.target.value)}
              placeholder="+63 …"
              autoComplete="tel"
            />
          </Field>
        </div>

        <label className="flex items-start gap-2.5 text-sm text-brand-black/75">
          <input
            type="checkbox"
            checked={form.agree}
            onChange={(e) => update("agree", e.target.checked)}
            className="mt-0.5 size-4 shrink-0 rounded border-brand-black/20 text-brand-orange focus:ring-brand-orange/40"
            required
          />
          <span>
            I confirm my business is registered, I&rsquo;m authorized to list this
            service, and I agree to STRUKTURA&rsquo;s{" "}
            <Link to="/" className="font-semibold text-brand-orange hover:underline">
              Seller Terms
            </Link>
            .
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={!valid}
        className="mt-9 inline-flex w-full items-center justify-center gap-2 rounded-none bg-brand-orange py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-soft disabled:cursor-not-allowed disabled:opacity-50"
      >
        Submit listing for review
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" />
      </button>
      <p className="mt-3 text-center text-xs text-brand-black/65">
        Listings are reviewed within 24–48 hours. We may follow up to verify
        your business permit.
      </p>
    </form>
  )
}

function PreviewCard({ form }: { form: FormState }) {
  const filled = form.title || form.description || form.companyName
  return (
    <aside className="lg:sticky lg:top-24 lg:h-fit">
      <div className="rounded-md border border-brand-black/10 bg-white p-6 shadow-[0_12px_30px_-15px_rgba(15,16,15,0.18)]">
        <p className="text-[10px] font-bold tracking-[0.3em] text-brand-orange uppercase">
          Live preview · what buyers see
        </p>

        <article className="mt-4 overflow-hidden rounded-md border border-brand-black/10 bg-[#f9f7f3]">
          <div className="aspect-[16/10] bg-gradient-to-br from-brand-orange/30 via-brand-black/10 to-brand-orange/15">
            <div className="flex h-full items-center justify-center text-xs text-brand-black/55">
              {form.photos.length > 0
                ? `${form.photos.length} portfolio photo${form.photos.length === 1 ? "" : "s"}`
                : "Portfolio photos appear here"}
            </div>
          </div>
          <div className="p-5">
            <p className="text-[10px] font-semibold tracking-[0.25em] text-brand-orange uppercase">
              {form.category || "Trade"}
            </p>
            <h3 className="mt-1 text-base leading-snug font-bold text-brand-black">
              {form.companyName || "Your company name"}
            </h3>
            <div className="mt-1 flex items-center gap-3 text-xs text-brand-black/70">
              <span className="inline-flex items-center gap-1">
                <HugeiconsIcon
                  icon={Location01Icon}
                  className="size-3.5 text-brand-orange"
                />
                {form.serviceArea || "Service area"}
              </span>
              <span className="inline-flex items-center gap-1">
                <HugeiconsIcon
                  icon={StarIcon}
                  className="size-3.5 text-brand-orange"
                />
                <span className="text-brand-black/55">New</span>
              </span>
            </div>
            <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-brand-black/75">
              {form.description ||
                "Your description will show here. Be specific about your scope, specialties, and what makes you different — more detail wins more bids."}
            </p>
            {(form.startingPrice || form.priceUnit) && (
              <div className="mt-4 border-t border-brand-black/10 pt-3">
                <p className="text-[11px] tracking-wider text-brand-black/55 uppercase">
                  Starting from
                </p>
                <p className="text-base font-extrabold text-brand-black">
                  {form.startingPrice || "—"}{" "}
                  <span className="text-xs font-medium text-brand-black/60">
                    {form.priceUnit}
                  </span>
                </p>
              </div>
            )}
          </div>
        </article>

        <ul className="mt-6 space-y-3 text-xs text-brand-black/75">
          <li className="flex items-start gap-2">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="mt-0.5 size-3.5 shrink-0 text-brand-orange"
            />
            Free to list — STRUKTURA earns only on successful jobs
          </li>
          <li className="flex items-start gap-2">
            <HugeiconsIcon
              icon={Shield01Icon}
              className="mt-0.5 size-3.5 shrink-0 text-brand-orange"
            />
            Buyers pay through escrow — funds release on milestone sign-off
          </li>
          <li className="flex items-start gap-2">
            <HugeiconsIcon
              icon={CheckmarkCircle02Icon}
              className="mt-0.5 size-3.5 shrink-0 text-brand-orange"
            />
            Hit a 4.7★ rating to earn the verified-pro badge
          </li>
        </ul>

        {!filled && (
          <p className="mt-5 text-center text-[10px] tracking-wider text-brand-black/45 uppercase">
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
        Listing submitted.
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-brand-black/75">
        Thanks{form.companyName && (
          <>
            ,{" "}
            <span className="font-semibold text-brand-black">
              {form.companyName}
            </span>
          </>
        )}
        . We&rsquo;ll review your listing within 24–48 hours and email{" "}
        {form.contactEmail ? (
          <span className="font-semibold text-brand-black">
            {form.contactEmail}
          </span>
        ) : (
          "your contact"
        )}{" "}
        when it goes live.
      </p>

      <ol className="mx-auto mt-7 max-w-md space-y-3 text-left text-sm text-brand-black/85">
        <Step n={1} label="We verify your business permit (24–48 hours)" />
        <Step n={2} label="Listing goes live and starts matching to relevant jobs" />
        <Step n={3} label="Submit bids on jobs you want — pay only when you win" />
      </ol>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 rounded-none bg-brand-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-soft"
        >
          Browse open jobs
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
        </Link>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-full border border-brand-black/15 bg-white px-6 py-3 text-sm font-semibold text-brand-black transition-colors hover:border-brand-orange/40 hover:text-brand-orange"
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

// ---- Field primitives (mirrors /jobs/post for consistency) ----

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
      <label className="block text-sm font-semibold text-brand-black">
        {label}
        {required && <span className="ml-1 text-brand-orange">*</span>}
      </label>
      {hint && <p className="mt-1 text-xs text-brand-black/70">{hint}</p>}
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
      <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-brand-black/55">
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
}: {
  value: string
  onChange: (v: string) => void
  options: string[]
  placeholder: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          inputClass,
          "appearance-none pr-10",
          !value && "text-brand-black/55"
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
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-brand-black/55"
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
              <span className="text-brand-black/55">{a.size}</span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                aria-label={`Remove ${a.name}`}
                className="flex size-6 items-center justify-center rounded-full text-brand-black/55 hover:bg-white hover:text-brand-orange"
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
