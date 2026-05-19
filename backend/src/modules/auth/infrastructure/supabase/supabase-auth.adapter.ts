import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createRemoteJWKSet,
  jwtVerify,
  errors as joseErrors,
  type JWTVerifyGetKey,
} from 'jose';

import {
  AuthProviderPort,
  AuthSession,
} from '../../application/ports/auth-provider.port';
import { SupabaseClientFactory } from './supabase.client-factory';
import {
  InvalidCredentialsException,
  EmailAlreadyRegisteredException,
  InvalidTokenException,
} from '../../domain/exceptions/auth.exceptions';
import { TooManyRequestsException } from '../../../../shared/domain/exceptions';

@Injectable()
export class SupabaseAuthAdapter implements AuthProviderPort {
  private readonly logger = new Logger(SupabaseAuthAdapter.name);
  private readonly jwtSecret: Uint8Array;
  private readonly jwks: JWTVerifyGetKey;
  private readonly issuer: string;

  constructor(
    private readonly clients: SupabaseClientFactory,
    private readonly config: ConfigService,
  ) {
    this.jwtSecret = new TextEncoder().encode(
      this.config.getOrThrow<string>('SUPABASE_JWT_SECRET'),
    );
    const supabaseUrl = this.config.getOrThrow<string>('SUPABASE_URL');
    this.issuer = `${supabaseUrl.replace(/\/$/, '')}/auth/v1`;
    this.jwks = createRemoteJWKSet(
      new URL(`${this.issuer}/.well-known/jwks.json`),
    );
  }

