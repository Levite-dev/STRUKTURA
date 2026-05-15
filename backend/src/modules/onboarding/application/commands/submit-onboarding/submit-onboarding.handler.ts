import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { SubmitOnboardingCommand } from './submit-onboarding.command';
import {
  ONBOARDING_STATE_REPOSITORY,
  type OnboardingStateRepository,
} from '../../../domain/repositories/onboarding-state.repository';
import {
  PROFILE_REPOSITORY,
  type ProfileRepository,
  type ProfileInput,
} from '../../../domain/repositories/profile.repository';
import { OnboardingState } from '../../../domain/entities/onboarding-state.entity';
import { OnboardingNotFoundException } from '../../../domain/exceptions/onboarding.exceptions';
import { AssignRoleCommand } from '../../../../users/application/commands/assign-role/assign-role.command';
import { buildProfileInput } from '../../services/profile-input.builder';

@CommandHandler(SubmitOnboardingCommand)
export class SubmitOnboardingHandler implements ICommandHandler<
  SubmitOnboardingCommand,
  OnboardingState
> {
  constructor(
    @Inject(ONBOARDING_STATE_REPOSITORY)
    private readonly states: OnboardingStateRepository,
    @Inject(PROFILE_REPOSITORY)
    private readonly profiles: ProfileRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: SubmitOnboardingCommand): Promise<OnboardingState> {
    const state = await this.states.findByUserAndRole(
      command.userId,
      command.role,
    );
    if (!state) {
      throw new OnboardingNotFoundException();
    }

    const { autoCompleted } = state.submit();
    const saved = await this.states.save(state);

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

    return saved;
  }
}
