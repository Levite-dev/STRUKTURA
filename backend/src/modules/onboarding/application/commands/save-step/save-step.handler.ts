import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { SaveStepCommand } from './save-step.command';
import {
  ONBOARDING_STATE_REPOSITORY,
  OnboardingProgressSnapshot,
  type OnboardingStateRepository,
} from '../../../domain/repositories/onboarding-state.repository';

@CommandHandler(SaveStepCommand)
export class SaveStepHandler implements ICommandHandler<
  SaveStepCommand,
  OnboardingProgressSnapshot
> {
  constructor(
    @Inject(ONBOARDING_STATE_REPOSITORY)
    private readonly states: OnboardingStateRepository,
  ) {}

  async execute(command: SaveStepCommand): Promise<OnboardingProgressSnapshot> {
    return this.states.saveStep(
      command.userId,
      command.role,
      command.step,
      command.stepData,
    );
  }
}