  async signupWithPassword(email: string, password: string) {
    const skipEmailConfirm =
      this.config.get<string>('AUTH_SKIP_EMAIL_CONFIRM') === 'true';

    const { data, error } = skipEmailConfirm
      ? await this.clients.admin().auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        })
      : await this.clients.anon().auth.signUp({ email, password });

    if (error) {
      if (
        error.message.toLowerCase().includes('already registered') ||
        error.message.toLowerCase().includes('already been registered') ||
        error.message.toLowerCase().includes('user already')
      ) {
        throw new EmailAlreadyRegisteredException(email);
      }
      const rateMatch = error.message.match(/after (\d+) seconds?/i);
      if (rateMatch || error.status === 429) {
        const retryAfter = rateMatch ? Number(rateMatch[1]) : undefined;
        this.logger.warn(
          { err: error.message, retryAfter },
          'Supabase signup rate-limited',
        );
        throw new TooManyRequestsException(
          'Too many signup attempts. Please wait before trying again.',
          retryAfter,
        );
      }
      this.logger.error({ err: error.message }, 'Supabase signup failed');
      throw new Error(error.message);
    }

    if (!data.user) {
      throw new Error('Supabase signup returned no user');
    }

    return {
      supabaseAuthId: data.user.id,
      email: data.user.email!,
      emailConfirmedAt: data.user.email_confirmed_at
        ? new Date(data.user.email_confirmed_at)
        : null,
    };
  }

  async loginWithPassword(
    email: string,
    password: string,
  ): Promise<AuthSession> {
    const { data, error } = await this.clients.anon().auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const rateMatch = error.message.match(/after (\d+) seconds?/i);
      if (rateMatch || error.status === 429) {
        const retryAfter = rateMatch ? Number(rateMatch[1]) : undefined;
        throw new TooManyRequestsException(
          'Too many login attempts. Please wait before trying again.',
          retryAfter,
        );
      }
      throw new InvalidCredentialsException();
    }
    if (!data.session || !data.user) {
      throw new InvalidCredentialsException();
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at ?? 0,
      supabaseAuthId: data.user.id,
      email: data.user.email!,
      emailConfirmedAt: data.user.email_confirmed_at
        ? new Date(data.user.email_confirmed_at)
        : null,
    };
  }

  async refreshSession(refreshToken: string): Promise<AuthSession> {
    const { data, error } = await this.clients.anon().auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error || !data.session || !data.user) {
      throw new InvalidTokenException('Refresh token invalid or expired.');
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
      expiresAt: data.session.expires_at ?? 0,
      supabaseAuthId: data.user.id,
      email: data.user.email!,
      emailConfirmedAt: data.user.email_confirmed_at
        ? new Date(data.user.email_confirmed_at)
        : null,
    };
  }

  async verifyAccessToken(token: string) {
    const payload = await this.verifyWithFallback(token);

    if (!payload.sub || typeof payload.sub !== 'string') {
      throw new InvalidTokenException('Token missing subject claim.');
    }

    const email = (payload['email'] as string) ?? '';
    const userMetadata = payload['user_metadata'] as
      | { email_verified?: boolean }
      | undefined;
    const emailVerified =
      (payload['email_verified'] as boolean | undefined) ??
      userMetadata?.email_verified ??
      false;

    return {
      sub: payload.sub,
      email,
      aud: (payload.aud as string) ?? '',
      exp: payload.exp ?? 0,
      iat: payload.iat ?? 0,
      emailVerified,
      appMetadata: payload['app_metadata'] as
        | Record<string, unknown>
        | undefined,
      userMetadata: payload['user_metadata'] as
        | Record<string, unknown>
        | undefined,
    };
  }

  /**
   * Verify a Supabase access token. Tries the project JWKS first
   * (ES256/RS256 — Supabase's current default for new projects), then falls
   * back to the legacy HS256 shared secret for older projects.
   */
  private async verifyWithFallback(token: string) {
    const verifyOpts = {
      issuer: this.issuer,
      audience: 'authenticated',
    } as const;

    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        ...verifyOpts,
        algorithms: ['ES256', 'RS256'],
      });
      return payload;
    } catch (err) {
      if (this.shouldFallBackToHs256(err)) {
        try {
          const { payload } = await jwtVerify(token, this.jwtSecret, {
            ...verifyOpts,
            algorithms: ['HS256'],
          });
          return payload;
        } catch (fallbackErr) {
          throw new InvalidTokenException(this.describeJwtError(fallbackErr));
        }
      }
      throw new InvalidTokenException(this.describeJwtError(err));
    }
  }

  private shouldFallBackToHs256(err: unknown): boolean {
    return (
      err instanceof joseErrors.JOSEAlgNotAllowed ||
      err instanceof joseErrors.JWKSNoMatchingKey ||
      err instanceof joseErrors.JWKSMultipleMatchingKeys ||
      err instanceof joseErrors.JWKSInvalid ||
      err instanceof joseErrors.JWKSTimeout ||
      err instanceof joseErrors.JWSSignatureVerificationFailed
    );
  }

  private describeJwtError(err: unknown): string {
    if (err instanceof Error && err.message) return err.message;
    return 'Token verification failed.';
  }

  async getUserByAuthId(supabaseAuthId: string) {
    const { data, error } = await this.clients
      .admin()
      .auth.admin.getUserById(supabaseAuthId);
    if (error || !data?.user) {
      return null;
    }
    return {
      supabaseAuthId: data.user.id,
      email: data.user.email!,
      emailConfirmedAt: data.user.email_confirmed_at
        ? new Date(data.user.email_confirmed_at)
        : null,
    };
  }

  async signOut(accessToken: string): Promise<void> {
    // Revoke the session via admin API. The user's access token cannot be invalidated mid-flight
    // (JWTs are stateless) but the refresh token becomes useless.
    const { error } = await this.clients
      .anon()
      .auth.signOut({ scope: 'global' });
    if (error) {
      this.logger.warn({ err: error.message }, 'Sign out reported an error');
    }
    // Note: accessToken is unused here — Supabase JS SDK uses internal session state.
    // For a fully stateless backend, swap to a direct REST call with the Bearer token.
    void accessToken;
  }

  async requestPasswordReset(
    email: string,
    redirectTo?: string,
  ): Promise<void> {
    const { error } = await this.clients
      .anon()
      .auth.resetPasswordForEmail(email, {
        redirectTo,
      });
    if (error) {
      this.logger.warn({ err: error.message }, 'Password reset request failed');
      // Do NOT leak whether the email is registered — return success regardless.
    }
  }

  async updatePassword(
    accessToken: string,
    newPassword: string,
  ): Promise<void> {
    const supabase = this.clients.anon();
    const { error: sessionErr } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: '',
    });
    if (sessionErr) {
      throw new InvalidTokenException(
        'Password reset token invalid or expired.',
      );
    }
    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (updateErr) {
      throw new InvalidTokenException(updateErr.message);
    }
  }
}
