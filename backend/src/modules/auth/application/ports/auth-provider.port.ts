export const AUTH_PROVIDER_PORT = Symbol('AUTH_PROVIDER_PORT');

export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix seconds
  supabaseAuthId: string;
  email: string;
  emailConfirmedAt: Date | null;
}

export interface AuthProviderPort {
  signupWithPassword(
    email: string,
    password: string,
  ): Promise<{
    supabaseAuthId: string;
    email: string;
    emailConfirmedAt: Date | null;
  }>;

  loginWithPassword(email: string, password: string): Promise<AuthSession>;

  refreshSession(refreshToken: string): Promise<AuthSession>;

  /**
   * Verifies a Supabase access token. Returns decoded claims on success, throws on failure.
   */
  verifyAccessToken(token: string): Promise<{
    sub: string; // supabase auth id
    email: string;
    aud: string;
    exp: number;
    iat: number;
    emailVerified: boolean;
    appMetadata?: Record<string, unknown>;
    userMetadata?: Record<string, unknown>;
  }>;

  /**
   * Server-side admin lookup using the service role key.
   */
  getUserByAuthId(supabaseAuthId: string): Promise<{
    supabaseAuthId: string;
    email: string;
    emailConfirmedAt: Date | null;
  } | null>;

  signOut(accessToken: string): Promise<void>;

  requestPasswordReset(email: string, redirectTo?: string): Promise<void>;

  /**
   * Confirms a password reset given the token from the email link.
   * Supabase uses an OTP-style token in the redirect URL.
   */
  updatePassword(accessToken: string, newPassword: string): Promise<void>;
}
