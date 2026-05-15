import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '../../../../shared/domain/exceptions';

export class OnboardingNotFoundException extends NotFoundException {
  constructor() {
    super('Onboarding state not found. Start onboarding first.');
  }
}

export class OnboardingAlreadyCompletedException extends ConflictException {
  constructor() {
    super('Onboarding for this role is already completed.');
  }
}

export class OnboardingNotReadyException extends BadRequestException {
  constructor(missing: string[]) {
    super(
      `Cannot complete onboarding — missing required steps: ${missing.join(', ')}`,
    );
  }
}

export class InvalidStepException extends BadRequestException {
  constructor(step: string) {
    super(`Invalid step "${step}" for this role.`);
  }
}

export class InvalidRoleForPublicOnboardingException extends BadRequestException {
  constructor(role: string) {
    super(`Role "${role}" cannot self-onboard.`);
  }
}
