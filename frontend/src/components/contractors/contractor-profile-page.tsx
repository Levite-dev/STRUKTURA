import { Link, useNavigate } from "@tanstack/react-router"
import { useActionGate } from "@/components/onboarding/action-gate-provider"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Location01Icon,
  CheckmarkCircle02Icon,
  Calendar03Icon,
  Mail01Icon,
  Award04Icon,
  ShieldUserIcon,
} from "@hugeicons/core-free-icons"

import { Header } from "@/components/landing/header"
import { Footer } from "@/components/landing/footer"
import { Breadcrumbs } from "@/components/shared/breadcrumbs"
import { RatingStars } from "@/components/shared/rating-stars"
import { VerifiedBadge } from "@/components/shared/verified-badge"
import { UserAvatar as Avatar } from "@/components/shared/user-avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { type Contractor } from "./contractors-data"
import { PortfolioGallery } from "./portfolio-gallery"
import { AvailabilityCalendar } from "./availability-calendar"

export function ContractorProfilePage({ contractor }: { contractor: Contractor }) {
  const { require } = useActionGate()
  const navigate = useNavigate()

  const handleRequestQuotation = async () => {
    const result = await require({ role: 'CLIENT', phase: 2, reason: 'Complete your client profile to request a quotation' })
    if (result === 'cancelled') return
    navigate({ to: '/jobs/post' })
  }

  return (
    <div className="bg-background">
      <Header />
      <main className="pt-32 pb-20">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-10 lg:px-16">
          <Breadcrumbs
            className="mb-6"
            items={[
              { label: "Contractors", to: "/contractors" },
              { label: contractor.trade },
              { label: contractor.name },
            ]}
          />

          <header className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="flex flex-col gap-4 rounded-none border border-border bg-white p-6 sm:p-8">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                <Avatar src={contractor.avatar} alt={contractor.name} size="xl" />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="muted">{contractor.trade}</Badge>
                    <VerifiedBadge level={contractor.badgeLevel} />
                    {contractor.featured && (
                      <Badge variant="accent" size="sm">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <h1 className="mt-2 text-3xl font-bold tracking-tight text-brand-black sm:text-4xl">
                    {contractor.name}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-brand-black/70">
                    <span className="inline-flex items-center gap-1.5">
                      <HugeiconsIcon icon={Location01Icon} className="size-4" />
                      {contractor.location}
                    </span>
                    <RatingStars rating={contractor.rating} reviews={contractor.reviewCount} />
                    <span className="inline-flex items-center gap-1.5">
                      <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-4" />
                      {contractor.jobsCompleted} jobs
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <HugeiconsIcon icon={ShieldUserIcon} className="size-4" />
                      {contractor.yearsExperience} yrs experience
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-base text-brand-black/80">{contractor.bio}</p>

              <div className="flex flex-wrap gap-2">
                {contractor.expertiseTags.map((t) => (
                  <Badge key={t} variant="outline" size="lg">
                    {t}
                  </Badge>
                ))}
              </div>
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="flex flex-col gap-3 rounded-none border border-border bg-white p-6">
                <div>
                  <span className="text-xs tracking-widest text-muted-foreground uppercase">
                    Starting from
                  </span>
                  <p className="text-3xl font-bold tracking-tight text-brand-black">
                    {contractor.startingFrom}
                  </p>
                </div>
                <Separator />
                <Link
                  to="/messages"
                  search={{ to: contractor.id }}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-none bg-brand-orange text-xs font-semibold tracking-widest text-white uppercase transition-colors hover:bg-brand-orange-soft"
                >
                  <HugeiconsIcon icon={Mail01Icon} className="size-4" />
                  Message
                </Link>
                <button
                  type="button"
                  onClick={handleRequestQuotation}
                  className="inline-flex h-12 items-center justify-center rounded-none border border-border bg-white text-xs font-semibold tracking-widest text-brand-black uppercase hover:bg-muted"
                >
                  Invite to bid
                </button>
                <p className="text-center text-[10px] tracking-widest text-muted-foreground uppercase">
                  Escrow protected · 8% commission on award
                </p>
              </div>
            </aside>
          </header>

          <section className="mt-12">
            <Tabs defaultValue="portfolio">
              <TabsList className="border border-border bg-muted/80">
                <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({contractor.reviews.length})</TabsTrigger>
                <TabsTrigger value="history">Work history</TabsTrigger>
                <TabsTrigger value="credentials">Credentials</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
              </TabsList>

              <TabsContent value="portfolio" className="mt-6">
                <PortfolioGallery items={contractor.portfolio} />
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <ul className="grid gap-3 sm:grid-cols-2">
                  {contractor.reviews.map((r, i) => (
                    <li
                      key={i}
                      className="flex flex-col gap-2 rounded-none border border-border bg-white p-5"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar fallback={r.author} size="sm" />
                          <div>
                            <p className="text-sm font-semibold text-brand-black">{r.author}</p>
                            <p className="text-xs text-muted-foreground">{r.date}</p>
                          </div>
                        </div>
                        <RatingStars rating={r.rating} />
                      </div>
                      <p className="text-sm text-brand-black/80">{r.text}</p>
                    </li>
                  ))}
                </ul>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <table className="w-full text-left text-sm">
                  <thead className="text-xs tracking-widest text-muted-foreground uppercase">
                    <tr className="border-b border-border">
                      <th className="py-3 pr-4">Project</th>
                      <th className="py-3 pr-4">Client</th>
                      <th className="py-3 pr-4">Year</th>
                      <th className="py-3 text-right">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contractor.workHistory.map((w, i) => (
                      <tr key={i} className="border-b border-border last:border-0">
                        <td className="py-3 pr-4 font-medium text-brand-black">{w.jobTitle}</td>
                        <td className="py-3 pr-4 text-brand-black/70">{w.client}</td>
                        <td className="py-3 pr-4 text-brand-black/70">{w.year}</td>
                        <td className="py-3 text-right font-semibold text-brand-black">{w.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TabsContent>

              <TabsContent value="credentials" className="mt-6">
                {contractor.certifications.length === 0 ? (
                  <p className="rounded-none border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                    No published certifications. Identity verified by platform.
                  </p>
                ) : (
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {contractor.certifications.map((c, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-3 rounded-none border border-border bg-white p-5"
                      >
                        <span className="flex size-10 items-center justify-center rounded-none bg-brand-orange/10 text-brand-orange">
                          <HugeiconsIcon icon={Award04Icon} className="size-5" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-brand-black">{c.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {c.issuer} · {c.year}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="availability" className="mt-6">
                <div className="grid gap-4 sm:grid-cols-[1fr_320px]">
                  <AvailabilityCalendar cells={contractor.availability} />
                  <div className="rounded-none border border-border bg-white p-5">
                    <span className="flex size-10 items-center justify-center rounded-none bg-brand-orange/10 text-brand-orange">
                      <HugeiconsIcon icon={Calendar03Icon} className="size-5" />
                    </span>
                    <h3 className="mt-3 text-sm font-bold text-brand-black">
                      Need to book a time?
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Send a message or post a project — the contractor will respond
                      within their next available window.
                    </p>
                    <Link
                      to="/messages"
                      search={{ to: contractor.id }}
                      className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-none bg-brand-black text-xs font-semibold tracking-wide text-white uppercase hover:bg-brand-black/90"
                    >
                      Open chat
                    </Link>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
