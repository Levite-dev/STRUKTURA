import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { LogoutCommand } from './logout.command';
import {
  AUTH_PROVIDER_PORT,
  type AuthProviderPort,
} from '../../ports/auth-provider.port';
import { UserLoggedOutEvent } from '../../../domain/events/user-logged-out.event';

@CommandHandler(LogoutCommand)
export class LogoutHandler implements ICommandHandler<LogoutCommand, void> {
  constructor(
    @Inject(AUTH_PROVIDER_PORT) private readonly authProvider: AuthProviderPort,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    await this.authProvider.signOut(command.accessToken);
    this.eventBus.publish(new UserLoggedOutEvent(command.userId));
  }
}
