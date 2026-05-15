import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';

import { UserLoggedOutEvent } from '../../../../modules/auth/domain/events/user-logged-out.event';
import {
  AUDIT_LOGGER_PORT,
  type AuditLoggerPort,
} from '../../../application/ports/audit-logger.port';

@Injectable()
@EventsHandler(UserLoggedOutEvent)
export class UserLoggedOutAuditHandler implements IEventHandler<UserLoggedOutEvent> {
  constructor(
    @Inject(AUDIT_LOGGER_PORT) private readonly audit: AuditLoggerPort,
  ) {}

  async handle(event: UserLoggedOutEvent): Promise<void> {
    await this.audit.log({
      actorUserId: event.userId,
      action: 'USER_LOGGED_OUT',
      entityType: 'User',
      entityId: event.userId,
    });
  }
}
