import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';

import { UserSignedUpEvent } from '../../../../modules/auth/domain/events/user-signed-up.event';
import {
  AUDIT_LOGGER_PORT,
  type AuditLoggerPort,
} from '../../../application/ports/audit-logger.port';

@Injectable()
@EventsHandler(UserSignedUpEvent)
export class UserSignedUpAuditHandler implements IEventHandler<UserSignedUpEvent> {
  constructor(
    @Inject(AUDIT_LOGGER_PORT) private readonly audit: AuditLoggerPort,
  ) {}

  async handle(event: UserSignedUpEvent): Promise<void> {
    await this.audit.log({
      actorUserId: event.userId,
      action: 'USER_SIGNED_UP',
      entityType: 'User',
      entityId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      metadata: { email: event.email },
    });
  }
}
