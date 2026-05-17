import {
  OnboardingProgressStatus,
  OnboardingStepStatus,
  Role,
} from '@prisma/client';
import {
  OnboardingProgressSnapshot,
  OnboardingStepSnapshot,
} from '../../../domain/repositories/onboarding-state.repository';

export class OnboardingStepResponseDto {
  id!: string;
  stepCode!: string;
  title!: string;
  description!: string | null;
  stepOrder!: number;
  isRequired!: boolean;
  isSkippable!: boolean;
  estimatedMinutes!: number | null;
  status!: OnboardingStepStatus;
  metadataJson!: Record<string, unknown>;
  completedAt!: string | null;
  skippedAt!: string | null;
  blockedReason!: string | null;

  static fromSnapshot(step: OnboardingStepSnapshot): OnboardingStepResponseDto {
    const dto = new OnboardingStepResponseDto();
    dto.id = step.id;
    dto.stepCode = step.stepCode;
    dto.title = step.title;
    dto.description = step.description;
    dto.stepOrder = step.stepOrder;
    dto.isRequired = step.isRequired;
    dto.isSkippable = step.isSkippable;
    dto.estimatedMinutes = step.estimatedMinutes;
    dto.status = step.status;
    dto.metadataJson = step.metadataJson;
    dto.completedAt = step.completedAt?.toISOString() ?? null;
    dto.skippedAt = step.skippedAt?.toISOString() ?? null;
    dto.blockedReason = step.blockedReason;
    return dto;
  }
}

export class OnboardingStateResponseDto {
  id!: string;
  userId!: string;
  role!: Role;
  flow!: {
    id: string;
    code: string;
    name: string;
    description: string | null;
  };
  status!: OnboardingProgressStatus;
  currentStep!: string | null;
  completionPercentage!: number;
  data!: Record<string, unknown>;
  steps!: OnboardingStepResponseDto[];
  missingSteps!: string[];
  startedAt!: string | null;
  completedAt!: string | null;
  skippedAt!: string | null;
  rejectedAt!: string | null;
  rejectReason!: string | null;

  static fromDomain(
    state: OnboardingProgressSnapshot,
  ): OnboardingStateResponseDto {
    const dto = new OnboardingStateResponseDto();
    dto.id = state.id;
    dto.userId = state.userId;
    dto.role = state.role;
    dto.flow = state.flow;
    dto.status = state.status;
    dto.currentStep = state.currentStep;
    dto.completionPercentage = state.completionPercentage;
    dto.data = state.data;
    dto.steps = state.steps.map((step) =>
      OnboardingStepResponseDto.fromSnapshot(step),
    );
    dto.missingSteps = state.missingSteps;
    dto.startedAt = state.startedAt?.toISOString() ?? null;
    dto.completedAt = state.completedAt?.toISOString() ?? null;
    dto.skippedAt = state.skippedAt?.toISOString() ?? null;
    dto.rejectedAt = state.rejectedAt?.toISOString() ?? null;
    dto.rejectReason = state.rejectReason;
    return dto;
  }
}
