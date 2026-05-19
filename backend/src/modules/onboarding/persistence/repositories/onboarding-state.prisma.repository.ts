import { Injectable } from '@nestjs/common';
import {
  OnboardingProgressStatus,
  OnboardingStepStatus,
  Prisma,
  Role,
} from '@prisma/client';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import {
  OnboardingProgressSnapshot,
  OnboardingStateRepository,
  OnboardingStepSnapshot,
} from '../../domain/repositories/onboarding-state.repository';
import {
  InvalidStepException,
  OnboardingAlreadyCompletedException,
  OnboardingNotFoundException,
  OnboardingNotReadyException,
} from '../../domain/exceptions/onboarding.exceptions';

type FlowSeed = {
  code: string;
  name: string;
  description: string;
  targetRole: Role;
  steps: Array<{
    stepCode: string;
    title: string;
    description: string;
    estimatedMinutes?: number;
    isRequired?: boolean;
    isSkippable?: boolean;
  }>;
};

const FLOW_SEEDS: FlowSeed[] = [
  {
    code: 'client_onboarding',
    name: 'Client onboarding',
    description: 'Basic client profile, address, and preferences.',
    targetRole: Role.CLIENT,
    steps: [
      [
        'account_setup',
        'Account Setup',
        'Confirm account type and contact details.',
      ],
      ['profile_setup', 'Profile Setup', 'Add your name and contact profile.'],
      [
        'address_setup',
        'Address Setup',
        'Add your primary project or delivery address.',
      ],
      [
        'preferences_setup',
        'Preferences',
        'Choose services and product categories.',
      ],
    ].map(([stepCode, title, description], index) => ({
      stepCode,
      title,
      description,
      estimatedMinutes: index === 0 ? 1 : 3,
    })),
  },
  {
    code: 'contractor_onboarding',
    name: 'Contractor onboarding',
    description: 'Contractor profile, services, portfolio, and verification.',
    targetRole: Role.CONTRACTOR,
    steps: [
      [
        'account_setup',
        'Account Setup',
        'Confirm account type and contact details.',
      ],
      [
        'contractor_profile',
        'Contractor Profile',
        'Add business and experience details.',
      ],
      [
        'service_setup',
        'Service Setup',
        'Describe services and service coverage.',
      ],
      ['portfolio_upload', 'Portfolio Upload', 'Share previous work samples.'],
      [
        'document_upload',
        'Document Upload',
        'Provide verification document links.',
      ],
      [
        'verification_submission',
        'Verification Submission',
        'Review and submit for verification.',
      ],
    ].map(([stepCode, title, description]) => ({
      stepCode,
      title,
      description,
      estimatedMinutes: 4,
    })),
  },
  {
    code: 'supplier_onboarding',
    name: 'Supplier onboarding',
    description: 'Store profile, first product, inventory, and verification.',
    targetRole: Role.SUPPLIER,
    steps: [
      [
        'account_setup',
        'Account Setup',
        'Confirm account type and contact details.',
      ],
      [
        'supplier_profile',
        'Supplier Profile',
        'Add store and contact details.',
      ],
      [
        'business_information',
        'Business Information',
        'Add registration and business details.',
      ],
      ['product_setup', 'Product Setup', 'Add your first product listing.'],
      ['inventory_setup', 'Inventory Setup', 'Add initial stock information.'],
      [
        'document_upload',
        'Document Upload',
        'Provide verification document links.',
      ],
      [
        'verification_submission',
        'Verification Submission',
        'Review and submit for verification.',
      ],
    ].map(([stepCode, title, description]) => ({
      stepCode,
      title,
      description,
      estimatedMinutes: 4,
    })),
  },
  {
    code: 'job_seeker_onboarding',
    name: 'Job seeker onboarding',
    description: 'Worker profile, skills, preferences, and availability.',
    targetRole: Role.JOB_SEEKER,
    steps: [
      {
        stepCode: 'account_setup',
        title: 'Account Setup',
        description: 'Confirm account type and contact details.',
        estimatedMinutes: 3,
      },
      {
        stepCode: 'personal_profile',
        title: 'Personal Profile',
        description: 'Add personal and location details.',
        estimatedMinutes: 3,
      },
      {
        stepCode: 'skills_setup',
        title: 'Skills Setup',
        description: 'Add your primary and additional skills.',
        estimatedMinutes: 3,
      },
      {
        stepCode: 'work_preferences',
        title: 'Work Preferences',
        description: 'Add rate and location preferences.',
        estimatedMinutes: 3,
      },
      {
        stepCode: 'portfolio_upload',
        title: 'Portfolio Upload',
        description: 'Share previous work samples.',
        estimatedMinutes: 3,
      },
      {
        stepCode: 'document_upload',
        title: 'Document Upload',
        description:
          'Optionally provide certificates, clearance links, or supporting documents.',
        estimatedMinutes: 3,
        isRequired: false,
        isSkippable: true,
      },
      {
        stepCode: 'availability_setup',
        title: 'Availability Setup',
        description: 'Set your availability status.',
        estimatedMinutes: 3,
      },
    ],
  },
  {
    code: 'admin_onboarding',
    name: 'Staff onboarding',
    description: 'Internal staff profile, permissions, and security setup.',
    targetRole: Role.ADMIN,
    steps: [
      ['staff_profile', 'Staff Profile', 'Add staff identity details.'],
      ['role_assignment', 'Role Assignment', 'Assign system role.'],
      ['permission_assignment', 'Permission Assignment', 'Assign permissions.'],
      ['security_setup', 'Security Setup', 'Confirm security settings.'],
    ].map(([stepCode, title, description]) => ({
      stepCode,
      title,
      description,
      estimatedMinutes: 3,
    })),
  },
];

