import { Role } from '@prisma/client';

export class StartOnboardingCommand {
  constructor(
    public readonly userId: string,
    public readonly roles: Role[],
  ) {}
}
