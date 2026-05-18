import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost } from '@/lib/api'
import type { BackendRole } from '@/lib/auth-context'

export const onboardingKeys = {
  state: ['onboarding', 'state'] as const,
}

export type OnboardingRoleState = {
  role: string
  flowCode: string
  status: string
  completionPercentage: number
  currentPhase: number
  currentStep: {
    code: string
    title: string
    phase: number
    triggerType: string
    fieldGroupCode: string | null
  } | null
  blockers: unknown[]
  phases: Array<{
    phase: number
    status: string
    steps: Array<{
      code: string
      status: string
      isRequired: boolean
      isSkippable: boolean
      triggerType: string
    }>
  }>
}

export type OnboardingState = {
  userId: string
  primaryRole: string | null
  roles: OnboardingRoleState[]
}

export function useOnboardingState() {
  return useQuery({
    queryKey: onboardingKeys.state,
    queryFn: () => apiGet<OnboardingState>('/onboarding/state'),
  })
}

export function useSaveStep(role: BackendRole) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ stepCode, data }: { stepCode: string; data: unknown }) =>
      apiPost(`/onboarding/step/${stepCode}`, { role, data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: onboardingKeys.state }),
  })
}

export function useSkipStep(role: BackendRole) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (stepCode: string) =>
      apiPost(`/onboarding/step/${stepCode}/skip`, { role }),
    onSuccess: () => qc.invalidateQueries({ queryKey: onboardingKeys.state }),
  })
}
