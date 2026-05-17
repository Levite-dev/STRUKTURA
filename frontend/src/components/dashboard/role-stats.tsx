import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { HugeiconsIcon } from "@hugeicons/react"
import { ChartUpIcon, ChartDownIcon } from "@hugeicons/core-free-icons"

import type { Role } from "./role-context"

type Stat = {
  label: string
  value: string
  delta: string
  trendUp: boolean
  hint: string
  sub: string
}

const statsByRole: Record<Role, Stat[]> = {
  client: [
    {
      label: "Open orders",
      value: "2",
      delta: "+1",
      trendUp: true,
      hint: "Awaiting delivery",
      sub: "Material orders in transit",
    },
    {
      label: "Active projects",
      value: "2",
      delta: "+1",
      trendUp: true,
      hint: "Escrow protected",
      sub: "Funds held until milestones approved",
    },
    {
      label: "Posted jobs",
      value: "3",
      delta: "+2",
      trendUp: true,
      hint: "Bids coming in",
      sub: "Avg 3 bids per job",
    },
    {
      label: "Estimates",
      value: "2",
      delta: "0%",
      trendUp: true,
      hint: "Reports available",
      sub: "PDF downloads ready",
    },
  ],
  seller: [
    {
      label: "Active SKUs",
      value: "12",
      delta: "+4",
      trendUp: true,
      hint: "Across 4 categories",
      sub: "12 SKUs published this month",
    },
    {
      label: "Open orders",
      value: "3",
      delta: "+1",
      trendUp: true,
      hint: "2 ready to ship",
      sub: "1 awaiting payment confirm",
    },
    {
      label: "GMV (30d)",
      value: "₱842,400",
      delta: "+12.5%",
      trendUp: true,
      hint: "vs prior 30d",
      sub: "Strong cement & paint demand",
    },
    {
      label: "Sales (30d)",
      value: "₱631,300",
      delta: "+9.4%",
      trendUp: true,
      hint: "Net of platform commission",
      sub: "Deposited directly to your bank",
    },
  ],
  contractor: [
    {
      label: "Bids in flight",
      value: "5",
      delta: "+2",
      trendUp: true,
      hint: "Awaiting client",
      sub: "Avg 24h client response",
    },
    {
      label: "Active projects",
      value: "2",
      delta: "+1",
      trendUp: true,
      hint: "Escrow protected",
      sub: "Stage 5 & Stage 6",
    },
    {
      label: "Released (90d)",
      value: "₱485,000",
      delta: "+8%",
      trendUp: true,
      hint: "₱99,750 still held in escrow",
      sub: "Funds released per milestone approval",
    },
    {
      label: "Rating",
      value: "4.7",
      delta: "412 reviews",
      trendUp: true,
      hint: "License verified",
      sub: "Top-rated track this quarter",
    },
  ],
  company: [
    {
      label: "Live services",
      value: "4",
      delta: "+1",
      trendUp: true,
      hint: "Across 4 trades",
      sub: "Renovation, paint, plumbing, repair",
    },
    {
      label: "Upcoming bookings",
      value: "2",
      delta: "+1",
      trendUp: true,
      hint: "Next 14 days",
      sub: "1 confirmed · 1 pending",
    },
    {
      label: "Net to bank (90d)",
      value: "₱1,262,254",
      delta: "+16%",
      trendUp: true,
      hint: "Net of platform commission",
      sub: "Deposited directly to your bank",
    },
    {
      label: "Rating",
      value: "4.8",
      delta: "316 reviews",
      trendUp: true,
      hint: "Verified Pro",
      sub: "Top-rated review velocity",
    },
  ],
  admin: [
    {
      label: "Total contractors",
      value: "1,420",
      delta: "+38",
      trendUp: true,
      hint: "Listed on platform",
      sub: "+38 onboarded this month",
    },
    {
      label: "Pending verifications",
      value: "3",
      delta: "Reviewing",
      trendUp: false,
      hint: "Across all types",
      sub: "License + portfolio queue",
    },
    {
      label: "Active projects",
      value: "114",
      delta: "+12",
      trendUp: true,
      hint: "In escrow",
      sub: "Across all stages",
    },
    {
      label: "Escrow held",
      value: "₱98.4M",
      delta: "+9%",
      trendUp: true,
      hint: "All projects",
      sub: "BSP-compliant ledger",
    },
  ],
  jobSeeker: [
    {
      label: "Applications sent",
      value: "5",
      delta: "+3",
      trendUp: true,
      hint: "This week",
      sub: "Awaiting employer response",
    },
    {
      label: "Interviews",
      value: "2",
      delta: "+1",
      trendUp: true,
      hint: "Scheduled",
      sub: "Next: Thu 2PM",
    },
    {
      label: "Profile views",
      value: "28",
      delta: "+12%",
      trendUp: true,
      hint: "Last 7 days",
      sub: "By employers & contractors",
    },
    {
      label: "Skills listed",
      value: "8",
      delta: "+2",
      trendUp: true,
      hint: "Verified",
      sub: "Top match: Carpentry",
    },
  ],
}

export function RoleStats({ role }: { role: Role }) {
  const stats = statsByRole[role]
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      {stats.map((s) => (
        <Card key={s.label} className="@container/card">
          <CardHeader>
            <CardDescription>{s.label}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {s.value}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <HugeiconsIcon
                  icon={s.trendUp ? ChartUpIcon : ChartDownIcon}
                  strokeWidth={2}
                />
                {s.delta}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {s.hint}
            </div>
            <div className="text-muted-foreground">{s.sub}</div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
