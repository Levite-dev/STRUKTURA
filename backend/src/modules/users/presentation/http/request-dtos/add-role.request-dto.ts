import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class AddRoleRequestDto {
  @IsEnum(Role)
  role!: Role;
}
