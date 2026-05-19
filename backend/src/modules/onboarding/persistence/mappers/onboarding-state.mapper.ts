import { OnboardingProgressStatus, Prisma } from '@prisma/client';
import { OnboardingState } from '../../domain/entities/onboarding-state.entity';

type PrismaOnboardingState = Prisma.UserOnboardingProgressGetPayload<{
  include: { flow: true };
}>;

export class OnboardingStateMapper {
  static toDomain(record: PrismaOnboardingState): OnboardingState {
    return OnboardingState.create({
      id: record.id,
      userId: record.userId,
      role: record.flow.targetRole,
      status: record.status,
      currentStep: record.currentStepId,
      data: {},
      startedAt: record.startedAt,
      completedAt: record.completedAt,
      rejectedAt:
        record.status === OnboardingProgressStatus.REJECTED
          ? record.updatedAt
          : null,
      rejectReason: record.rejectionReason,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
