import { CommandHandler, ICommandHandler, CommandBus } from '@nestjs/cqrs';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { AddRoleCommand } from './add-role.command';
import { StartOnboardingCommand } from '../../../onboarding/application/commands/start-onboarding/start-onboarding.command';

@CommandHandler(AddRoleCommand)
export class AddRoleHandler implements ICommandHandler<AddRoleCommand> {
  constructor(
    private readonly prisma: PrismaService,
    private readonly commandBus: CommandBus,
  ) {}

  async execute({ userId, role }: AddRoleCommand): Promise<void> {
    await this.prisma.userRole.upsert({
      where: { userId_role: { userId, role } },
      update: {},
      create: { userId, role },
    });

    await this.prisma.user.updateMany({
      where: { id: userId, primaryRole: null },
      data: { primaryRole: role },
    });

    await this.commandBus.execute(new StartOnboardingCommand(userId, [role]));
  }
}
