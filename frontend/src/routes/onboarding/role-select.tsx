import { useState } from "react"
import { useNavigate, createFileRoute } from "@tanstack/react-router"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ShoppingBag03Icon,
  Store02Icon,
  ConstructionIcon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"
import { type FrontendRole, type BackendRole } from "@/lib/auth-context"

type OnboardingRole = FrontendRole

type RoleOption = {
  id: OnboardingRole
  backendRole: BackendRole
  label: string
  tagline: string
  icon: typeof ShoppingBag03Icon
}

const roles: RoleOption[] = [
  {
    id: "buyer",
    backendRole: "CLIENT",
    label: "Buyer",
    tagline: "Shop construction materials",
    icon: ShoppingBag03Icon,
  },
  {
    id: "seller",
    backendRole: "SUPPLIER",
    label: "Hardware Seller",
    tagline: "List and manage marketplace products",
    icon: Store02Icon,
  },
]

export const Route = createFileRoute("/onboarding/role-select")({
  component: RoleSelectPage,
})

function RoleSelectPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<BackendRole | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSelect = (role: RoleOption) => {
    setSelected(role.backendRole)
    setLoading(true)
    navigate({ to: "/onboarding/$role", params: { role: role.backendRole } })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-3xl flex-col px-4 py-16 sm:px-6 sm:py-24">
        <div className="mb-10 flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-full bg-brand-orange text-white">
            <HugeiconsIcon icon={ConstructionIcon} className="size-5" />
          </span>
          <span className="text-lg font-bold tracking-tight text-brand-black">
            STRUKTURA
          </span>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-brand-black sm:text-4xl">
          Choose your role.
        </h1>
        <p className="mt-2 text-sm text-brand-black/70">
          Pick whether you&rsquo;re buying materials or selling hardware through
          the marketplace.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {roles.map((r) => {
            const isActive = selected === r.backendRole
            return (
              <button
                key={r.id}
                onClick={() => handleSelect(r)}
                disabled={loading}
                className={cn(
                  "relative flex flex-col items-start gap-3 rounded-md border px-5 py-5 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                  isActive
                    ? "border-brand-orange bg-brand-orange/5"
                    : "border-brand-black/15 bg-white hover:border-brand-orange/40",
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId="role-pill"
                    className="absolute inset-0 -z-10 rounded-md bg-brand-orange/[0.06]"
                    transition={{ type: "spring", stiffness: 320, damping: 30 }}
                  />
                )}
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full",
                    isActive
                      ? "bg-brand-orange text-white"
                      : "bg-brand-orange/10 text-brand-orange",
                  )}
                >
                  <HugeiconsIcon icon={r.icon} className="size-5" />
                </span>
                <div>
                  <span className="text-sm font-bold text-brand-black">
                    {r.label}
                  </span>
                  <span className="mt-0.5 block text-xs text-brand-black/60">
                    {r.tagline}
                  </span>
                </div>
                {loading && isActive && (
                  <span className="absolute top-4 right-4 size-4 animate-spin rounded-full border-2 border-brand-orange/30 border-t-brand-orange" />
                )}
              </button>
            )
          })}
        </div>

        <p className="mt-10 text-center text-xs text-brand-black/40">
          Contractor, job seeker, and staff onboarding are not part of this preview.
        </p>
      </div>
    </div>
  )
}
