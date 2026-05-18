import { Role } from '@prisma/client';

export class SaveStepCommand {
  constructor(
    public readonly userId: string,
    public readonly role: Role,
    public readonly stepCode: string,
    public readonly data: unknown,
  ) {}
}
