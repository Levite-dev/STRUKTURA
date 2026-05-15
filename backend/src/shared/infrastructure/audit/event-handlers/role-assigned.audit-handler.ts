import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { Inject, Injectable } from '@nestjs/common';

import { RoleAssignedEvent } from '../../../../modules/users/domain/events/role-assigned.event';
import {
  AUDIT_LOGGER_PORT,
  type AuditLoggerPort,
} from '../../../application/ports/audit-logger.port';

@Injectable()
@EventsHandler(RoleAssignedEvent)
export class RoleAssignedAuditHandler implements IEventHandler<RoleAssignedEvent> {
  constructor(
    @Inject(AUDIT_LOGGER_PORT) private readonly audit: AuditLoggerPort,
  ) {}

  async handle(event: RoleAssignedEvent): Promise<void> {
    await this.audit.log({
      actorUserId: event.assignedBy ?? event.userId,
      action: 'ROLE_ASSIGNED',
      entityType: 'UserRole',
      entityId: `${event.userId}:${event.role}`,
      newValues: {
        userId: event.userId,
        role: event.role,
        assignedBy: event.assignedBy,
      },
    });
  }
}
