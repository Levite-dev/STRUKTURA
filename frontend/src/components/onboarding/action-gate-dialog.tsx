import { useOnboardingState, useSaveStep, useSkipStep } from '@/lib/api/onboarding';
import { useAddRole } from '@/lib/api/users';
import type { GateOptions } from './action-gate-provider';
import { StepForm } from './step-form';
import { ROLE_STEPS } from './role-flows';

type Props = {
  opts: GateOptions;
  onComplete: () => void;
  onCancel: () => void;
};

export function ActionGateDialog({ opts, onComplete, onCancel }: Props) {
  const { data: state, isLoading } = useOnboardingState();
  const saveStep = useSaveStep(opts.role);
  const skipStep = useSkipStep(opts.role);
  // addRole is consumed only to satisfy opts.addRoleIfMissing future use
  useAddRole();

  const roleState = state?.roles?.find((r: { role: string }) => r.role === opts.role);
  const steps = ROLE_STEPS[opts.role] ?? [];
  const phaseSteps = steps.filter((s) => s.phase === opts.phase);

  // Find current step within this phase
  const currentStepCode = roleState?.currentStep?.code;
  const currentStep = phaseSteps.find((s) => s.stepCode === currentStepCode) ?? phaseSteps[0];

  // Check if all required steps in this phase are done
  const allPhaseDone = roleState?.phases?.find((p: { phase: number }) => p.phase === opts.phase)?.status === 'COMPLETED';

  if (allPhaseDone) {
    onComplete();
    return null;
  }

  const handleSave = async (data: unknown) => {
    if (!currentStep) return;
    await saveStep.mutateAsync({ stepCode: currentStep.stepCode, data });
    // React Query will refresh state; check if phase is now complete
  };

  const handleSkip = async () => {
    if (!currentStep?.isSkippable) return;
    await skipStep.mutateAsync(currentStep.stepCode);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative bg-background rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {opts.reason ?? `Complete Phase ${opts.phase} to continue`}
            </h2>
            {currentStep && (
              <p className="text-sm text-muted-foreground mt-0.5">{currentStep.title}</p>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading…</div>
        ) : currentStep ? (
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
        ) : (
          <p className="text-muted-foreground">No steps required.</p>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
