import { Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ConstructionIcon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"

const trustPoints = [
  "Escrow-protected payments on every order",
  "12,000+ verified buyers · 200+ verified sellers",
  "Doorstep delivery scheduled to the hour",
  "Verified-pro badges on every contractor",
]

export function AuthShell({
  title,
  subtitle,
  children,
  bottomPrompt,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
  bottomPrompt: React.ReactNode
}) {
  return (
    <main className="min-h-svh bg-background">
      <div className="grid min-h-svh lg:grid-cols-[1.05fr_1fr]">
        <section className="flex flex-col bg-background px-6 py-10 sm:px-12 sm:py-14 lg:px-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 self-start"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-brand-orange text-white">
              <HugeiconsIcon icon={ConstructionIcon} className="size-5" />
            </span>
            <span className="text-lg font-bold tracking-tight text-brand-black">
              STRUKTURA
            </span>
          </Link>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
            <h1 className="text-3xl leading-tight font-extrabold tracking-tight text-brand-black sm:text-4xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-brand-black/75">{subtitle}</p>

            <div className="mt-8">{children}</div>

            <p className="mt-8 text-center text-sm text-brand-black/75">
              {bottomPrompt}
            </p>
          </div>

          <p className="text-center text-[11px] tracking-wider text-brand-black/45">
            © {new Date().getFullYear()} STRUKTURA · {" "}
            <Link to="/contact" className="hover:text-brand-orange">Help</Link>
            {" · "}
            <Link to="/pricing" className="hover:text-brand-orange">Pricing</Link>
          </p>
        </section>

        <aside className="relative isolate hidden overflow-hidden bg-brand-ink text-white lg:block">
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center opacity-50"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1600&q=80&auto=format&fit=crop')",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-brand-ink/80 via-brand-ink/60 to-brand-ink/95"
          />
          <div className="relative flex h-full flex-col justify-between px-12 py-14">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand-orange/40 bg-brand-orange/10 px-4 py-1.5 text-[10px] font-semibold tracking-[0.2em] text-brand-orange uppercase">
              <span className="size-1.5 rounded-full bg-brand-orange" />
              Construction Marketplace
            </span>

            <div>
              <p className="text-3xl leading-tight font-extrabold tracking-tight">
                Build anything.
                <br />
                <span className="text-brand-orange">Source everything.</span>
              </p>
              <p className="mt-3 max-w-md text-sm text-white/75">
                One marketplace for materials, services, and contractors.
                Trusted by 12,000+ buyers across 200+ verified sellers.
              </p>
              <ul className="mt-7 space-y-3 text-sm">
                {trustPoints.map((p) => (
                  <li key={p} className="flex items-start gap-2.5">
                    <HugeiconsIcon
                      icon={CheckmarkCircle02Icon}
                      className="mt-0.5 size-4 shrink-0 text-brand-orange"
                    />
                    <span className="text-white/85">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-baseline gap-6 text-sm">
              <Stat value="12k+" label="Verified buyers" />
              <Stat value="200+" label="Active sellers" />
              <Stat value="₱840M" label="Escrow GMV" />
            </div>
          </div>
        </aside>
      </div>
    </main>
  )
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-2xl leading-none font-extrabold text-brand-orange">
        {value}
      </p>
      <p className="mt-1 text-[11px] tracking-wider text-white/65 uppercase">
        {label}
      </p>
    </div>
  )
}
