import { Injectable } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { OnboardingState } from '../../domain/entities/onboarding-state.entity';
import { OnboardingStateRepository } from '../../domain/repositories/onboarding-state.repository';
import { OnboardingStateMapper } from '../mappers/onboarding-state.mapper';

@Injectable()
export class OnboardingStatePrismaRepository implements OnboardingStateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndRole(
    userId: string,
    role: Role,
  ): Promise<OnboardingState | null> {
    const record = await this.prisma.onboardingState.findUnique({
      where: { userId_role: { userId, role } },
    });
    return record ? OnboardingStateMapper.toDomain(record) : null;
  }

  async findById(id: string): Promise<OnboardingState | null> {
    const record = await this.prisma.onboardingState.findUnique({
      where: { id },
    });
    return record ? OnboardingStateMapper.toDomain(record) : null;
  }

  async createForUserRole(
    userId: string,
    role: Role,
  ): Promise<OnboardingState> {
    const record = await this.prisma.onboardingState.create({
      data: {
        userId,
        role,
        status: 'IN_PROGRESS',
        startedAt: new Date(),
        data: {},
      },
    });
    return OnboardingStateMapper.toDomain(record);
  }

  async save(state: OnboardingState): Promise<OnboardingState> {
    const props = state.toPersistence();
    const record = await this.prisma.onboardingState.update({
      where: { id: props.id },
      data: {
        status: props.status,
        currentStep: props.currentStep,
        data: props.data as Prisma.InputJsonValue,
        startedAt: props.startedAt,
        completedAt: props.completedAt,
        rejectedAt: props.rejectedAt,
        rejectReason: props.rejectReason,
      },
    });
    return OnboardingStateMapper.toDomain(record);
  }

  async listPending(): Promise<OnboardingState[]> {
    const records = await this.prisma.onboardingState.findMany({
      where: { status: 'PENDING_VERIFICATION' },
      orderBy: { updatedAt: 'asc' },
    });
    return records.map((r) => OnboardingStateMapper.toDomain(r));
  }
}
