import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { RequestPasswordResetCommand } from './request-password-reset.command';
import {
  AUTH_PROVIDER_PORT,
  type AuthProviderPort,
} from '../../ports/auth-provider.port';

@CommandHandler(RequestPasswordResetCommand)
export class RequestPasswordResetHandler implements ICommandHandler<
  RequestPasswordResetCommand,
  void
> {
  constructor(
    @Inject(AUTH_PROVIDER_PORT) private readonly authProvider: AuthProviderPort,
  ) {}

  async execute(command: RequestPasswordResetCommand): Promise<void> {
    // Always returns success — must not leak whether email is registered.
    await this.authProvider.requestPasswordReset(
      command.email,
      command.redirectTo,
    );
  }
}
