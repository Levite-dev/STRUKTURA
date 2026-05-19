import { ApiError } from './api';

export type AuthAction = 'signup' | 'login';

function toApiError(err: unknown): ApiError | null {
  if (err instanceof ApiError) return err;
  if (
    err &&
    typeof err === 'object' &&
    'status' in err &&
    typeof (err as { status: unknown }).status === 'number'
  ) {
    const e = err as { status: number; message?: string };
    const msg =
      typeof e.message === 'string' ? e.message : 'Authentication error.';
    return new ApiError(e.status, msg, err);
  }
  return null;
}

export function friendlyAuthError(err: unknown, action: AuthAction): string {
  const apiErr = toApiError(err);
  if (apiErr) return resolveByStatus(apiErr, action);
  if (err instanceof Error) {
    if (/fetch|network|failed to fetch/i.test(err.message)) {
      return 'Network error. Check your connection and try again.';
    }
    return err.message;
  }
  return 'Something went wrong. Please try again.';
}

function resolveByStatus(err: ApiError, action: AuthAction): string {
  switch (err.status) {
    case 400:
      if (/password/i.test(err.message)) {
        return 'Password does not meet requirements.';
      }
      if (/email/i.test(err.message)) {
        return 'Please enter a valid email address.';
      }
      return 'Please check the form fields and try again.';
    case 401:
      return action === 'login'
        ? 'Incorrect email or password.'
        : 'Authentication failed. Please try again.';
    case 403:
      if (/email.*verif/i.test(err.message) || /not.*confirmed/i.test(err.message)) {
        return 'Please verify your email before signing in. Check your inbox.';
      }
      if (/suspend/i.test(err.message)) {
        return 'This account is suspended. Contact support.';
      }
      return 'Access denied.';
    case 409:
      return 'An account with this email already exists. Try signing in instead.';
    case 422:
      return err.message || 'Invalid input. Please review the form.';
    case 429: {
      const wait = err.retryAfterSeconds;
      return wait
        ? `Too many attempts. Please wait ${wait} seconds and try again.`
        : 'Too many attempts. Please wait a moment and try again.';
    }
    case 500:
    case 502:
    case 503:
    case 504:
      return 'Something went wrong on our end. Please try again in a moment.';
    default:
      return err.message || 'Unexpected error. Please try again.';
  }
}
