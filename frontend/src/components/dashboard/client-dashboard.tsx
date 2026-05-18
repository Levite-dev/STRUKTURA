import { Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ShoppingCart01Icon,
  Briefcase01Icon,
  Calculator01Icon,
  ConstructionIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

import { Header } from "@/components/landing/header"
import { DashboardShell } from "@/components/shared/dashboard-shell"
import { peso } from "@/components/shared/price-tag"
import { Badge } from "@/components/ui/badge"
import { SidebarNav } from "./sidebar-nav"
import { StatTile } from "./stat-tile"
import { DataTable } from "./data-table"
import { sampleOrders } from "./dashboard-data"
import { OnboardingBanner } from "./onboarding-banner"
import { DiscoveryCard } from "./discovery-card"
import { projects } from "@/components/projects/projects-data"
import { jobs } from "@/components/jobs/jobs-data"
import { estimates } from "@/components/estimate/estimates-data"

export function ClientDashboard() {
  const myProjects = projects.slice(0, 2)
  const myJobs = jobs.slice(0, 3)

  return (
    <>
      <Header />
      <DashboardShell sidebar={<SidebarNav role="client" />}>
        <div>
          <OnboardingBanner />
          <div className="mt-4 grid gap-4 sm:grid-cols-2 px-0">
            <DiscoveryCard targetRole="CONTRACTOR" />
            <DiscoveryCard targetRole="SUPPLIER" />
          </div>
          <DashboardHeader
            title="Welcome back, Juan"
            subtitle="Track orders, projects, and active estimates."
          />

          <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatTile
              icon={ShoppingCart01Icon}
              label="Open orders"
              value="2"
              hint="of 3 total"
            />
            <StatTile
              icon={ConstructionIcon}
              label="Active projects"
              value={String(myProjects.length)}
              hint="Escrow protected"
            />
            <StatTile
              icon={Briefcase01Icon}
              label="Posted jobs"
              value={String(myJobs.length)}
              hint="Across categories"
            />
            <StatTile
              icon={Calculator01Icon}
              label="Estimates"
              value={String(estimates.length)}
              hint="Reports available"
            />
          </section>

          <section className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card title="Active projects" link={{ to: "/projects/$projectId", params: { projectId: myProjects[0]?.id ?? "" } }}>
              <ul className="flex flex-col gap-3">
                {myProjects.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-3 rounded-none border border-border bg-white p-4"
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-semibold text-brand-black">
                        {p.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {p.contractorName} · Stage {p.stage}
                      </p>
                    </div>
                    <Link
                      to="/projects/$projectId"
                      params={{ projectId: p.id }}
                      className="inline-flex h-8 items-center justify-center rounded-full border border-border px-3 text-[10px] font-semibold tracking-widest uppercase hover:bg-muted"
                    >
                      View
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>

            <Card title="My estimates" link={{ to: "/estimate" }}>
              <ul className="flex flex-col gap-3">
                {estimates.map((e) => (
                  <li
                    key={e.id}
                    className="flex items-center justify-between gap-3 rounded-none border border-border bg-white p-4"
                  >
                    <div className="min-w-0">
                      <p className="line-clamp-1 text-sm font-semibold text-brand-black">
                        {e.projectType}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {e.location} · {peso(e.total)}
                      </p>
                    </div>
                    <Link
                      to="/estimate/report/$estimateId"
                      params={{ estimateId: e.id }}
                      className="inline-flex h-8 items-center justify-center rounded-full border border-border px-3 text-[10px] font-semibold tracking-widest uppercase hover:bg-muted"
                    >
                      Open report
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </section>

          <section className="mt-10">
            <h2 className="mb-4 text-lg font-bold tracking-tight text-brand-black">
              Recent orders
            </h2>
            <DataTable
              rows={sampleOrders}
              columns={[
                { header: "Order", accessor: (o) => <span className="font-semibold text-brand-black">{o.id}</span> },
                { header: "Date", accessor: (o) => o.date },
                { header: "Items", accessor: (o) => o.items, align: "right" },
                {
                  header: "Total",
                  accessor: (o) => peso(o.total),
                  align: "right",
                },
                {
                  header: "Status",
                  accessor: (o) => (
                    <Badge
                      size="sm"
                      variant={
                        o.status === "delivered"
                          ? "success"
                          : o.status === "shipped"
                            ? "verified"
                            : o.status === "pending"
                              ? "warning"
                              : "muted"
                      }
                    >
                      {o.status}
                    </Badge>
                  ),
                  align: "right",
                },
              ]}
            />
          </section>
        </div>
      </DashboardShell>
    </>
  )
}

function DashboardHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-black">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </header>
  )
}

function Card({
  title,
  link,
  children,
}: {
  title: string
  link?: { to: string; params?: Record<string, string> }
  children: React.ReactNode
}) {
  return (
    <div className="rounded-none border border-border bg-white p-6">
      <header className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold tracking-tight text-brand-black">{title}</h3>
        {link && (
          <Link
            to={link.to}
            params={link.params as never}
            className="inline-flex items-center gap-1 text-xs font-semibold tracking-widest text-brand-orange uppercase hover:underline"
          >
            See all <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
          </Link>
        )}
      </header>
      {children}
    </div>
  )
}
