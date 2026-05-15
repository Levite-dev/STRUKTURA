import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { ConfirmPasswordResetCommand } from './confirm-password-reset.command';
import {
  AUTH_PROVIDER_PORT,
  type AuthProviderPort,
} from '../../ports/auth-provider.port';

@CommandHandler(ConfirmPasswordResetCommand)
export class ConfirmPasswordResetHandler implements ICommandHandler<
  ConfirmPasswordResetCommand,
  void
> {
  constructor(
    @Inject(AUTH_PROVIDER_PORT) private readonly authProvider: AuthProviderPort,
  ) {}

  execute(command: ConfirmPasswordResetCommand): Promise<void> {
    return this.authProvider.updatePassword(
      command.accessToken,
      command.newPassword,
    );
  }
}
