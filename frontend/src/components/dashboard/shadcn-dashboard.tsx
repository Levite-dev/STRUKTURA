import { type ReactNode, useEffect } from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

import { useRole, type Role } from "./role-context"
import { RoleStats } from "./role-stats"
import { RoleTable } from "./role-table"

const titleByRole: Record<Role, string> = {
  client: "Homeowner / Client",
  seller: "Hardware seller",
  contractor: "Contractor",
  company: "Service company",
  admin: "Platform admin",
  jobSeeker: "Job Seeker",
}

export function ShadcnDashboardShell({
  role,
  title,
  children,
}: {
  role: Role
  title?: string
  children: ReactNode
}) {
  const { setRole } = useRole()

  useEffect(() => {
    setRole(role)
  }, [role, setRole])

  return (
    <SidebarProvider
      className="h-screen overflow-hidden"
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar role={role} variant="inset" />
      <SidebarInset className="overflow-y-auto">
        <SiteHeader title={title ?? titleByRole[role]} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function ShadcnDashboard({ role }: { role: Role }) {
  return (
    <ShadcnDashboardShell role={role}>
      <RoleStats role={role} />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <RoleTable role={role} />
    </ShadcnDashboardShell>
  )
}
