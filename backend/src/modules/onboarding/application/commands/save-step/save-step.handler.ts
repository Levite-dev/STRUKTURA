import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { SaveStepCommand } from './save-step.command';
import { StepHandlerRegistry } from './step-handler.registry';

@CommandHandler(SaveStepCommand)
export class SaveStepHandler implements ICommandHandler<SaveStepCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly registry: StepHandlerRegistry,
  ) {}

  async execute({ userId, role, stepCode, data }: SaveStepCommand): Promise<void> {
    const flowCode = `${(role as string).toLowerCase()}_onboarding`;
    const flow = await this.prisma.onboardingFlow.findFirstOrThrow({
      where: { code: flowCode },
    });
    const step = await this.prisma.onboardingStep.findFirstOrThrow({
      where: { flowId: flow.id, stepCode },
    });
    const progress = await this.prisma.userOnboardingProgress.findFirstOrThrow({
      where: { userId, flowId: flow.id },
    });

    // Domain write (outside tx — handler uses its own PrismaService instance)
    if (step.fieldGroupCode) {
      const handler = this.registry.get(step.fieldGroupCode);
      if (handler) await handler.handle(userId, progress.id, step.id, data);
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.userOnboardingStepProgress.updateMany({
        where: { userOnboardingProgressId: progress.id, stepId: step.id },
        data: { status: 'COMPLETED', completedAt: new Date() },
      });

      const allSteps = await tx.userOnboardingStepProgress.findMany({
        where: { userOnboardingProgressId: progress.id },
      });
      const completed = allSteps.filter(
        (s) => s.status === 'COMPLETED' || s.status === 'SKIPPED',
      ).length;
      const pct = Math.round((completed / allSteps.length) * 100);

      const nextStep = await tx.onboardingStep.findFirst({
        where: {
          flowId: flow.id,
          stepOrder: { gt: step.stepOrder },
          stepProgress: {
            some: { userOnboardingProgressId: progress.id, status: 'PENDING' },
          },
        },
        orderBy: { stepOrder: 'asc' },
      });

      await tx.userOnboardingProgress.update({
        where: { id: progress.id },
        data: {
          completionPercentage: pct,
          currentStepId: nextStep?.id ?? null,
          status: pct === 100 ? 'COMPLETED' : 'IN_PROGRESS',
          lastActivityAt: new Date(),
        },
      });
    });
  }
}
