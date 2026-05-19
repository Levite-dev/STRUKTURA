import { useNavigate, Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Location01Icon,
  Calendar03Icon,
  WalletAdd01Icon,
  ShieldUserIcon,
  Clock01Icon,
} from "@hugeicons/core-free-icons"

import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { Badge } from "@/components/ui/badge"
import { UserAvatar as Avatar } from "@/components/shared/user-avatar"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useActionGate } from "@/components/onboarding/action-gate-provider"
import { type Job } from "./jobs-data"
import { bidsForJob } from "./bids-data"
import { BidsList } from "./bids-list"

export function JobDetailPage({ job }: { job: Job }) {
  const bids = bidsForJob(job.id)
  const lowest = bids.length ? Math.min(...bids.map((b) => b.amount)) : null
  const highest = bids.length ? Math.max(...bids.map((b) => b.amount)) : null
  const { require } = useActionGate()
  const navigate = useNavigate()

  const handleApply = async () => {
    const result = await require({ role: 'JOB_SEEKER', phase: 2, addRoleIfMissing: true, reason: 'Complete your job seeker profile to apply' })
    if (result === 'cancelled') return
    navigate({ to: '/jobs/$jobId/bid', params: { jobId: job.id } })
  }

  return (
    <div className="bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-16">
          <Breadcrumbs
            className="mb-6"
            items={[
              { label: "Jobs", to: "/jobs" },
              { label: job.category },
              { label: job.title },
            ]}
          />

          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-6">
              <header className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="muted">{job.category}</Badge>
                  <Badge variant="outline">{job.startWindow}</Badge>
                  <Badge variant="topRated">{job.bidCount} bids</Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-brand-black sm:text-4xl">
                  {job.title}
                </h1>
                <div className="flex flex-wrap gap-4 text-sm text-brand-black/70">
                  <span className="inline-flex items-center gap-1.5">
                    <HugeiconsIcon icon={Location01Icon} className="size-4" />
                    {job.location}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <HugeiconsIcon icon={WalletAdd01Icon} className="size-4" />
                    {job.budget}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <HugeiconsIcon icon={Clock01Icon} className="size-4" />
                    Posted {job.postedAgo}
                  </span>
                </div>
              </header>

              <Tabs defaultValue="overview">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="bids">Bids ({bids.length})</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6 space-y-6">
                  <section className="rounded-none border border-border bg-white p-6">
                    <h2 className="text-lg font-bold text-brand-black">Project scope</h2>
                    <p className="mt-3 text-sm leading-relaxed text-brand-black/80">
                      {job.description}
                    </p>
                  </section>

                  <section className="grid gap-4 sm:grid-cols-3">
                    <Stat
                      icon={Calendar03Icon}
                      label="Start window"
                      value={job.startWindow}
                    />
                    <Stat icon={WalletAdd01Icon} label="Budget" value={job.budget} />
                    <Stat icon={Clock01Icon} label="Bids open for" value="7 days" />
                  </section>

                  <section className="flex items-center justify-between gap-4 rounded-none border border-dashed border-brand-orange/30 bg-brand-orange/5 p-5">
                    <div>
                      <p className="text-sm font-semibold text-brand-black">
                        Want this project?
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Submit your bid in under 5 minutes. Funds held in escrow on award.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleApply}
                      className="inline-flex h-11 items-center justify-center rounded-none bg-brand-orange px-6 text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-brand-orange-soft"
                    >
                      Submit bid
                    </button>
                  </section>
                </TabsContent>

                <TabsContent value="bids" className="mt-6">
                  <BidsList bids={bids} />
                </TabsContent>

                <TabsContent value="timeline" className="mt-6">
                  <ol className="relative space-y-6 border-l-2 border-border pl-6">
                    {[
                      { stage: "Posted", body: `Project went live ${job.postedAgo}.` },
                      { stage: "Bidding open", body: "Contractors submit competitive bids." },
                      { stage: "Award", body: "Client picks contractor; escrow funded." },
                      { stage: "In progress", body: "Milestones approved as work proceeds." },
                      { stage: "Completion", body: "Final payment released; review submitted." },
                    ].map((s, i) => (
                      <li key={i} className="relative">
                        <span className="absolute -left-[33px] top-1 size-4 rounded-full border-2 border-brand-orange bg-white" />
                        <p className="text-xs tracking-widest text-brand-black/60 uppercase">
                          Stage {i + 1}
                        </p>
                        <p className="text-sm font-semibold text-brand-black">{s.stage}</p>
                        <p className="text-sm text-muted-foreground">{s.body}</p>
                      </li>
                    ))}
                  </ol>
                </TabsContent>
              </Tabs>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="space-y-4 rounded-none border border-border bg-white p-6">
                <div>
                  <p className="text-xs tracking-widest text-muted-foreground uppercase">
                    Posted by
                  </p>
                  <div className="mt-2 flex items-center gap-3">
                    <Avatar fallback={job.buyer.name} />
                    <div>
                      <p className="font-semibold text-brand-black">{job.buyer.name}</p>
                      {job.buyer.verified && (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <HugeiconsIcon icon={ShieldUserIcon} className="size-3.5" />
                          ID verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {bids.length > 0 && (
                  <div className="rounded-none bg-muted p-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Lowest bid</span>
                      <span className="font-semibold text-brand-black">
                        ₱{lowest?.toLocaleString()}
                      </span>
                    </div>
                    <div className="mt-1 flex justify-between">
                      <span className="text-muted-foreground">Highest bid</span>
                      <span className="font-semibold text-brand-black">
                        ₱{highest?.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleApply}
                  className="inline-flex h-11 w-full items-center justify-center rounded-none bg-brand-orange text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-brand-orange-soft"
                >
                  Submit a bid
                </button>
                <Link
                  to="/messages"
                  search={{ to: job.id }}
                  className="inline-flex h-11 w-full items-center justify-center rounded-none border border-border bg-white text-xs font-semibold tracking-widest text-brand-black uppercase transition-colors hover:bg-muted"
                >
                  Message client
                </Link>
                <p className="text-center text-[10px] tracking-widest text-muted-foreground uppercase">
                  Bidding fee: free · 8% commission on award
                </p>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: typeof Calendar03Icon
  label: string
  value: string
}) {
  return (
    <div className="rounded-none border border-border bg-white p-4">
      <span className="flex size-9 items-center justify-center rounded-none bg-brand-orange/10 text-brand-orange">
        <HugeiconsIcon icon={icon} className="size-4" />
      </span>
      <p className="mt-3 text-xs tracking-widest text-muted-foreground uppercase">{label}</p>
      <p className="text-sm font-semibold text-brand-black">{value}</p>
    </div>
  )
}
