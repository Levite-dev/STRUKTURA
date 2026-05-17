import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { ApproveOnboardingCommand } from './approve-onboarding.command';
import {
  ONBOARDING_STATE_REPOSITORY,
  OnboardingProgressSnapshot,
  type OnboardingStateRepository,
} from '../../../domain/repositories/onboarding-state.repository';
import { AssignRoleCommand } from '../../../../users/application/commands/assign-role/assign-role.command';

@CommandHandler(ApproveOnboardingCommand)
export class ApproveOnboardingHandler implements ICommandHandler<
  ApproveOnboardingCommand,
  OnboardingProgressSnapshot
> {
  constructor(
    @Inject(ONBOARDING_STATE_REPOSITORY)
    private readonly states: OnboardingStateRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(
    command: ApproveOnboardingCommand,
  ): Promise<OnboardingProgressSnapshot> {
    const saved = await this.states.approve(command.onboardingStateId);

    await this.commandBus.execute(
      new AssignRoleCommand(saved.userId, saved.role, command.approvedByUserId),
    );
    return saved;
  }
}
