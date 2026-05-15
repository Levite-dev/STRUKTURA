import { CommandHandler, ICommandHandler, EventBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { SyncSupabaseUserCommand } from './sync-supabase-user.command';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../domain/repositories/user.repository';
import { UserCreatedEvent } from '../../../domain/events/user-created.event';
import { User } from '../../../domain/entities/user.entity';

@CommandHandler(SyncSupabaseUserCommand)
export class SyncSupabaseUserHandler implements ICommandHandler<
  SyncSupabaseUserCommand,
  User
> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SyncSupabaseUserCommand): Promise<User> {
    const existing = await this.users.findBySupabaseAuthId(
      command.supabaseAuthId,
    );
    if (existing) {
      // idempotent — return existing user, optionally update email-verified if newly verified
      if (command.emailVerifiedAt && !existing.isEmailVerified()) {
        await this.users.markEmailVerified(
          existing.id,
          command.emailVerifiedAt,
        );
        return (await this.users.findById(existing.id))!;
      }
      return existing;
    }

    const user = await this.users.create({
      supabaseAuthId: command.supabaseAuthId,
      email: command.email,
      fullName: command.fullName,
      emailVerifiedAt: command.emailVerifiedAt,
    });

    this.eventBus.publish(
      new UserCreatedEvent(user.id, user.supabaseAuthId, user.email),
    );
    return user;
  }
}
