import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { ApproveOnboardingCommand } from './approve-onboarding.command';
import {
  ONBOARDING_STATE_REPOSITORY,
  type OnboardingStateRepository,
} from '../../../domain/repositories/onboarding-state.repository';
import { OnboardingState } from '../../../domain/entities/onboarding-state.entity';
import { OnboardingNotFoundException } from '../../../domain/exceptions/onboarding.exceptions';
import { AssignRoleCommand } from '../../../../users/application/commands/assign-role/assign-role.command';

@CommandHandler(ApproveOnboardingCommand)
export class ApproveOnboardingHandler implements ICommandHandler<
  ApproveOnboardingCommand,
  OnboardingState
> {
  constructor(
    @Inject(ONBOARDING_STATE_REPOSITORY)
    private readonly states: OnboardingStateRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: ApproveOnboardingCommand): Promise<OnboardingState> {
    const state = await this.states.findById(command.onboardingStateId);
    if (!state) {
      throw new OnboardingNotFoundException();
    }
    state.approve();
    const saved = await this.states.save(state);

    await this.commandBus.execute(
      new AssignRoleCommand(state.userId, state.role, command.approvedByUserId),
    );
    return saved;
  }
}
