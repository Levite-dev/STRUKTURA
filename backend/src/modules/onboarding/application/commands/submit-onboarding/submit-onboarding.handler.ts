import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { SubmitOnboardingCommand } from './submit-onboarding.command';
import {
  ONBOARDING_STATE_REPOSITORY,
  OnboardingProgressSnapshot,
  type OnboardingStateRepository,
} from '../../../domain/repositories/onboarding-state.repository';
import {
  PROFILE_REPOSITORY,
  type ProfileRepository,
  type ProfileInput,
} from '../../../domain/repositories/profile.repository';
import { AssignRoleCommand } from '../../../../users/application/commands/assign-role/assign-role.command';
import { buildProfileInput } from '../../services/profile-input.builder';

@CommandHandler(SubmitOnboardingCommand)
export class SubmitOnboardingHandler implements ICommandHandler<
  SubmitOnboardingCommand,
  OnboardingProgressSnapshot
> {
  constructor(
    @Inject(ONBOARDING_STATE_REPOSITORY)
    private readonly states: OnboardingStateRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly profiles: ProfileRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(
    command: SubmitOnboardingCommand,
  ): Promise<OnboardingProgressSnapshot> {
    const { state, autoCompleted } = await this.states.submit(
      command.userId,
      command.role,
    );

    // Upsert the role-specific profile regardless of approval gate so admins reviewing
    // the submission see all collected data without re-running steps.
    const input: ProfileInput = buildProfileInput(command.role, state.data);
    await this.profiles.upsertProfile(command.userId, input);

    // For non-gated roles, assign role immediately.
    if (autoCompleted) {
      await this.commandBus.execute(
        new AssignRoleCommand(command.userId, command.role),
      );
    }

    return state;
  }
}
