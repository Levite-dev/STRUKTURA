import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { RefreshTokenCommand } from './refresh-token.command';
import {
  AUTH_PROVIDER_PORT,
  type AuthProviderPort,
  type AuthSession,
} from '../../ports/auth-provider.port';

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<
  RefreshTokenCommand,
  AuthSession
> {
  constructor(
    @Inject(AUTH_PROVIDER_PORT) private readonly authProvider: AuthProviderPort,
  ) {}

  execute(command: RefreshTokenCommand): Promise<AuthSession> {
    return this.authProvider.refreshSession(command.refreshToken);
  }
}
