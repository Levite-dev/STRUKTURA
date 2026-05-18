import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/lib/auth-context'
import { useOnboardingState, useSaveStep, useSkipStep } from '@/lib/api/onboarding'
import { ROLE_STEPS } from '@/components/onboarding/role-flows'
import { StepForm } from '@/components/onboarding/step-form'
import type { BackendRole } from '@/lib/auth-context'

const VALID_ROLES = ['CLIENT', 'CONTRACTOR', 'SUPPLIER', 'JOB_SEEKER']

export const Route = createFileRoute('/onboarding/$role')({
  component: OnboardingWizard,
})

function OnboardingWizard() {
  const { role } = Route.useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: onboardingState, isLoading } = useOnboardingState()
  const normalizedRole = role.toUpperCase() as BackendRole
  const saveStep = useSaveStep(normalizedRole)
  const skipStep = useSkipStep(normalizedRole)

  if (!VALID_ROLES.includes(normalizedRole)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">Invalid role.</p>
        <button
          onClick={() => navigate({ to: '/dashboard' })}
          className="bg-primary text-primary-foreground rounded px-6 py-2"
        >
          Go back
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="size-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    )
  }

  const roleState = onboardingState?.roles?.find((r) => r.role === normalizedRole)
  const currentStepCode = roleState?.currentStep?.code
  const steps = ROLE_STEPS[normalizedRole] ?? []
  const currentStep = steps.find((s) => s.stepCode === currentStepCode) ?? steps[0]

  const handleSave = async (data: unknown) => {
    if (!currentStep) return
    await saveStep.mutateAsync({ stepCode: currentStep.stepCode, data })
  }

  const handleSkip = async () => {
    if (!currentStep?.isSkippable) return
    await skipStep.mutateAsync(currentStep.stepCode)
  }

  if (!currentStep || roleState?.status === 'COMPLETED') {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">All done!</h1>
        <p className="text-muted-foreground">
          Your {normalizedRole.replace('_', ' ').toLowerCase()} profile is set up.
        </p>
        <button
          onClick={() => navigate({ to: '/dashboard' })}
          className="bg-primary text-primary-foreground rounded px-6 py-2"
        >
          Go to Dashboard
        </button>
      </div>
    )
  }

  const phase = currentStep.phase
  const completionPct = roleState?.completionPercentage ?? 0

  return (
    <div className="max-w-lg mx-auto py-8 px-4 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Phase {phase} of 4</span>
          <span className="text-sm text-muted-foreground">{completionPct}% complete</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      <div>
        <h1 className="text-xl font-semibold">{currentStep.title}</h1>
      </div>

      <StepForm
        key={currentStep.stepCode}
        stepCode={currentStep.stepCode}
        fieldGroupCode={currentStep.fieldGroupCode}
        isSkippable={currentStep.isSkippable}
        onSave={handleSave}
        onSkip={handleSkip}
        isSaving={saveStep.isPending}
        isSkipping={skipStep.isPending}
      />
    </div>
  )
}
