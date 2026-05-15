import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { UsersModule } from '../users/users.module';

import { AuthController } from './presentation/controllers/auth.controller';
import { AuthWebhooksController } from './presentation/controllers/auth-webhooks.controller';
import { SupabaseJwtGuard } from './presentation/guards/supabase-jwt.guard';
import { RolesGuard } from './presentation/guards/roles.guard';
import { EmailVerifiedGuard } from './presentation/guards/email-verified.guard';

import { SupabaseClientFactory } from './infrastructure/supabase/supabase.client-factory';
import { SupabaseAuthAdapter } from './infrastructure/supabase/supabase-auth.adapter';
import { AUTH_PROVIDER_PORT } from './application/ports/auth-provider.port';

import { SignupHandler } from './application/commands/signup/signup.handler';
import { LoginHandler } from './application/commands/login/login.handler';
import { LogoutHandler } from './application/commands/logout/logout.handler';
import { RefreshTokenHandler } from './application/commands/refresh-token/refresh-token.handler';
import { RequestPasswordResetHandler } from './application/commands/request-password-reset/request-password-reset.handler';
import { ConfirmPasswordResetHandler } from './application/commands/confirm-password-reset/confirm-password-reset.handler';
import { OAuthSyncHandler } from './application/commands/oauth-sync/oauth-sync.handler';

const CommandHandlers = [
  SignupHandler,
  LoginHandler,
  LogoutHandler,
  RefreshTokenHandler,
  RequestPasswordResetHandler,
  ConfirmPasswordResetHandler,
  OAuthSyncHandler,
];

@Module({
  imports: [CqrsModule, UsersModule],
  controllers: [AuthController, AuthWebhooksController],
  providers: [
    SupabaseClientFactory,
    SupabaseAuthAdapter,
    { provide: AUTH_PROVIDER_PORT, useExisting: SupabaseAuthAdapter },
    SupabaseJwtGuard,
    RolesGuard,
    EmailVerifiedGuard,
    ...CommandHandlers,
  ],
  exports: [
    AUTH_PROVIDER_PORT,
    SupabaseJwtGuard,
    RolesGuard,
    EmailVerifiedGuard,
  ],
})
export class AuthModule {}
