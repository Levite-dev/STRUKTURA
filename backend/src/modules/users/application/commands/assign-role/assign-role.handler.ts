import { CommandHandler, EventBus, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { AssignRoleCommand } from './assign-role.command';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../domain/repositories/user.repository';
import { RoleAssignedEvent } from '../../../domain/events/role-assigned.event';
import { NotFoundException } from '../../../../../shared/domain/exceptions';

@CommandHandler(AssignRoleCommand)
export class AssignRoleHandler implements ICommandHandler<
  AssignRoleCommand,
  void
> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
    private readonly eventBus: EventBus,
  ) {}

  async execute(command: AssignRoleCommand): Promise<void> {
    const user = await this.users.findById(command.userId);
    if (!user) {
      throw new NotFoundException(`User ${command.userId} not found`);
    }

    if (user.hasRole(command.role)) {
      return; // idempotent
    }

    await this.users.assignRole(
      command.userId,
      command.role,
      command.assignedBy ?? null,
    );
    this.eventBus.publish(
      new RoleAssignedEvent(
        command.userId,
        command.role,
        command.assignedBy ?? null,
      ),
    );
  }
}
