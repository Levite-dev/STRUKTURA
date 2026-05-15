import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { MarkEmailVerifiedCommand } from './mark-email-verified.command';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../domain/repositories/user.repository';
import { NotFoundException } from '../../../../../shared/domain/exceptions';

@CommandHandler(MarkEmailVerifiedCommand)
export class MarkEmailVerifiedHandler implements ICommandHandler<
  MarkEmailVerifiedCommand,
  void
> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  async execute(command: MarkEmailVerifiedCommand): Promise<void> {
    const user = await this.users.findBySupabaseAuthId(command.supabaseAuthId);
    if (!user) {
      throw new NotFoundException(
        `User with Supabase ID ${command.supabaseAuthId} not found — sync first`,
      );
    }
    if (user.isEmailVerified()) {
      return; // idempotent
    }
    await this.users.markEmailVerified(user.id, command.verifiedAt);
  }
}
