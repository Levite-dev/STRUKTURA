import { DomainException } from './domain.exception';

export class TooManyRequestsException extends DomainException {
  readonly code = 'TOO_MANY_REQUESTS';
  readonly retryAfterSeconds?: number;

  constructor(message: string, retryAfterSeconds?: number) {
    super(message);
    this.retryAfterSeconds = retryAfterSeconds;
  }
}
