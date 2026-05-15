import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { StartOnboardingCommand } from './start-onboarding.command';
import {
  ONBOARDING_STATE_REPOSITORY,
  type OnboardingStateRepository,
} from '../../../domain/repositories/onboarding-state.repository';
import { OnboardingState } from '../../../domain/entities/onboarding-state.entity';
import {
  InvalidRoleForPublicOnboardingException,
  OnboardingAlreadyCompletedException,
} from '../../../domain/exceptions/onboarding.exceptions';
import { isPublicRole } from '../../../../users/domain/value-objects/role.vo';

@CommandHandler(StartOnboardingCommand)
export class StartOnboardingHandler implements ICommandHandler<
  StartOnboardingCommand,
  OnboardingState
> {
  constructor(
    @Inject(ONBOARDING_STATE_REPOSITORY)
    private readonly states: OnboardingStateRepository,
  ) {}

  async execute(command: StartOnboardingCommand): Promise<OnboardingState> {
    if (!isPublicRole(command.role)) {
      throw new InvalidRoleForPublicOnboardingException(command.role);
    }

    const existing = await this.states.findByUserAndRole(
      command.userId,
      command.role,
    );
    if (existing) {
      if (existing.isCompleted()) {
        throw new OnboardingAlreadyCompletedException();
      }
      return existing;
    }

    return this.states.createForUserRole(command.userId, command.role);
  }
}
