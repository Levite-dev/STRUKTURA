import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
} from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { SignupCommand } from './signup.command';
import {
  AUTH_PROVIDER_PORT,
  type AuthProviderPort,
} from '../../ports/auth-provider.port';
import { SyncSupabaseUserCommand } from '../../../../users/application/commands/sync-supabase-user/sync-supabase-user.command';
import { UserSignedUpEvent } from '../../../domain/events/user-signed-up.event';
import { User } from '../../../../users/domain/entities/user.entity';

export interface SignupResult {
  userId: string;
  email: string;
  emailVerified: boolean;
}

@CommandHandler(SignupCommand)
export class SignupHandler implements ICommandHandler<
  SignupCommand,
  SignupResult
> {
  constructor(
    @Inject(AUTH_PROVIDER_PORT) private readonly authProvider: AuthProviderPort,
    private readonly commandBus: CommandBus,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: SignupCommand): Promise<SignupResult> {
    // 1. Create Supabase auth user. Supabase sends the verification email.
    const supabaseUser = await this.authProvider.signupWithPassword(
      command.email,
      command.password,
    );

    // 2. Mirror to internal users table (idempotent via supabaseAuthId unique constraint).
    const user = await this.commandBus.execute<SyncSupabaseUserCommand, User>(
      new SyncSupabaseUserCommand(
        supabaseUser.supabaseAuthId,
        supabaseUser.email,
        command.fullName,
        supabaseUser.emailConfirmedAt,
      ),
    );

    // 3. Emit audit event.
    this.eventBus.publish(
      new UserSignedUpEvent(
        user.id,
        user.email,
        command.ipAddress,
        command.userAgent,
      ),
    );

    return {
      userId: user.id,
      email: user.email,
      emailVerified: user.isEmailVerified(),
    };
  }
}
