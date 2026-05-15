import { Role } from '@prisma/client';
import { OnboardingState } from '../entities/onboarding-state.entity';

export const ONBOARDING_STATE_REPOSITORY = Symbol(
  'ONBOARDING_STATE_REPOSITORY',
);

export interface OnboardingStateRepository {
  findByUserAndRole(
    userId: string,
    role: Role,
  ): Promise<OnboardingState | null>;
  findById(id: string): Promise<OnboardingState | null>;
  createForUserRole(userId: string, role: Role): Promise<OnboardingState>;
  save(state: OnboardingState): Promise<OnboardingState>;
  listPending(): Promise<OnboardingState[]>;
}
