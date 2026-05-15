import {
  CommandBus,
  CommandHandler,
  EventBus,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { UserStatus } from '@prisma/client';

import { OAuthSyncCommand } from './oauth-sync.command';
import {
  AUTH_PROVIDER_PORT,
  type AuthProviderPort,
} from '../../ports/auth-provider.port';
import { SyncSupabaseUserCommand } from '../../../../users/application/commands/sync-supabase-user/sync-supabase-user.command';
import { RecordLoginCommand } from '../../../../users/application/commands/record-login/record-login.command';
import { GetUserBySupabaseIdQuery } from '../../../../users/application/queries/get-user-by-supabase-id/get-user-by-supabase-id.query';
import { UserLoggedInEvent } from '../../../domain/events/user-logged-in.event';
import { AccountSuspendedException } from '../../../domain/exceptions/auth.exceptions';
import { User } from '../../../../users/domain/entities/user.entity';

export interface OAuthSyncResult {
  user: User;
}

@CommandHandler(OAuthSyncCommand)
export class OAuthSyncHandler implements ICommandHandler<
  OAuthSyncCommand,
  OAuthSyncResult
> {
  constructor(
    @Inject(AUTH_PROVIDER_PORT) private readonly authProvider: AuthProviderPort,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: OAuthSyncCommand): Promise<OAuthSyncResult> {
    // 1. Verify the OAuth-issued Supabase JWT.
    const claims = await this.authProvider.verifyAccessToken(
      command.accessToken,
    );

    // 2. Ensure internal user row exists.
    let user = await this.queryBus.execute<
      GetUserBySupabaseIdQuery,
      User | null
    >(new GetUserBySupabaseIdQuery(claims.sub));
    if (!user) {
      user = await this.commandBus.execute<SyncSupabaseUserCommand, User>(
        new SyncSupabaseUserCommand(
          claims.sub,
          claims.email,
          (claims.userMetadata?.['full_name'] as string) ?? null,
          claims.emailVerified ? new Date() : null,
        ),
      );
    }

    if (
      user.status === UserStatus.SUSPENDED ||
      user.status === UserStatus.DELETED
    ) {
      throw new AccountSuspendedException();
    }

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

    return { user };
  }
}
