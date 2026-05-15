import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';

import { UserLoggedInEvent } from '../../../../modules/auth/domain/events/user-logged-in.event';
import {
  AUDIT_LOGGER_PORT,
  type AuditLoggerPort,
} from '../../../application/ports/audit-logger.port';

@Injectable()
@EventsHandler(UserLoggedInEvent)
export class UserLoggedInAuditHandler implements IEventHandler<UserLoggedInEvent> {
  constructor(
    @Inject(AUDIT_LOGGER_PORT) private readonly audit: AuditLoggerPort,
  ) {}

  async handle(event: UserLoggedInEvent): Promise<void> {
    await this.audit.log({
      actorUserId: event.userId,
      action: 'USER_LOGGED_IN',
      entityType: 'User',
      entityId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
    });
  }
}
