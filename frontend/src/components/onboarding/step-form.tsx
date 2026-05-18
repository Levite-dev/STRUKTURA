import { PersonalInfoStep } from './steps/personal-info-step'
import { BusinessInfoStep } from './steps/business-info-step'
import { PayoutInfoStep } from './steps/payout-info-step'
import { DocumentsStep } from './steps/documents-step'
import { PortfolioStep } from './steps/portfolio-step'
import { SkillsStep } from './steps/skills-step'
import { PreferencesStep } from './steps/preferences-step'
import { TradeProfileStep } from './steps/trade-profile-step'
import { JobSeekerPreferencesStep } from './steps/job-seeker-preferences-step'

type StepFormProps = {
  stepCode: string
  fieldGroupCode: string
  isSkippable: boolean
  onSave: (data: unknown) => Promise<void>
  onSkip: () => Promise<void>
  isSaving: boolean
  isSkipping: boolean
}

/**
 * Dispatches to the right step component based on fieldGroupCode / stepCode.
 * Falls back to a generic placeholder for unimplemented steps.
 */
export function StepForm({
  stepCode,
  fieldGroupCode,
  isSkippable,
  onSave,
  onSkip,
  isSaving,
  isSkipping,
}: StepFormProps) {
  const role = stepCode.split('.')[0]?.toUpperCase() ?? ''

  // Map fieldGroupCode → dedicated component
  if (fieldGroupCode.endsWith('.personal_info') || fieldGroupCode.includes('personal_info')) {
    return (
      <PersonalInfoStep
        onSave={onSave}
        onNext={onSave}
        onSkip={isSkippable ? onSkip : undefined}
        isSaving={isSaving}
        isSkipping={isSkipping}
      />
    )
  }

  if (fieldGroupCode.endsWith('.business_basics') || fieldGroupCode.endsWith('.business_registration')) {
    return (
      <BusinessInfoStep
        onSave={onSave}
        onNext={onSave}
        onSkip={isSkippable ? onSkip : undefined}
        isSaving={isSaving}
        isSkipping={isSkipping}
      />
    )
  }

  if (fieldGroupCode.endsWith('.payout')) {
    return (
      <PayoutInfoStep
        onSave={onSave}
        onNext={onSave}
        onSkip={isSkippable ? onSkip : undefined}
        isSaving={isSaving}
        isSkipping={isSkipping}
      />
    )
  }

  if (fieldGroupCode.endsWith('.verification')) {
    return (
      <DocumentsStep
        role={role}
        onSave={onSave}
        onNext={onSave}
        onSkip={isSkippable ? onSkip : undefined}
        isSaving={isSaving}
        isSkipping={isSkipping}
      />
    )
  }

  if (fieldGroupCode.endsWith('.portfolio')) {
    return (
      <PortfolioStep
        onSave={onSave}
        onNext={onSave}
        onSkip={isSkippable ? onSkip : undefined}
        isSaving={isSaving}
        isSkipping={isSkipping}
      />
    )
  }

  if (fieldGroupCode.endsWith('.skills')) {
    return (
      <SkillsStep
        onSave={onSave}
        onNext={onSave}
        onSkip={isSkippable ? onSkip : undefined}
        isSaving={isSaving}
        isSkipping={isSkipping}
      />
    )
  }

  if (fieldGroupCode.endsWith('.preferences')) {
    return (
      <PreferencesStep
        onSave={onSave}
        onNext={onSave}
        onSkip={isSkippable ? onSkip : undefined}
        isSaving={isSaving}
        isSkipping={isSkipping}
      />
    )
  }

  if (fieldGroupCode.endsWith('.first_service') || fieldGroupCode.endsWith('.service_details')) {
    return (
      <TradeProfileStep
        onSave={onSave}
        onNext={onSave}
        onSkip={isSkippable ? onSkip : undefined}
        isSaving={isSaving}
        isSkipping={isSkipping}
      />
    )
  }

  if (fieldGroupCode.endsWith('.work_history') || fieldGroupCode.includes('jobseeker')) {
    return (
      <JobSeekerPreferencesStep
        onSave={onSave}
        onNext={onSave}
        onSkip={isSkippable ? onSkip : undefined}
        isSaving={isSaving}
        isSkipping={isSkipping}
      />
    )
  }

  // Generic placeholder for unimplemented steps (store_identity, first_product, delivery, cover, etc.)
  return (
    <PlaceholderStep
      stepCode={stepCode}
      isSkippable={isSkippable}
      onSave={onSave}
      onSkip={onSkip}
      isSaving={isSaving}
      isSkipping={isSkipping}
    />
  )
}

function PlaceholderStep({
  stepCode,
  isSkippable,
  onSave,
  onSkip,
  isSaving,
  isSkipping,
}: {
  stepCode: string
  isSkippable: boolean
  onSave: (data: unknown) => Promise<void>
  onSkip: () => Promise<void>
  isSaving: boolean
  isSkipping: boolean
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-dashed border-muted-foreground/30 p-8 text-center text-sm text-muted-foreground">
        <p className="font-mono text-xs mb-2">{stepCode}</p>
        <p>This step form is coming soon.</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => onSave({})}
          disabled={isSaving}
          className="flex-1 bg-primary text-primary-foreground rounded-lg py-2.5 font-medium disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : 'Save & Continue'}
        </button>
        {isSkippable && (
          <button
            onClick={onSkip}
            disabled={isSkipping}
            className="px-4 rounded-lg border py-2.5 text-sm font-medium disabled:opacity-50"
          >
            {isSkipping ? 'Skipping…' : 'Skip'}
          </button>
        )}
      </div>
    </div>
  )
}
