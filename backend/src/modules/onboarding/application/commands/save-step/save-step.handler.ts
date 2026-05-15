import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { SaveStepCommand } from './save-step.command';
import {
  ONBOARDING_STATE_REPOSITORY,
  type OnboardingStateRepository,
} from '../../../domain/repositories/onboarding-state.repository';
import { OnboardingState } from '../../../domain/entities/onboarding-state.entity';
import { OnboardingNotFoundException } from '../../../domain/exceptions/onboarding.exceptions';

@CommandHandler(SaveStepCommand)
export class SaveStepHandler implements ICommandHandler<
  SaveStepCommand,
  OnboardingState
> {
  constructor(
    @Inject(ONBOARDING_STATE_REPOSITORY)
    private readonly states: OnboardingStateRepository,
  ) {}

  async execute(command: SaveStepCommand): Promise<OnboardingState> {
    const state = await this.states.findByUserAndRole(
      command.userId,
      command.role,
    );
    if (!state) {
      throw new OnboardingNotFoundException();
    }
    state.saveStep(command.step, command.stepData);
    return this.states.save(state);
  }
}
