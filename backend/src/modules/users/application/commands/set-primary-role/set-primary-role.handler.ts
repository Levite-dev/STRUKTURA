import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { SetPrimaryRoleCommand } from './set-primary-role.command';

@CommandHandler(SetPrimaryRoleCommand)
export class SetPrimaryRoleHandler implements ICommandHandler<SetPrimaryRoleCommand> {
  constructor(private readonly prisma: PrismaService) {}

  async execute({ userId, role }: SetPrimaryRoleCommand): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { primaryRole: role },
    });
  }
}
