import { useMemo, useState } from "react"
import { Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  ArrowRight01Icon,
  StarIcon,
  ArrowDown01Icon,
  CheckmarkBadge02Icon,
  Location01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/primitives"
import {
  serviceCategories,
  servicePros,
  proSortOptions,
  type ServiceCategory,
  type ServicePro,
  type ProSortOption,
} from "./services-data"

export function ServicesPage({
  initialQuery = "",
  initialCategory = null,
}: {
  initialQuery?: string
  initialCategory?: ServiceCategory | null
}) {
  const [query, setQuery] = useState(initialQuery)
  const [activeCategory, setActiveCategory] = useState<ServiceCategory | null>(
    initialCategory
  )
  const [sort, setSort] = useState<ProSortOption>("popular")

  const visible = useMemo(() => {
    let list: ServicePro[] = servicePros
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.location.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.blurb.toLowerCase().includes(q)
      )
    }
    if (activeCategory) list = list.filter((p) => p.category === activeCategory)
    switch (sort) {
      case "rating":
        list = [...list].sort((a, b) => b.rating - a.rating)
        break
      case "jobs":
        list = [...list].sort((a, b) => b.jobsCompleted - a.jobsCompleted)
        break
    }
    return list
  }, [query, activeCategory, sort])

  return (
    <main className="bg-background">
      <Hero query={query} setQuery={setQuery} />

      <section className="bg-background pt-4 pb-16 sm:pt-6 sm:pb-20 lg:pb-24">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6">
          <Reveal>
            <CategoryRail
              active={activeCategory}
              setActive={setActiveCategory}
            />
          </Reveal>

          <div className="mt-8 mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm text-brand-black/75">
              <span className="font-bold text-brand-black">{visible.length}</span>{" "}
              of {servicePros.length} verified pros
              {activeCategory ? ` for ${activeCategory}` : ""}
            </p>
            <SortMenu sort={sort} setSort={setSort} />
          </div>

          {visible.length === 0 ? (
            <EmptyState
              onClear={() => {
                setQuery("")
                setActiveCategory(null)
              }}
            />
          ) : (
            <StaggerGroup
              key={`${activeCategory ?? "all"}-${sort}-${query}`}
              className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"
            >
              {visible.map((p) => (
                <StaggerItem key={p.id}>
                  <ProCard pro={p} />
                </StaggerItem>
              ))}
            </StaggerGroup>
          )}
        </div>
      </section>
    </main>
  )
}

function Hero({
  query,
  setQuery,
}: {
  query: string
  setQuery: (v: string) => void
}) {
  return (
    <section className="relative isolate overflow-hidden bg-brand-ink pt-32 pb-12 text-white sm:pt-40 lg:pt-44">
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1920&q=80&auto=format&fit=crop')",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-b from-brand-ink/95 via-brand-ink/85 to-brand-ink"
      />
      <div className="relative mx-auto max-w-[1280px] px-4 sm:px-6">
        <span className="inline-flex items-center gap-2 rounded-full border border-brand-orange/40 bg-brand-orange/10 px-4 py-1.5 text-[11px] font-semibold tracking-[0.2em] text-brand-orange uppercase">
          <span className="size-1.5 rounded-none bg-brand-orange" />
          Marketplace · Services
        </span>

        <h1 className="mt-5 text-3xl leading-tight font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
          Hire 1,800+ verified pros.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-white/80">
          Filter by trade and location, compare ratings and jobs completed,
          or post a job to get up to 5 priced bids in 24 hours.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            to="/jobs/post"
            className="inline-flex items-center gap-2 rounded-none bg-brand-orange px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-soft"
          >
            Post a job
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
          </Link>
          <Link
            to="/services/post"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            List your service
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
          </Link>
        </div>
        <p className="mt-3 text-xs text-white/80">
          Buyers post jobs free · contractors list services free
        </p>

        <form
          className="mt-6 flex max-w-3xl items-center gap-2 rounded-full bg-white p-1.5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)] focus-within:ring-2 focus-within:ring-brand-orange/40"
          onSubmit={(e) => e.preventDefault()}
        >
          <span className="flex size-9 shrink-0 items-center justify-center text-brand-black/65">
            <HugeiconsIcon icon={Search01Icon} className="size-4" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search trades or pros — roofing, plumber, painter…"
            className="flex-1 bg-transparent py-1.5 text-sm text-brand-black placeholder:text-brand-black/45 outline-none"
          />
        </form>
      </div>
    </section>
  )
}

