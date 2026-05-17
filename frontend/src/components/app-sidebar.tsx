import * as React from "react"
import { Link, useRouterState } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  DashboardSquare01Icon,
  ShoppingCart01Icon,
  Briefcase01Icon,
  ConstructionIcon,
  Calculator01Icon,
  Mail01Icon,
  PackageIcon,
  UserGroup03Icon,
  Settings05Icon,
  Search01Icon,
  StarIcon,
  ChartLineData01Icon,
  Wallet01Icon,
  AnalyticsIcon,
  AlertCircleIcon,
  CheckmarkBadge01Icon,
  Calendar03Icon,
} from "@hugeicons/core-free-icons"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import { NavUser } from "@/components/nav-user"
import { useRole, roleLabels, type Role } from "@/components/dashboard/role-context"

const userByRole: Record<Role, { name: string; email: string; avatar: string }> = {
  client: { name: "Juan Dela Cruz", email: "juan@example.ph", avatar: "/avatars/shadcn.jpg" },
  seller: { name: "Eagle Materials", email: "ops@eagle-materials.ph", avatar: "/avatars/shadcn.jpg" },
  contractor: { name: "Stormshield Roofing", email: "ops@stormshield.ph", avatar: "/avatars/shadcn.jpg" },
  company: { name: "Studio Manille", email: "studio@manille.ph", avatar: "/avatars/shadcn.jpg" },
  admin: { name: "Platform Admin", email: "admin@struktura.ph", avatar: "/avatars/shadcn.jpg" },
  jobSeeker: { name: "Maria Santos", email: "maria@example.ph", avatar: "/avatars/shadcn.jpg" },
}

type NavItem = {
  title: string
  to: string
  icon: typeof DashboardSquare01Icon
}

const navByRole: Record<Role, { primary: NavItem[]; secondary: NavItem[] }> = {
  client: {
    primary: [
      { title: "Overview", to: "/dashboard/client", icon: DashboardSquare01Icon },
      { title: "Material orders", to: "/dashboard/client/orders", icon: ShoppingCart01Icon },
      { title: "Posted jobs", to: "/dashboard/client/jobs", icon: Briefcase01Icon },
      { title: "Active projects", to: "/dashboard/client/projects", icon: ConstructionIcon },
      { title: "Estimates", to: "/dashboard/client/estimates", icon: Calculator01Icon },
    ],
    secondary: [
      { title: "Messages", to: "/messages", icon: Mail01Icon },
      { title: "Settings", to: "/dashboard/client/settings", icon: Settings05Icon },
    ],
  },
  seller: {
    primary: [
      { title: "Overview", to: "/dashboard/seller", icon: DashboardSquare01Icon },
      { title: "Catalog", to: "/dashboard/seller/catalog", icon: PackageIcon },
      { title: "Orders", to: "/dashboard/seller/orders", icon: ShoppingCart01Icon },
      { title: "Reviews", to: "/dashboard/seller/reviews", icon: StarIcon },
      { title: "Sales", to: "/dashboard/seller/payouts", icon: ChartLineData01Icon },
    ],
    secondary: [
      { title: "Messages", to: "/messages", icon: Mail01Icon },
      { title: "Settings", to: "/dashboard/seller/settings", icon: Settings05Icon },
    ],
  },
  contractor: {
    primary: [
      { title: "Overview", to: "/dashboard/contractor", icon: DashboardSquare01Icon },
      { title: "Find jobs", to: "/jobs", icon: Search01Icon },
      { title: "My bids", to: "/dashboard/contractor/bids", icon: Briefcase01Icon },
      { title: "Active projects", to: "/dashboard/contractor/projects", icon: ConstructionIcon },
      { title: "Earnings", to: "/dashboard/contractor/earnings", icon: Wallet01Icon },
    ],
    secondary: [
      { title: "Messages", to: "/messages", icon: Mail01Icon },
      { title: "Settings", to: "/dashboard/contractor/settings", icon: Settings05Icon },
    ],
  },
  company: {
    primary: [
      { title: "Overview", to: "/dashboard/company", icon: DashboardSquare01Icon },
      { title: "My services", to: "/dashboard/company/services", icon: ConstructionIcon },
      { title: "Bookings", to: "/dashboard/company/bookings", icon: Calendar03Icon },
      { title: "Sales", to: "/dashboard/company/payouts", icon: ChartLineData01Icon },
    ],
    secondary: [
      { title: "Messages", to: "/messages", icon: Mail01Icon },
      { title: "Settings", to: "/dashboard/company/settings", icon: Settings05Icon },
    ],
  },
  admin: {
    primary: [
      { title: "Overview", to: "/dashboard/admin", icon: DashboardSquare01Icon },
      { title: "Verifications", to: "/dashboard/admin/verifications", icon: CheckmarkBadge01Icon },
      { title: "Disputes", to: "/dashboard/admin/disputes", icon: AlertCircleIcon },
      { title: "Reports", to: "/dashboard/admin/reports", icon: AnalyticsIcon },
      { title: "Contractors", to: "/contractors", icon: UserGroup03Icon },
    ],
    secondary: [
      { title: "Messages", to: "/messages", icon: Mail01Icon },
      { title: "Settings", to: "/dashboard/admin/settings", icon: Settings05Icon },
    ],
  },
  jobSeeker: {
    primary: [
      { title: "Overview", to: "/dashboard/job-seeker", icon: DashboardSquare01Icon },
      { title: "Find jobs", to: "/jobs", icon: Search01Icon },
      { title: "My applications", to: "/dashboard/job-seeker/applications", icon: Briefcase01Icon },
    ],
    secondary: [
      { title: "Messages", to: "/messages", icon: Mail01Icon },
      { title: "Settings", to: "/dashboard/job-seeker/settings", icon: Settings05Icon },
    ],
  },
}

export function AppSidebar({
  role: roleProp,
  ...props
}: React.ComponentProps<typeof Sidebar> & { role?: Role }) {
  const { role: ctxRole } = useRole()
  const role = roleProp ?? ctxRole
  const { location } = useRouterState()
  const items = navByRole[role]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link to="/" />}
            >
              <span className="flex size-7 items-center justify-center rounded-full bg-brand-orange text-white">
                <HugeiconsIcon icon={ConstructionIcon} strokeWidth={2} className="size-4!" />
              </span>
              <span className="text-base font-semibold tracking-tight">STRUKTURA</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{roleLabels[role]}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.primary.map((item) => {
                const active = location.pathname === item.to
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      data-active={active}
                      render={<Link to={item.to} />}
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {items.secondary.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={<Link to={item.to} />}
                  >
                    <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Switch role"
              render={<Link to="/dashboard" />}
            >
              <HugeiconsIcon icon={UserGroup03Icon} strokeWidth={2} />
              <span>Switch role</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <NavUser user={userByRole[role]} />
      </SidebarFooter>
    </Sidebar>
  )
}