const progressInclude = {
  flow: { include: { steps: { orderBy: { stepOrder: 'asc' as const } } } },
  stepProgress: { include: { step: true } },
} satisfies Prisma.UserOnboardingProgressInclude;

type ProgressRecord = Prisma.UserOnboardingProgressGetPayload<{
  include: typeof progressInclude;
}>;

@Injectable()
export class OnboardingStatePrismaRepository implements OnboardingStateRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUserAndRole(
    userId: string,
    role: Role,
  ): Promise<OnboardingProgressSnapshot | null> {
    const flow = await this.ensureFlow(role);
    const record = await this.prisma.userOnboardingProgress.findUnique({
      where: { userId_flowId: { userId, flowId: flow.id } },
      include: progressInclude,
    });
    return record ? this.toSnapshot(record) : null;
  }

  async findById(id: string): Promise<OnboardingProgressSnapshot | null> {
    const record = await this.prisma.userOnboardingProgress.findUnique({
      where: { id },
      include: progressInclude,
    });
    return record ? this.toSnapshot(record) : null;
  }

  async startForUserRole(
    userId: string,
    role: Role,
  ): Promise<OnboardingProgressSnapshot> {
    const flow = await this.ensureFlow(role);
    const firstStep = flow.steps[0] ?? null;

    const existing = await this.prisma.userOnboardingProgress.findUnique({
      where: { userId_flowId: { userId, flowId: flow.id } },
      include: progressInclude,
    });
    if (existing) {
      if (existing.status === OnboardingProgressStatus.COMPLETED) {
        throw new OnboardingAlreadyCompletedException();
      }
      return this.toSnapshot(existing);
    }

    const record = await this.prisma.userOnboardingProgress.create({
      data: {
        userId,
        flowId: flow.id,
        currentStepId: firstStep?.id ?? null,
        status: OnboardingProgressStatus.IN_PROGRESS,
        startedAt: new Date(),
        lastActivityAt: new Date(),
        stepProgress: {
          create: flow.steps.map((step, index) => ({
            stepId: step.id,
            status:
              index === 0
                ? OnboardingStepStatus.IN_PROGRESS
                : OnboardingStepStatus.PENDING,
            metadataJson: {},
          })),
        },
      },
      include: progressInclude,
    });

    await this.syncUserOnboardingFields(userId, role, record);
    return this.toSnapshot(record);
  }

  async saveStep(
    userId: string,
    role: Role,
    stepCode: string,
    stepData: Record<string, unknown>,
  ): Promise<OnboardingProgressSnapshot> {
    const state = await this.findOrThrowByUserAndRole(userId, role);
    if (state.status === OnboardingProgressStatus.COMPLETED) {
      throw new OnboardingAlreadyCompletedException();
    }

    const step = state.steps.find((s) => s.stepCode === stepCode);
    if (!step) throw new InvalidStepException(stepCode);

    const completedAt = new Date();
    const nextStep = state.steps.find(
      (s) => s.stepOrder > step.stepOrder && s.status !== 'COMPLETED',
    );
    const completedRequired = new Set([
      ...state.steps
        .filter((s) => s.isRequired && s.status === 'COMPLETED')
        .map((s) => s.stepCode),
      stepCode,
    ]);
    const requiredCount = state.steps.filter((s) => s.isRequired).length;
    const completionPercentage =
      requiredCount === 0
        ? 100
        : Math.round((completedRequired.size / requiredCount) * 100);

    const record = await this.prisma.$transaction(async (tx) => {
      await tx.userOnboardingStepProgress.update({
        where: {
          userOnboardingProgressId_stepId: {
            userOnboardingProgressId: state.id,
            stepId: step.id,
          },
        },
        data: {
          status: OnboardingStepStatus.COMPLETED,
          completedAt,
          metadataJson: stepData as Prisma.InputJsonValue,
        },
      });

      if (nextStep) {
        await tx.userOnboardingStepProgress.update({
          where: {
            userOnboardingProgressId_stepId: {
              userOnboardingProgressId: state.id,
              stepId: nextStep.id,
            },
          },
          data: { status: OnboardingStepStatus.IN_PROGRESS },
        });
      }

      return tx.userOnboardingProgress.update({
        where: { id: state.id },
        data: {
          currentStepId: nextStep?.id ?? step.id,
          status: OnboardingProgressStatus.IN_PROGRESS,
          completionPercentage,
          lastActivityAt: completedAt,
        },
        include: progressInclude,
      });
    });

    await this.syncUserOnboardingFields(userId, role, record);
    return this.toSnapshot(record);
  }

  async submit(
    userId: string,
    role: Role,
  ): Promise<{ state: OnboardingProgressSnapshot; autoCompleted: boolean }> {
    const state = await this.findOrThrowByUserAndRole(userId, role);
    const missing = state.missingSteps;
    if (missing.length > 0) throw new OnboardingNotReadyException(missing);

    const autoCompleted = !this.requiresVerification(role);
    const status = autoCompleted
      ? OnboardingProgressStatus.COMPLETED
      : OnboardingProgressStatus.PENDING_VERIFICATION;
    const now = new Date();
    const record = await this.prisma.userOnboardingProgress.update({
      where: { id: state.id },
      data: {
        status,
        completionPercentage: 100,
        completedAt: autoCompleted ? now : null,
        lastActivityAt: now,
      },
      include: progressInclude,
    });

    await this.syncUserOnboardingFields(userId, role, record);
    return { state: this.toSnapshot(record), autoCompleted };
  }

  async approve(id: string): Promise<OnboardingProgressSnapshot> {
    const existing = await this.findById(id);
    if (!existing) throw new OnboardingNotFoundException();
    if (existing.status !== OnboardingProgressStatus.PENDING_VERIFICATION) {
      throw new OnboardingNotReadyException([
        'submission required before approval',
      ]);
    }

    const record = await this.prisma.userOnboardingProgress.update({
      where: { id },
      data: {
        status: OnboardingProgressStatus.COMPLETED,
        completionPercentage: 100,
        completedAt: new Date(),
        lastActivityAt: new Date(),
      },
      include: progressInclude,
    });
    await this.syncUserOnboardingFields(
      record.userId,
      record.flow.targetRole,
      record,
    );
    return this.toSnapshot(record);
  }

  async reject(
    id: string,
    reason: string,
  ): Promise<OnboardingProgressSnapshot> {
    const existing = await this.findById(id);
    if (!existing) throw new OnboardingNotFoundException();
    if (existing.status !== OnboardingProgressStatus.PENDING_VERIFICATION) {
      throw new OnboardingNotReadyException([
        'submission required before rejection',
      ]);
    }

    const record = await this.prisma.userOnboardingProgress.update({
      where: { id },
      data: {
        status: OnboardingProgressStatus.REJECTED,
        rejectionReason: reason,
        lastActivityAt: new Date(),
      },
      include: progressInclude,
    });
    await this.syncUserOnboardingFields(
      record.userId,
      record.flow.targetRole,
      record,
    );
    return this.toSnapshot(record);
  }

  async listPending(): Promise<OnboardingProgressSnapshot[]> {
    await this.ensureDefaultFlows();
    const records = await this.prisma.userOnboardingProgress.findMany({
      where: { status: OnboardingProgressStatus.PENDING_VERIFICATION },
      orderBy: { updatedAt: 'asc' },
      include: progressInclude,
    });
    return records.map((record) => this.toSnapshot(record));
  }

  private async findOrThrowByUserAndRole(
    userId: string,
    role: Role,
  ): Promise<OnboardingProgressSnapshot> {
    const state = await this.findByUserAndRole(userId, role);
    if (!state) throw new OnboardingNotFoundException();
    return state;
  }

  private async ensureFlow(role: Role) {
    await this.ensureDefaultFlows();
    const flow = await this.prisma.onboardingFlow.findFirst({
      where: { targetRole: role, isActive: true },
      include: { steps: { orderBy: { stepOrder: 'asc' } } },
    });
    if (!flow) throw new OnboardingNotFoundException();
    return flow;
  }

  private async ensureDefaultFlows(): Promise<void> {
    for (const seed of FLOW_SEEDS) {
      const flow = await this.prisma.onboardingFlow.upsert({
        where: { code: seed.code },
        create: {
          code: seed.code,
          name: seed.name,
          description: seed.description,
          targetRole: seed.targetRole,
          isActive: true,
        },
        update: {
          name: seed.name,
          description: seed.description,
          targetRole: seed.targetRole,
          isActive: true,
        },
      });

      for (const [index, step] of seed.steps.entries()) {
        await this.prisma.onboardingStep.upsert({
          where: {
            flowId_stepCode: { flowId: flow.id, stepCode: step.stepCode },
          },
          create: {
            flowId: flow.id,
            stepCode: step.stepCode,
            title: step.title,
            description: step.description,
            stepOrder: index + 1,
            isRequired: step.isRequired ?? true,
            isSkippable: step.isSkippable ?? false,
            estimatedMinutes: step.estimatedMinutes ?? null,
          },
          update: {
            title: step.title,
            description: step.description,
            stepOrder: index + 1,
            isRequired: step.isRequired ?? true,
            isSkippable: step.isSkippable ?? false,
            estimatedMinutes: step.estimatedMinutes ?? null,
          },
        });
      }
    }
  }

  private toSnapshot(record: ProgressRecord): OnboardingProgressSnapshot {
    const progressByStep = new Map(
      record.stepProgress.map((progress) => [progress.stepId, progress]),
    );
    const steps: OnboardingStepSnapshot[] = record.flow.steps.map((step) => {
      const progress = progressByStep.get(step.id);
      return {
        id: step.id,
        stepCode: step.stepCode,
        title: step.title,
        description: step.description,
        stepOrder: step.stepOrder,
        isRequired: step.isRequired,
        isSkippable: step.isSkippable,
        estimatedMinutes: step.estimatedMinutes,
        status: progress?.status ?? OnboardingStepStatus.PENDING,
        metadataJson: this.asObject(progress?.metadataJson),
        completedAt: progress?.completedAt ?? null,
        skippedAt: progress?.skippedAt ?? null,
        blockedReason: progress?.blockedReason ?? null,
      };
    });
    const data = Object.fromEntries(
      steps.map((step) => [step.stepCode, step.metadataJson]),
    );
    const missingSteps = steps
      .filter((step) => step.isRequired && step.status !== 'COMPLETED')
      .map((step) => step.stepCode);
    const current =
      steps.find((step) => step.id === record.currentStepId)?.stepCode ??
      steps.find((step) => step.status !== 'COMPLETED')?.stepCode ??
      null;

    return {
      id: record.id,
      userId: record.userId,
      role: record.flow.targetRole,
      flow: {
        id: record.flow.id,
        code: record.flow.code,
        name: record.flow.name,
        description: record.flow.description,
      },
      status: record.status,
      currentStep: current,
      completionPercentage: record.completionPercentage,
      data,
      steps,
      missingSteps,
      startedAt: record.startedAt,
      completedAt: record.completedAt,
      skippedAt: record.skippedAt,
      rejectedAt:
        record.status === OnboardingProgressStatus.REJECTED
          ? record.updatedAt
          : null,
      rejectReason: record.rejectionReason,
    };
  }

  private asObject(
    value: Prisma.JsonValue | undefined,
  ): Record<string, unknown> {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value;
    }
    return {};
  }

  private requiresVerification(role: Role): boolean {
    return role === Role.CONTRACTOR || role === Role.SUPPLIER;
  }

  private async syncUserOnboardingFields(
    userId: string,
    role: Role,
    record: ProgressRecord,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        primaryRole: role,
        onboardingStatus: record.status,
        onboardingCompletedAt: record.completedAt,
        accountSetupStage:
          record.flow.steps.find((step) => step.id === record.currentStepId)
            ?.stepCode ?? null,
      },
    });
  }
}