function CategoryRail({
  active,
  setActive,
}: {
  active: ServiceCategory | null
  setActive: (c: ServiceCategory | null) => void
}) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pt-10 pb-2 sm:mx-0 sm:px-0">
      <div className="flex min-w-max gap-2 sm:flex-wrap sm:gap-2">
        <button
          type="button"
          onClick={() => setActive(null)}
          className={cn(
            "relative inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
            active === null
              ? "border-brand-orange bg-brand-orange text-white"
              : "border-brand-black/10 bg-white text-brand-black/70 hover:border-brand-orange/40 hover:text-brand-orange"
          )}
        >
          {active === null && (
            <motion.span
              layoutId="cat-pill"
              className="absolute inset-0 rounded-full bg-brand-orange"
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
            />
          )}
          <span className="relative">All trades</span>
        </button>
        {serviceCategories.map((c) => {
          const isActive = active === c.name
          return (
            <button
              key={c.name}
              type="button"
              onClick={() => setActive(c.name)}
              className={cn(
                "relative inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors",
                isActive
                  ? "border-brand-orange bg-brand-orange text-white"
                  : "border-brand-black/10 bg-white text-brand-black/70 hover:border-brand-orange/40 hover:text-brand-orange"
              )}
            >
              {isActive && (
                <motion.span
                  layoutId="cat-pill"
                  className="absolute inset-0 rounded-full bg-brand-orange"
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <HugeiconsIcon icon={c.icon} className="size-3.5" />
                {c.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function SortMenu({
  sort,
  setSort,
}: {
  sort: ProSortOption
  setSort: (s: ProSortOption) => void
}) {
  const [open, setOpen] = useState(false)
  const active = proSortOptions.find((s) => s.id === sort)!
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-full border border-brand-black/15 bg-white px-4 py-2 text-xs font-semibold text-brand-black transition-colors hover:border-brand-orange/40"
      >
        Sort: {active.label}
        <HugeiconsIcon icon={ArrowDown01Icon} className="size-3.5" />
      </button>
      {open && (
        <div className="absolute top-full right-0 z-10 mt-2 w-56 rounded-md border border-brand-black/10 bg-white p-1 shadow-lg">
          {proSortOptions.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                setSort(o.id)
                setOpen(false)
              }}
              className={cn(
                "block w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                o.id === sort
                  ? "bg-brand-orange/10 font-semibold text-brand-orange"
                  : "text-brand-black/75 hover:bg-brand-black/5"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ProCard({ pro }: { pro: ServicePro }) {
  return (
    <Link
      to="/services/$serviceId"
      params={{ serviceId: pro.id }}
      className="group flex h-full flex-col overflow-hidden rounded-md border border-brand-black/10 bg-white shadow-[0_8px_20px_-12px_rgba(0,0,0,0.12)] transition-all hover:-translate-y-1 hover:border-brand-orange/40 hover:shadow-[0_25px_50px_-25px_rgba(255,116,32,0.25)]">
      <div className="relative aspect-[16/10] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url('${pro.image}')` }}
        />
        {pro.badge && (
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-[10px] font-semibold text-brand-black shadow-md">
            <HugeiconsIcon
              icon={CheckmarkBadge02Icon}
              className="size-3 text-brand-orange"
            />
            {pro.badge}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="text-[10px] font-semibold tracking-[0.25em] text-brand-orange uppercase">
          {pro.category}
        </p>
        <h3 className="mt-1 text-base leading-snug font-bold text-brand-black">
          {pro.name}
        </h3>

        <div className="mt-1 flex items-center gap-3 text-xs text-brand-black/70">
          <span className="inline-flex items-center gap-1">
            <HugeiconsIcon
              icon={Location01Icon}
              className="size-3.5 text-brand-orange"
            />
            {pro.location}
          </span>
          <span className="inline-flex items-center gap-1">
            <HugeiconsIcon icon={StarIcon} className="size-3.5 text-brand-orange" />
            <span className="font-semibold text-brand-black">{pro.rating}</span>
            <span>· {pro.reviews}</span>
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-brand-black/75">
          {pro.blurb}
        </p>

        <p className="mt-3 text-[11px] text-brand-black/65">
          <span className="font-bold text-brand-black">{pro.jobsCompleted}</span>{" "}
          jobs completed on STRUKTURA
        </p>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="text-[11px] tracking-wider text-brand-black/45 uppercase">
              Starting from
            </p>
            <p className="text-lg font-extrabold text-brand-black">
              {pro.startingFrom}
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-none bg-brand-orange px-4 py-2 text-[11px] font-semibold tracking-[0.18em] text-white uppercase transition-colors group-hover:bg-brand-orange-soft">
            View profile
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="rounded-md border border-dashed border-brand-black/15 bg-brand-black/[0.02] p-12 text-center">
      <p className="text-sm font-semibold text-brand-black">No pros match</p>
      <p className="mt-1 text-xs text-brand-black/65">
        Try clearing the filters or search a different trade.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-5 inline-flex items-center gap-2 rounded-none bg-brand-orange px-5 py-2.5 text-xs font-semibold tracking-[0.2em] text-white uppercase transition-colors hover:bg-brand-orange-soft"
      >
        Reset filters
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-3" />
      </button>
    </div>
  )
}
