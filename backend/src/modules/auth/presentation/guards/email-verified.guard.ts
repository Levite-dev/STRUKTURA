import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';

import { AuthenticatedUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import { EmailNotVerifiedException } from '../../domain/exceptions/auth.exceptions';

@Injectable()
export class EmailVerifiedGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    const user = req.user;
    if (!user || !user.emailVerifiedAt) {
      throw new EmailNotVerifiedException();
    }
    return true;
  }
}
