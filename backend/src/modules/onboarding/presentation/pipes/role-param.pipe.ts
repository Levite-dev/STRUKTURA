import { PipeTransform, Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { BadRequestException } from '../../../../shared/domain/exceptions';

const PUBLIC_ROLES = new Set<string>([
  Role.CLIENT,
  Role.CONTRACTOR,
  Role.SUPPLIER,
  Role.JOB_SEEKER,
]);

@Injectable()
export class PublicRoleParamPipe implements PipeTransform<string, Role> {
  transform(value: string): Role {
    const upper = (value ?? '').toUpperCase();
    if (!PUBLIC_ROLES.has(upper)) {
      throw new BadRequestException(`Invalid role parameter "${value}".`);
    }
    return upper as Role;
  }
}
