import { Link } from "@tanstack/react-router"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ConstructionIcon,
  CheckmarkCircle01Icon,
  HourglassIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons"

type OnboardingCompleteProps = {
  roleLabel: string
  requiresVerification: boolean
}

export function OnboardingComplete({
  roleLabel,
  requiresVerification,
}: OnboardingCompleteProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
      <Link to="/" className="mb-12 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-full bg-brand-orange text-white">
          <HugeiconsIcon icon={ConstructionIcon} className="size-5" />
        </span>
        <span className="text-lg font-bold tracking-tight text-brand-black">
          STRUKTURA
        </span>
      </Link>

      <div className="mx-auto max-w-md text-center">
        {requiresVerification ? (
          <>
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <HugeiconsIcon icon={HourglassIcon} className="size-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-black">
              Under Review
            </h1>
            <p className="mt-3 text-sm text-brand-black/70">
              Your {roleLabel.toLowerCase()} application has been submitted and
              is being reviewed. We&apos;ll verify your documents and get back
              to you within 1–2 business days.
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <HugeiconsIcon icon={CheckmarkCircle01Icon} className="size-8" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-brand-black">
              You&apos;re All Set!
            </h1>
            <p className="mt-3 text-sm text-brand-black/70">
              Welcome to STRUKTURA as a {roleLabel.toLowerCase()}. Your account
              is ready — start exploring the marketplace.
            </p>
          </>
        )}

        <Link
          to="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-orange px-8 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-orange-soft"
        >
          Go to Dashboard
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}
