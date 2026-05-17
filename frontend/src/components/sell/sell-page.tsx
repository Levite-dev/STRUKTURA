import { useState } from "react"
import { Link } from "@tanstack/react-router"
import { motion, AnimatePresence } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  Store02Icon,
  Wrench01Icon,
  ShoppingBag03Icon,
  CashbackIcon,
  Certificate01Icon,
  Shield01Icon,
  PlusSignIcon,
  CustomerService01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/primitives"

export type SellRole = "seller" | "contractor"

const sellerBenefits = [
  {
    icon: ShoppingBag03Icon,
    title: "12,000+ active buyers",
    body: "Reach contractors and homeowners actively shopping for materials in your category, every day.",
  },
  {
    icon: CashbackIcon,
    title: "Weekly payouts to your bank",
    body: "We settle every Friday. No invoice chasing, no waiting on consolidated transfers.",
  },
  {
    icon: Store02Icon,
    title: "Zero IT setup",
    body: "Upload your catalog by CSV, set delivery zones, and you're live. We host the storefront, payments, and support.",
  },
]

const contractorBenefits = [
  {
    icon: CustomerService01Icon,
    title: "Matched to active jobs",
    body: "Get a daily feed of jobs in your trade and area. Bid only on the ones that fit.",
  },
  {
    icon: Shield01Icon,
    title: "Escrow protection",
    body: "You're paid when each milestone is signed off. No invoicing, no chasing, no late checks.",
  },
  {
    icon: Certificate01Icon,
    title: "Verified-pro badge",
    body: "Verified pros win jobs at 3.2× the rate of unverified ones. We handle the license and ID checks.",
  },
]

const sellerSteps = [
  { title: "Apply", body: "Tell us about your business. 5-minute form." },
  { title: "Verify", body: "We check your business permit and IDs. Usually 24–48 hours." },
  { title: "List", body: "Upload your catalog, set prices, go live." },
]

const contractorSteps = [
  { title: "Apply", body: "Tell us your trade and service area." },
  { title: "License check", body: "Identity + license verification — we make it quick." },
  { title: "Win jobs", body: "Bid on matched jobs. Verified-pro badge boosts your win rate." },
]

const faqs = [
  {
    q: "How much does it cost to sell on STRUKTURA?",
    a: "Listing your products is free. STRUKTURA takes a per-order commission that scales with your seller tier (8% on Starter, 5% on Growth, 3% on Pro). Service contractors apply free and pay a commission per won job — no upfront fees.",
  },
  {
    q: "How long does onboarding take?",
    a: "Most sellers go live within 5 business days of applying. The catalog upload takes a few hours; verification takes 24–48 hours.",
  },
  {
    q: "Do I need a separate business account?",
    a: "Yes — you'll register under your business name, not your personal one. We need a business permit, government-issued ID of the registered owner, and a bank account in the business's name.",
  },
  {
    q: "Can I run both sides — sell materials AND offer services?",
    a: "Yes. Many of our top sellers run both lines under one account. You'll see a unified dashboard with separate revenue streams.",
  },
  {
    q: "When do I get paid?",
    a: "Weekly payouts to your bank on Starter and Growth (every Friday for the previous week). Pro sellers get daily payouts.",
  },
  {
    q: "What if a buyer disputes an order?",
    a: "STRUKTURA holds payment in escrow until delivery is signed off. If a dispute is opened, our team reviews transaction logs and mediates within 3 business days.",
  },
]

export function SellPage({ initialRole = "seller" }: { initialRole?: SellRole }) {
  const [role, setRole] = useState<SellRole>(initialRole)
  return (
    <main className="bg-background">
      <Hero role={role} setRole={setRole} />
      <RoleContent role={role} />
      <FAQ />
    </main>
  )
}

