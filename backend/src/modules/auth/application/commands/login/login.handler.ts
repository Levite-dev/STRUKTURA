import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserStatus } from '@prisma/client';

import { LoginCommand } from './login.command';
import {
  AUTH_PROVIDER_PORT,
  type AuthProviderPort,
  type AuthSession,
} from '../../ports/auth-provider.port';
import {
  EmailNotVerifiedException,
  AccountSuspendedException,
} from '../../../domain/exceptions/auth.exceptions';
import { SyncSupabaseUserCommand } from '../../../../users/application/commands/sync-supabase-user/sync-supabase-user.command';
import { RecordLoginCommand } from '../../../../users/application/commands/record-login/record-login.command';
import { GetUserBySupabaseIdQuery } from '../../../../users/application/queries/get-user-by-supabase-id/get-user-by-supabase-id.query';
import { UserLoggedInEvent } from '../../../domain/events/user-logged-in.event';
import { User } from '../../../../users/domain/entities/user.entity';

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: User;
}

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<
  LoginCommand,
  LoginResult
> {
  constructor(
    @Inject(AUTH_PROVIDER_PORT) private readonly authProvider: AuthProviderPort,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    // 1. Supabase verifies credentials and issues tokens.
    const session: AuthSession = await this.authProvider.loginWithPassword(
      command.email,
      command.password,
    );

    // 2. Ensure internal user row exists.
    let user = await this.queryBus.execute<
      GetUserBySupabaseIdQuery,
      User | null
    >(new GetUserBySupabaseIdQuery(session.supabaseAuthId));
    if (!user) {
      user = await this.commandBus.execute<SyncSupabaseUserCommand, User>(
        new SyncSupabaseUserCommand(
          session.supabaseAuthId,
          session.email,
          null,
          null,
          null,
          session.emailConfirmedAt,
        ),
      );
    }

    // 3. Enforce business rules.
    if (
      user.status === UserStatus.SUSPENDED ||
      user.status === UserStatus.DELETED
    ) {
      throw new AccountSuspendedException();
    }
    if (!session.emailConfirmedAt && !user.isEmailVerified()) {
      throw new EmailNotVerifiedException();
    }

    // 4. Record login + emit audit event.
    await this.commandBus.execute(
      new RecordLoginCommand(user.id, command.ipAddress, new Date()),
    );
    this.eventBus.publish(
      new UserLoggedInEvent(
        user.id,
        user.email,
        command.ipAddress,
        command.userAgent,
      ),
    );

    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
      user,
    };
  }
}
