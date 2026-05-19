import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { StartOnboardingCommand } from './start-onboarding.command';

@CommandHandler(StartOnboardingCommand)
export class StartOnboardingHandler implements ICommandHandler<StartOnboardingCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ userId, roles }: StartOnboardingCommand): Promise<void> {
    for (const role of roles) {
      const flowCode = `${role.toLowerCase()}_onboarding`;
      const flow = await this.prisma.onboardingFlow.findFirst({
        where: { code: flowCode },
        include: { steps: true },
      });
      if (!flow) continue;

      const progress = await this.prisma.userOnboardingProgress.upsert({
        where: { userId_flowId: { userId, flowId: flow.id } },
        update: {},
        create: {
          userId,
          flowId: flow.id,
          status: 'NOT_STARTED',
          completionPercentage: 0,
          currentStepId:
            [...flow.steps].sort((a, b) => a.stepOrder - b.stepOrder)[0]?.id ??
            null,
        },
      });

      await this.prisma.userOnboardingStepProgress.createMany({
        data: flow.steps.map((step) => ({
          userOnboardingProgressId: progress.id,
          stepId: step.id,
          status: 'PENDING',
        })),
        skipDuplicates: true,
      });
    }
  }
}
