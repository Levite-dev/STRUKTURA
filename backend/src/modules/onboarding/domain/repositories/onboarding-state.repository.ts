import {
  OnboardingProgressStatus,
  OnboardingStepStatus,
  Role,
} from '@prisma/client';

export const ONBOARDING_STATE_REPOSITORY = Symbol(
  'ONBOARDING_STATE_REPOSITORY',
);

export type OnboardingStepSnapshot = {
  id: string;
  stepCode: string;
  title: string;
  description: string | null;
  stepOrder: number;
  isRequired: boolean;
  isSkippable: boolean;
  estimatedMinutes: number | null;
  status: OnboardingStepStatus;
  metadataJson: Record<string, unknown>;
  completedAt: Date | null;
  skippedAt: Date | null;
  blockedReason: string | null;
};

export type OnboardingProgressSnapshot = {
  id: string;
  userId: string;
  role: Role;
  flow: {
    id: string;
    code: string;
    name: string;
    description: string | null;
  };
  status: OnboardingProgressStatus;
  currentStep: string | null;
  completionPercentage: number;
  data: Record<string, Record<string, unknown>>;
  steps: OnboardingStepSnapshot[];
  missingSteps: string[];
  startedAt: Date | null;
  completedAt: Date | null;
  skippedAt: Date | null;
  rejectedAt: Date | null;
  rejectReason: string | null;
};

export interface OnboardingStateRepository {
  findByUserAndRole(
    userId: string,
    role: Role,
  ): Promise<OnboardingProgressSnapshot | null>;
  findById(id: string): Promise<OnboardingProgressSnapshot | null>;
  startForUserRole(
    userId: string,
    role: Role,
  ): Promise<OnboardingProgressSnapshot>;
  saveStep(
    userId: string,
    role: Role,
    stepCode: string,
    stepData: Record<string, unknown>,
  ): Promise<OnboardingProgressSnapshot>;
  submit(
    userId: string,
    role: Role,
  ): Promise<{ state: OnboardingProgressSnapshot; autoCompleted: boolean }>;
  approve(id: string): Promise<OnboardingProgressSnapshot>;
  reject(id: string, reason: string): Promise<OnboardingProgressSnapshot>;
  listPending(): Promise<OnboardingProgressSnapshot[]>;
}
