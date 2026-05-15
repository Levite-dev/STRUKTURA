import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { QueryBus } from '@nestjs/cqrs';
import type { Request } from 'express';

import { IS_PUBLIC_KEY } from '../../../../shared/presentation/decorators';
import { AuthenticatedUser } from '../../../../shared/presentation/decorators/current-user.decorator';
import {
  AUTH_PROVIDER_PORT,
  type AuthProviderPort,
} from '../../application/ports/auth-provider.port';
import { InvalidTokenException } from '../../domain/exceptions/auth.exceptions';
import { UnauthorizedException } from '../../../../shared/domain/exceptions';
import { GetUserBySupabaseIdQuery } from '../../../users/application/queries/get-user-by-supabase-id/get-user-by-supabase-id.query';
import { User } from '../../../users/domain/entities/user.entity';

@Injectable()
export class SupabaseJwtGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseJwtGuard.name);

  constructor(
    private readonly reflector: Reflector,
    @Inject(AUTH_PROVIDER_PORT) private readonly authProvider: AuthProviderPort,
    private readonly queryBus: QueryBus,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context
      .switchToHttp()
      .getRequest<Request & { user?: AuthenticatedUser }>();
    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException(
        'Missing or malformed Authorization header.',
      );
    }

    const claims = await this.authProvider.verifyAccessToken(token);

    const user = await this.queryBus.execute<
      GetUserBySupabaseIdQuery,
      User | null
    >(new GetUserBySupabaseIdQuery(claims.sub));
    if (!user) {
      throw new InvalidTokenException(
        'Authenticated user is not provisioned in the database.',
      );
    }

    req.user = {
      id: user.id,
      supabaseAuthId: user.supabaseAuthId,
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt,
      roles: user.roles,
    };
    return true;
  }

  private extractToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (!header || typeof header !== 'string') return null;
    const [scheme, token] = header.split(' ');
    if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
    return token.trim();
  }
}
