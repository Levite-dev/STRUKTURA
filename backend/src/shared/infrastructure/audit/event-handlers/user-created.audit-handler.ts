import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';

import { UserCreatedEvent } from '../../../../modules/users/domain/events/user-created.event';
import {
  AUDIT_LOGGER_PORT,
  type AuditLoggerPort,
} from '../../../application/ports/audit-logger.port';

@Injectable()
@EventsHandler(UserCreatedEvent)
export class UserCreatedAuditHandler implements IEventHandler<UserCreatedEvent> {
  constructor(
    @Inject(AUDIT_LOGGER_PORT) private readonly audit: AuditLoggerPort,
  ) {}

  async handle(event: UserCreatedEvent): Promise<void> {
    await this.audit.log({
      actorUserId: event.userId,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: event.userId,
      newValues: { supabaseAuthId: event.supabaseAuthId, email: event.email },
    });
  }
}
