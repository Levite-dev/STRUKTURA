import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { VerificationGateService } from '../../../onboarding/domain/services/verification-gate.service';
import type { GatedAction } from '../../../onboarding/domain/services/verification-gate.service';
import { VerificationRequiredException } from '../../../onboarding/domain/services/verification-gate.service';

export const VERIFICATION_KEY = 'requiredVerification';

export function RequiresVerification(action: GatedAction): MethodDecorator {
  return (target, key, descriptor) => {
    Reflect.defineMetadata(VERIFICATION_KEY, action, descriptor.value);
    return descriptor;
  };
}

@Injectable()
export class VerificationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly gateService: VerificationGateService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const action = this.reflector.get<GatedAction>(
      VERIFICATION_KEY,
      ctx.getHandler(),
    );
    if (!action) return true;

    const req = ctx.switchToHttp().getRequest<{ user?: { id: string } }>();
    const userId = req.user?.id;
    if (!userId) throw new ForbiddenException('Not authenticated');

    try {
      await this.gateService.assertCanPerform(userId, action);
      return true;
    } catch (err) {
      if (err instanceof VerificationRequiredException) {
        throw new ForbiddenException({
          message: 'Verification documents required',
          missingDocTypes: err.missingDocTypes,
        });
      }
      throw err;
    }
  }
}
