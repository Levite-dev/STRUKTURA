import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { StartOnboardingCommand } from './start-onboarding.command';
import {
  ONBOARDING_STATE_REPOSITORY,
  OnboardingProgressSnapshot,
  type OnboardingStateRepository,
} from '../../../domain/repositories/onboarding-state.repository';
import {
  InvalidRoleForPublicOnboardingException,
} from '../../../domain/exceptions/onboarding.exceptions';
import { isPublicRole } from '../../../../users/domain/value-objects/role.vo';

@CommandHandler(StartOnboardingCommand)
export class StartOnboardingHandler implements ICommandHandler<
  StartOnboardingCommand,
  OnboardingProgressSnapshot
> {
  constructor(
    @Inject(ONBOARDING_STATE_REPOSITORY)
    private readonly states: OnboardingStateRepository,
  ) {}

  async execute(
    command: StartOnboardingCommand,
  ): Promise<OnboardingProgressSnapshot> {
    if (!isPublicRole(command.role)) {
      throw new InvalidRoleForPublicOnboardingException(command.role);
    }

    return this.states.startForUserRole(command.userId, command.role);
  }
}
