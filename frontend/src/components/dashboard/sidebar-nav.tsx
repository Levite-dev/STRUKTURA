import { Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Home01Icon,
  ShoppingCart01Icon,
  Briefcase01Icon,
  ConstructionIcon,
  Calculator01Icon,
  Mail01Icon,
  StarIcon,
  ChartLineData01Icon,
  Settings01Icon,
  Wallet01Icon,
  Calendar03Icon,
  AnalyticsIcon,
  AlertCircleIcon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { roleLabels, useRole, type Role } from "./role-context"

type NavItem = { label: string; to: string; icon: typeof Home01Icon; activeOptions?: { exact?: boolean } }

const navByRole: Record<Role, NavItem[]> = {
  client: [
    { label: "Overview", to: "/dashboard/client", icon: Home01Icon, activeOptions: { exact: true } },
    { label: "Material orders", to: "/dashboard/client/orders", icon: ShoppingCart01Icon },
    { label: "Posted jobs", to: "/dashboard/client/jobs", icon: Briefcase01Icon },
    { label: "Active projects", to: "/dashboard/client/projects", icon: ConstructionIcon },
    { label: "Estimates", to: "/dashboard/client/estimates", icon: Calculator01Icon },
    { label: "Settings", to: "/dashboard/client/settings", icon: Settings01Icon },
    { label: "Messages", to: "/messages", icon: Mail01Icon },
  ],
  seller: [
    { label: "Overview", to: "/dashboard/seller", icon: Home01Icon, activeOptions: { exact: true } },
    { label: "Catalog", to: "/dashboard/seller/catalog", icon: ShoppingCart01Icon },
    { label: "Orders", to: "/dashboard/seller/orders", icon: Briefcase01Icon },
    { label: "Reviews", to: "/dashboard/seller/reviews", icon: StarIcon },
    { label: "Sales", to: "/dashboard/seller/payouts", icon: ChartLineData01Icon },
    { label: "Settings", to: "/dashboard/seller/settings", icon: Settings01Icon },
    { label: "Messages", to: "/messages", icon: Mail01Icon },
  ],
  contractor: [
    { label: "Overview", to: "/dashboard/contractor", icon: Home01Icon, activeOptions: { exact: true } },
    { label: "Find jobs", to: "/jobs", icon: Briefcase01Icon },
    { label: "My bids", to: "/dashboard/contractor/bids", icon: Calculator01Icon },
    { label: "Active projects", to: "/dashboard/contractor/projects", icon: ConstructionIcon },
    { label: "Earnings", to: "/dashboard/contractor/earnings", icon: Wallet01Icon },
    { label: "Settings", to: "/dashboard/contractor/settings", icon: Settings01Icon },
    { label: "Messages", to: "/messages", icon: Mail01Icon },
  ],
  company: [
    { label: "Overview", to: "/dashboard/company", icon: Home01Icon, activeOptions: { exact: true } },
    { label: "My services", to: "/dashboard/company/services", icon: ConstructionIcon },
    { label: "Bookings", to: "/dashboard/company/bookings", icon: Calendar03Icon },
    { label: "Sales", to: "/dashboard/company/payouts", icon: ChartLineData01Icon },
    { label: "Settings", to: "/dashboard/company/settings", icon: Settings01Icon },
    { label: "Messages", to: "/messages", icon: Mail01Icon },
  ],
  admin: [
    { label: "Overview", to: "/dashboard/admin", icon: Home01Icon, activeOptions: { exact: true } },
    { label: "Verifications", to: "/dashboard/admin/verifications", icon: CheckmarkBadge01Icon },
    { label: "Disputes", to: "/dashboard/admin/disputes", icon: AlertCircleIcon },
    { label: "Reports", to: "/dashboard/admin/reports", icon: AnalyticsIcon },
    { label: "Settings", to: "/dashboard/admin/settings", icon: Settings01Icon },
  ],
  jobSeeker: [
    { label: "Overview", to: "/dashboard/job-seeker", icon: Home01Icon, activeOptions: { exact: true } },
    { label: "Find jobs", to: "/jobs", icon: Briefcase01Icon },
    { label: "My applications", to: "/dashboard/job-seeker/applications", icon: Calculator01Icon },
    { label: "Settings", to: "/dashboard/job-seeker/settings", icon: Settings01Icon },
    { label: "Messages", to: "/messages", icon: Mail01Icon },
  ],
}

export function SidebarNav({ role }: { role: Role }) {
  const items = navByRole[role]
  return (
    <nav className="flex h-full flex-col gap-2 rounded-none border border-border bg-white p-4">
      <header className="px-3 pt-2 pb-4">
        <p className="text-[10px] tracking-widest text-muted-foreground uppercase">
          Viewing as
        </p>
        <p className="text-sm font-bold text-brand-black">{roleLabels[role]}</p>
      </header>
      <ul className="flex flex-col gap-1">
        {items.map((it) => (
          <li key={`${it.label}-${it.to}`}>
            <Link
              to={it.to}
              activeOptions={it.activeOptions}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-brand-black/70 transition-colors",
                "hover:bg-muted hover:text-brand-black",
                "[&.active]:bg-brand-orange [&.active]:text-white"
              )}
            >
              <HugeiconsIcon icon={it.icon} className="size-4" />
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-auto border-t border-border pt-3">
        <RoleSwitcherInline />
      </div>
    </nav>
  )
}

function RoleSwitcherInline() {
  const { role, setRole } = useRole()
  const roles: Role[] = ["client", "seller", "contractor"]
  return (
    <label className="flex flex-col gap-1.5 px-1">
      <span className="text-[10px] tracking-widest text-muted-foreground uppercase">
        Switch role (demo)
      </span>
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as Role)}
        className="rounded-xl border border-border bg-white px-3 py-2 text-sm focus-visible:border-brand-orange focus-visible:outline-none"
      >
        {roles.map((r) => (
          <option key={r} value={r}>
            {roleLabels[r]}
          </option>
        ))}
      </select>
    </label>
  )
}