function Hero({ role, setRole }: { role: SellRole; setRole: (r: SellRole) => void }) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-ink pt-32 pb-16 text-white sm:pt-40 sm:pb-20 lg:pt-44 lg:pb-24">
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
      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-orange/40 bg-brand-orange/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-brand-orange uppercase">
          <span className="size-1.5 rounded-full bg-brand-orange" />
          Sell on STRUKTURA
        </span>

        <h1 className="mt-5 text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Reach buyers
          <br />
          <span className="text-brand-orange">ready to build.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-sm text-white/75 sm:text-base">
          Choose the side that fits. Sell construction materials, or offer
          services as a contractor — we handle the marketplace, payments, and
          buyer support.
        </p>

        <div className="mt-8 inline-flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 text-[11px] font-semibold backdrop-blur">
          {(["seller", "contractor"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={cn(
                "relative inline-flex items-center gap-2 rounded-full px-4 py-2 tracking-[0.18em] uppercase transition-colors sm:px-5",
                role === r ? "text-white" : "text-white/75 hover:text-white"
              )}
            >
              {role === r && (
                <motion.span
                  layoutId="sell-role-pill"
                  className="absolute inset-0 rounded-full bg-brand-orange shadow-lg"
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <HugeiconsIcon
                  icon={r === "seller" ? Store02Icon : Wrench01Icon}
                  className="size-3.5"
                />
                {r === "seller" ? "Sell materials" : "Offer services"}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function RoleContent({ role }: { role: SellRole }) {
  const benefits = role === "seller" ? sellerBenefits : contractorBenefits
  const steps = role === "seller" ? sellerSteps : contractorSteps
  const ctaLabel = role === "seller" ? "Get started — free" : "Apply as a contractor"

  return (
    <section className="bg-white py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.4 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
          >
            <Reveal className="mb-12 max-w-2xl">
              <p className="text-[11px] font-bold tracking-[0.3em] text-brand-orange uppercase">
                {role === "seller" ? "For materials sellers" : "For service contractors"}
              </p>
              <h2 className="mt-2 text-3xl leading-tight font-extrabold tracking-tight text-brand-black sm:text-4xl lg:text-[44px]">
                {role === "seller"
                  ? "List materials. Reach buyers. Get paid weekly."
                  : "Get matched, get hired, get paid through escrow."}
              </h2>
            </Reveal>

            <StaggerGroup className="grid gap-4 sm:grid-cols-3">
              {benefits.map((b) => (
                <StaggerItem
                  key={b.title}
                  className="rounded-md border border-brand-black/10 bg-white p-6 shadow-[0_8px_20px_-12px_rgba(0,0,0,0.12)] transition-shadow hover:border-brand-orange/40 hover:shadow-[0_25px_50px_-25px_rgba(255,116,32,0.25)]"
                >
                  <span className="flex size-11 items-center justify-center rounded-md bg-brand-orange/10 text-brand-orange">
                    <HugeiconsIcon icon={b.icon} className="size-5" />
                  </span>
                  <h3 className="mt-4 text-base font-bold text-brand-black">
                    {b.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-brand-black/70">
                    {b.body}
                  </p>
                </StaggerItem>
              ))}
            </StaggerGroup>

            <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-center">
              <Reveal>
                <p className="text-[11px] font-bold tracking-[0.3em] text-brand-orange uppercase">
                  How it works
                </p>
                <h3 className="mt-2 text-2xl leading-tight font-extrabold tracking-tight text-brand-black sm:text-3xl">
                  Three steps to live.
                </h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-black/75">
                  No long contracts, no setup fees, no IT lift. The whole flow
                  takes most sellers under a week.
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link
                    to="/auth/signup"
                    search={{ role: "seller" }}
                    className="inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-soft"
                  >
                    {ctaLabel}
                    <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                  </Link>
                  {role === "contractor" && (
                    <Link
                      to="/services/post"
                      className="inline-flex items-center gap-2 rounded-full border border-brand-black/15 bg-white px-6 py-3 text-sm font-semibold text-brand-black transition-colors hover:border-brand-orange/40 hover:text-brand-orange"
                    >
                      List a service first
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
                    </Link>
                  )}
                </div>
              </Reveal>

              <ol className="space-y-4">
                {steps.map((s, i) => (
                  <li
                    key={s.title}
                    className="flex gap-4 rounded-md border border-brand-black/10 bg-white p-5 shadow-[0_8px_20px_-12px_rgba(0,0,0,0.12)]"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-orange text-base font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-brand-black">
                        {s.title}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-brand-black/75">
                        {s.body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(0)
  return (
    <section className="bg-[#f5f3ef] py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Reveal className="mb-10 text-center">
          <p className="text-[11px] font-bold tracking-[0.3em] text-brand-orange uppercase">
            FAQ
          </p>
          <h2 className="mt-2 text-3xl leading-tight font-extrabold tracking-tight text-brand-black sm:text-4xl">
            Common questions, answered.
          </h2>
        </Reveal>
        <ul className="space-y-3">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <li
                key={f.q}
                className={cn(
                  "overflow-hidden rounded-md border bg-white transition-colors",
                  isOpen
                    ? "border-brand-orange/40 shadow-[0_20px_40px_-30px_rgba(255,116,32,0.5)]"
                    : "border-brand-black/10"
                )}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 px-6 py-5 text-left"
                >
                  <span className="text-base font-semibold text-brand-black">
                    {f.q}
                  </span>
                  <span
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full transition-all",
                      isOpen
                        ? "rotate-45 bg-brand-orange text-white"
                        : "bg-brand-orange/10 text-brand-orange"
                    )}
                  >
                    <HugeiconsIcon icon={PlusSignIcon} className="size-4" />
                  </span>
                </button>
                <div
                  className={cn(
                    "grid transition-[grid-template-rows] duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-brand-black/75">
                      {f.a}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <Reveal className="mt-12 text-center">
          <p className="text-sm text-brand-black/75">
            Still have questions?{" "}
            <Link
              to="/contact"
              className="font-semibold text-brand-orange hover:underline"
            >
              Talk to our seller team →
            </Link>
          </p>
        </Reveal>
      </div>
    </section>
  )
}
