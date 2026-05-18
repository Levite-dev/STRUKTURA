import { Role } from '@prisma/client';

export class SetPrimaryRoleCommand {
  constructor(
    public readonly userId: string,
    public readonly role: Role,
  ) {}
}
