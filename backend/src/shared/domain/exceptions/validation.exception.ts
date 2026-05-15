import { DomainException } from './domain.exception';

export class ValidationException extends DomainException {
  readonly code = 'VALIDATION_FAILED';

  constructor(
    message: string,
    public readonly errors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}
