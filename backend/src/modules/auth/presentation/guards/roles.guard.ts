import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import type { Request } from 'express';

import { ROLES_KEY } from '../../../../shared/presentation/decorators';
import { AuthenticatedUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { ForbiddenException } from '../../../../shared/domain/exceptions';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[] | undefined>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required || required.length === 0) return true;

    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    const user = req.user;
    if (!user) {
      throw new ForbiddenException('No authenticated user.');
    }

    const has = required.some((r) => user.roles.includes(r));
    if (!has) {
      throw new ForbiddenException(
        `Requires one of roles: ${required.join(', ')}. You have: ${user.roles.join(', ') || 'none'}.`,
      );
    }
    return true;
  }
}
