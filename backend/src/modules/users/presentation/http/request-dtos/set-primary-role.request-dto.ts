import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class SetPrimaryRoleRequestDto {
  @IsEnum(Role)
  role!: Role;
}
