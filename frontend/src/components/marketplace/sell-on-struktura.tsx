import { Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowRight01Icon,
  CheckmarkCircle02Icon,
  Store02Icon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons"
import { Reveal } from "@/components/motion/primitives"

const sellerBullets = [
  "Reach 12,000+ verified buyers across the country",
  "Zero IT setup — list, fulfill, get paid",
  "Subscription from ₱2,500/mo · weekly payouts",
  "Real seller dashboard with sales, returns, payouts",
]

const proBullets = [
  "Get matched to active jobs in your trade",
  "Escrow protection — paid for work delivered",
  "Verified-pro badge boosts win rate by 3.2×",
  "Only pay when you win — no upfront fees",
]

export function SellOnBuildora() {
  return (
    <section id="sell" className="relative isolate overflow-hidden bg-brand-ink py-16 sm:py-20 lg:py-24 text-white">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-10"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=80&auto=format&fit=crop')",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-brand-ink/95 via-brand-ink/80 to-brand-ink"
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <Reveal className="mb-12 text-center">
          <span className="text-[11px] font-semibold tracking-[0.3em] text-brand-orange uppercase">
            Run a construction business?
          </span>
          <h2 className="mt-3 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl">
            Sell on Levite.
            <br />
            <span className="text-brand-orange">Reach buyers ready to build.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/70">
            We don&rsquo;t carry inventory or staff jobsites. We&rsquo;re the platform —
            you&rsquo;re the brand. Materials sellers and service contractors both
            grow on Levite.
          </p>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal className="group relative overflow-hidden rounded-md bg-brand-orange p-8 sm:p-10">
            <span className="flex size-12 items-center justify-center rounded-md bg-brand-black/30 text-white">
              <HugeiconsIcon icon={Store02Icon} className="size-5" />
            </span>
            <h3 className="mt-5 text-2xl font-extrabold tracking-tight">
              Sell on Levite
            </h3>
            <p className="mt-2 text-sm text-white/85">
              For construction-materials sellers — cement yards, hardware retail,
              tile yards, paint suppliers, lumber, fixtures, more.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {sellerBullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="mt-0.5 size-4 shrink-0"
                  />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/sell"
              search={{ role: "seller" }}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-black px-6 py-3 text-xs font-semibold tracking-[0.2em] text-white uppercase transition-colors hover:bg-brand-ink"
            >
              Become a seller
              <span className="flex size-6 items-center justify-center rounded-full bg-brand-orange">
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
              </span>
            </Link>
          </Reveal>

          <Reveal className="group relative overflow-hidden rounded-md border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm sm:p-10">
            <span className="flex size-12 items-center justify-center rounded-md bg-brand-orange/15 text-brand-orange">
              <HugeiconsIcon icon={Wrench01Icon} className="size-5" />
            </span>
            <h3 className="mt-5 text-2xl font-extrabold tracking-tight">
              List your services
            </h3>
            <p className="mt-2 text-sm text-white/70">
              For builders and contractors — general contractors, roofers,
              plumbers, electricians, painters, landscapers, handymen.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {proBullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <HugeiconsIcon
                    icon={CheckmarkCircle02Icon}
                    className="mt-0.5 size-4 shrink-0 text-brand-orange"
                  />
                  <span className="text-white/85">{b}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/sell"
              search={{ role: "contractor" }}
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-orange px-6 py-3 text-xs font-semibold tracking-[0.2em] text-white uppercase transition-colors hover:bg-brand-orange-soft"
            >
              Apply as a contractor
              <span className="flex size-6 items-center justify-center rounded-full bg-brand-black/30">
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
              </span>
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
