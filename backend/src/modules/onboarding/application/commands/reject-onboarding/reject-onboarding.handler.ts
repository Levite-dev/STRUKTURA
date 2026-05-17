import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { RejectOnboardingCommand } from './reject-onboarding.command';
import {
  ONBOARDING_STATE_REPOSITORY,
  OnboardingProgressSnapshot,
  type OnboardingStateRepository,
} from '../../../domain/repositories/onboarding-state.repository';

@CommandHandler(RejectOnboardingCommand)
export class RejectOnboardingHandler implements ICommandHandler<
  RejectOnboardingCommand,
  OnboardingProgressSnapshot
> {
  constructor(
    @Inject(ONBOARDING_STATE_REPOSITORY)
    private readonly states: OnboardingStateRepository,
  ) {}

  async execute(
    command: RejectOnboardingCommand,
  ): Promise<OnboardingProgressSnapshot> {
    return this.states.reject(command.onboardingStateId, command.reason);
  }
}
