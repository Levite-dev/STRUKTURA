import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { GetOnboardingStateQuery } from './get-onboarding-state.query';

@QueryHandler(GetOnboardingStateQuery)
export class GetOnboardingStateHandler implements IQueryHandler<GetOnboardingStateQuery> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ userId }: GetOnboardingStateQuery) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        userRoles: true,
        onboardingProgress: {
          include: {
            flow: { include: { steps: true } },
            currentStep: true,
            stepProgress: { include: { step: true } },
          },
        },
      },
    });

    const roles = user.onboardingProgress.map((prog) => {
      const phases = [1, 2, 3, 4].map((phase) => {
        const phaseSteps = prog.stepProgress.filter(
          (sp) => sp.step.phase === phase,
        );
        return {
          phase,
          status:
            phaseSteps.length > 0 &&
            phaseSteps.every(
              (sp) => sp.status === 'COMPLETED' || sp.status === 'SKIPPED',
            )
              ? 'COMPLETED'
              : 'IN_PROGRESS',
          steps: phaseSteps.map((sp) => ({
            code: sp.step.stepCode,
            status: sp.status,
            isRequired: sp.step.isRequired,
            isSkippable: sp.step.isSkippable,
            triggerType: sp.step.triggerType,
          })),
        };
      });

      const currentPhase = prog.currentStep?.phase ?? 1;

      return {
        role: prog.flow.code.replace('_onboarding', '').toUpperCase(),
        flowCode: prog.flow.code,
        status: prog.status,
        completionPercentage: prog.completionPercentage,
        currentPhase,
        currentStep: prog.currentStep
          ? {
              code: prog.currentStep.stepCode,
              title: prog.currentStep.title,
              phase: prog.currentStep.phase,
              triggerType: prog.currentStep.triggerType,
              fieldGroupCode: prog.currentStep.fieldGroupCode,
            }
          : null,
        blockers: [],
        phases,
      };
    });

    return { userId, primaryRole: user.primaryRole, roles };
  }
}
