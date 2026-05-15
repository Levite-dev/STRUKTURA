import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { RejectOnboardingCommand } from './reject-onboarding.command';
import {
  ONBOARDING_STATE_REPOSITORY,
  type OnboardingStateRepository,
} from '../../../domain/repositories/onboarding-state.repository';
import { OnboardingState } from '../../../domain/entities/onboarding-state.entity';
import { OnboardingNotFoundException } from '../../../domain/exceptions/onboarding.exceptions';

@CommandHandler(RejectOnboardingCommand)
export class RejectOnboardingHandler implements ICommandHandler<
  RejectOnboardingCommand,
  OnboardingState
> {
  constructor(
    @Inject(ONBOARDING_STATE_REPOSITORY)
    private readonly states: OnboardingStateRepository,
  ) {}

  async execute(command: RejectOnboardingCommand): Promise<OnboardingState> {
    const state = await this.states.findById(command.onboardingStateId);
    if (!state) {
      throw new OnboardingNotFoundException();
    }
    state.reject(command.reason);
    return this.states.save(state);
  }
}
