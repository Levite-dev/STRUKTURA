import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { RecordLoginCommand } from './record-login.command';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../domain/repositories/user.repository';

@CommandHandler(RecordLoginCommand)
export class RecordLoginHandler implements ICommandHandler<
  RecordLoginCommand,
  void
> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  async execute(command: RecordLoginCommand): Promise<void> {
    await this.users.recordLogin(command.userId, command.ip, command.at);
  }
}
