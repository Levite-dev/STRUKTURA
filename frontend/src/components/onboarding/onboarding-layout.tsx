import { Link } from "@tanstack/react-router"
import { motion } from "motion/react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ConstructionIcon,
  CheckmarkCircle01Icon,
  CircleIcon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/lib/utils"

type StepItem = {
  key: string
  label: string
  description?: string | null
  completed: boolean
  current: boolean
}

type OnboardingLayoutProps = {
  roleLabel: string
  steps: StepItem[]
  currentStepIndex: number
  totalSteps: number
  onBack?: () => void
  showBack?: boolean
  children: React.ReactNode
}

export function OnboardingLayout({
  roleLabel,
  steps,
  currentStepIndex,
  totalSteps,
  onBack,
  showBack = true,
  children,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[330px_1fr]">
      <aside className="relative hidden min-h-screen overflow-hidden border-r border-brand-black/5 bg-[#e8eaed] px-8 py-9 lg:flex lg:flex-col">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-full text-brand-black">
            <HugeiconsIcon icon={ConstructionIcon} className="size-6" />
          </span>
          <span className="text-base font-extrabold tracking-tight text-brand-black">
            STRUKTURA
          </span>
        </Link>

        <nav className="relative z-10 mt-16 space-y-6">
          <p className="sr-only">{roleLabel} onboarding steps</p>
          {steps.map((step, index) => {
            const isDone = step.completed
            const isCurrent = step.current
            return (
              <div key={step.key} className="relative flex gap-3">
                {index < steps.length - 1 && (
                  <span className="absolute top-8 left-4 h-10 w-px bg-brand-black/10" />
                )}
                <motion.span
                  layout
                  transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                  className={cn(
                    "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-md border bg-white transition-colors duration-300",
                    isDone && "border-emerald-100 bg-emerald-50 text-emerald-600",
                    isCurrent &&
                      !isDone &&
                      "border-brand-orange/20 bg-brand-orange/10 text-brand-orange",
                    !isDone &&
                      !isCurrent &&
                      "border-brand-black/10 text-brand-black/35",
                  )}
                >
                  <HugeiconsIcon
                    icon={isDone ? CheckmarkCircle01Icon : CircleIcon}
                    className="size-4"
                  />
                </motion.span>
                <div className="pt-0.5">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      isCurrent ? "text-brand-black" : "text-brand-black/55",
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && (
                    <p
                      className={cn(
                        "mt-1 max-w-[210px] text-xs leading-5",
                        isCurrent ? "text-brand-black/65" : "text-brand-black/40",
                      )}
                    >
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </nav>

        <HugeiconsIcon
          icon={ConstructionIcon}
          className="pointer-events-none absolute right-[-28px] bottom-24 size-56 rotate-[-28deg] text-brand-black/[0.035]"
        />

        <div className="relative z-10 mt-auto flex items-center justify-between text-xs font-semibold text-brand-black">
          <Link to="/" className="inline-flex items-center gap-2 hover:text-brand-orange">
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
            Back to home
          </Link>
          <Link to="/auth/login" className="hover:text-brand-orange">
            Sign in
          </Link>
        </div>
      </aside>

      <main className="flex min-h-screen flex-col px-4 py-8 sm:px-8 lg:px-16">
        <div className="mb-8 flex items-center justify-between lg:hidden">
          <Link to="/" className="flex items-center gap-2">
            <HugeiconsIcon icon={ConstructionIcon} className="size-6" />
            <span className="text-base font-extrabold tracking-tight text-brand-black">
              STRUKTURA
            </span>
          </Link>
          <span className="text-xs font-semibold text-brand-black/50">
            {currentStepIndex}/{totalSteps}
          </span>
        </div>

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-brand-black/60 transition-colors hover:text-brand-orange"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
              Back
            </button>
          )}
          {children}
          </div>
        </div>

        <div className="mx-auto mt-8 flex w-full max-w-xs justify-center gap-3 lg:max-w-sm">
          {steps.map((step) => (
            <motion.span
              key={step.key}
              layout
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors duration-300",
                step.completed || step.current
                  ? "bg-brand-orange"
                  : "bg-brand-black/10",
              )}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
