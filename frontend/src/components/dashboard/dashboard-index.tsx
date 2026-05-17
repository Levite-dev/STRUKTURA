import { Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home01Icon,
  PackageIcon,
  ConstructionIcon,
  Building03Icon,
  ShieldUserIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { useRole, type Role } from "./role-context"

const tiles: Array<{
  role: Role
  to: string
  title: string
  body: string
  icon: typeof Home01Icon
  accent: string
}> = [
  {
    role: "client",
    to: "/dashboard/client",
    title: "Homeowner / Client",
    body: "Materials orders, posted jobs, hired projects, estimates.",
    icon: Home01Icon,
    accent: "bg-brand-orange/10 text-brand-orange",
  },
  {
    role: "seller",
    to: "/dashboard/seller",
    title: "Hardware seller",
    body: "Catalog, incoming orders, bi-weekly payouts.",
    icon: PackageIcon,
    accent: "bg-sky-100 text-sky-700",
  },
  {
    role: "contractor",
    to: "/dashboard/contractor",
    title: "Contractor",
    body: "Bids in flight, active projects, escrow earnings.",
    icon: ConstructionIcon,
    accent: "bg-emerald-100 text-emerald-700",
  },
  {
    role: "company",
    to: "/dashboard/company",
    title: "Service company",
    body: "Service listings, bookings, team utilization.",
    icon: Building03Icon,
    accent: "bg-amber-100 text-amber-700",
  },
  {
    role: "admin",
    to: "/dashboard/admin",
    title: "Platform admin",
    body: "Verification queue, escrow snapshot, disputes.",
    icon: ShieldUserIcon,
    accent: "bg-zinc-100 text-zinc-700",
  },
]

export function DashboardIndex() {
  const { setRole } = useRole()

  return (
    <div className="bg-background">
      <Header />
      <main className="mx-auto max-w-[1280px] px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs tracking-widest text-brand-orange uppercase">
            Prototype demo
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-brand-black sm:text-5xl">
            View the platform as…
          </h1>
          <p className="mt-3 text-base text-brand-black/70">
            STRUKTURA serves five participant types. Pick a role to explore the
            interface tailored to that user. Your selection persists to this device.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tiles.map((t) => (
            <Link
              key={t.role}
              to={t.to}
              onClick={() => setRole(t.role)}
              className="group flex flex-col gap-3 rounded-none border border-border bg-white p-6 transition-shadow hover:shadow-[0_24px_60px_-30px_rgba(0,0,0,0.25)]"
            >
              <span className={`flex size-12 items-center justify-center rounded-full ${t.accent}`}>
                <HugeiconsIcon icon={t.icon} className="size-6" />
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-bold tracking-tight text-brand-black">
                  {t.title}
                </h3>
                <p className="mt-1 text-sm text-brand-black/70">{t.body}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold tracking-widest text-brand-orange uppercase group-hover:underline">
                Open dashboard
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
              </span>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  )
}
