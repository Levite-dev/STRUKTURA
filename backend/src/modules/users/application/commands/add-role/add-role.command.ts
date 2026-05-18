import { Role } from '@prisma/client';

export class AddRoleCommand {
  constructor(
    public readonly userId: string,
    public readonly role: Role,
  ) {}
}
