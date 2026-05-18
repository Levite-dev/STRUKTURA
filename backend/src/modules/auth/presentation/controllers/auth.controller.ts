import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';

import {
  Public,
  CurrentUser,
  type AuthenticatedUser,
} from '../../../../shared/presentation/decorators';
import { SupabaseJwtGuard } from '../guards/supabase-jwt.guard';

import { SignupRequestDto } from '../http/request-dtos/signup.request-dto';
import { LoginRequestDto } from '../http/request-dtos/login.request-dto';
import { RefreshTokenRequestDto } from '../http/request-dtos/refresh-token.request-dto';
import {
  RequestPasswordResetDto,
  ConfirmPasswordResetDto,
} from '../http/request-dtos/password-reset.request-dto';
import { OAuthCallbackDto } from '../http/request-dtos/oauth-callback.request-dto';

import { SignupResponseDto } from '../http/response-dtos/signup.response-dto';
import { LoginResponseDto } from '../http/response-dtos/login.response-dto';
import { UserResponseDto } from '../../../users/presentation/http/response-dtos/user.response-dto';

import { SignupCommand } from '../../application/commands/signup/signup.command';
import type { SignupResult } from '../../application/commands/signup/signup.handler';
import { LoginCommand } from '../../application/commands/login/login.command';
import type { LoginResult } from '../../application/commands/login/login.handler';
import { LogoutCommand } from '../../application/commands/logout/logout.command';
import { RefreshTokenCommand } from '../../application/commands/refresh-token/refresh-token.command';
import { RequestPasswordResetCommand } from '../../application/commands/request-password-reset/request-password-reset.command';
import { ConfirmPasswordResetCommand } from '../../application/commands/confirm-password-reset/confirm-password-reset.command';
import { OAuthSyncCommand } from '../../application/commands/oauth-sync/oauth-sync.command';
import type { OAuthSyncResult } from '../../application/commands/oauth-sync/oauth-sync.handler';
import type { AuthSession } from '../../application/ports/auth-provider.port';

@Controller('auth')
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('signup')
  async signup(
    @Body() dto: SignupRequestDto,
    @Req() req: Request,
  ): Promise<SignupResponseDto> {
    const result = await this.commandBus.execute<SignupCommand, SignupResult>(
      new SignupCommand(
        dto.email,
        dto.password,
        dto.firstName,
        dto.lastName,
        dto.phone,
        getIp(req),
        getUserAgent(req),
      ),
    );
    return {
      userId: result.userId,
      email: result.email,
      emailVerified: result.emailVerified,
      message: result.emailVerified
        ? 'Account created.'
        : 'Account created. Check your email to verify your address before logging in.',
    };
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginRequestDto,
    @Req() req: Request,
  ): Promise<LoginResponseDto> {
    const result = await this.commandBus.execute<LoginCommand, LoginResult>(
      new LoginCommand(dto.email, dto.password, getIp(req), getUserAgent(req)),
    );
    return {
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      expiresAt: result.expiresAt,
      user: UserResponseDto.fromDomain(result.user),
    };
  }

  @UseGuards(SupabaseJwtGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ): Promise<void> {
    const token = extractBearer(req) ?? '';
    await this.commandBus.execute(new LogoutCommand(user.id, token));
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshTokenRequestDto): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresAt: number;
  }> {
    const session = await this.commandBus.execute<
      RefreshTokenCommand,
      AuthSession
    >(new RefreshTokenCommand(dto.refreshToken));
    return {
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
    };
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 3 } })
  @Post('password-reset/request')
  @HttpCode(HttpStatus.ACCEPTED)
  async requestPasswordReset(
    @Body() dto: RequestPasswordResetDto,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(
      new RequestPasswordResetCommand(dto.email, dto.redirectTo),
    );
    // Always return success — do not leak whether email exists.
    return {
      message:
        'If an account exists for that email, a reset link has been sent.',
    };
  }

  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  @Post('password-reset/confirm')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmPasswordReset(
    @Body() dto: ConfirmPasswordResetDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new ConfirmPasswordResetCommand(dto.accessToken, dto.newPassword),
    );
  }

  /**
   * Receives the Supabase JWT after a successful OAuth (Google/Facebook) round-trip on the
   * client. Backend verifies the token and ensures an internal user row exists.
   */
  @Public()
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @Post('oauth/callback')
  @HttpCode(HttpStatus.OK)
  async oauthCallback(
    @Body() dto: OAuthCallbackDto,
    @Req() req: Request,
  ): Promise<{ user: UserResponseDto }> {
    const result = await this.commandBus.execute<
      OAuthSyncCommand,
      OAuthSyncResult
    >(new OAuthSyncCommand(dto.accessToken, getIp(req), getUserAgent(req)));
    return { user: UserResponseDto.fromDomain(result.user) };
  }
}

function getIp(req: Request): string | null {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim();
  if (Array.isArray(forwarded) && forwarded.length > 0)
    return forwarded[0].split(',')[0].trim();
  return req.ip ?? null;
}

function getUserAgent(req: Request): string | null {
  const ua = req.headers['user-agent'];
  return typeof ua === 'string' ? ua : null;
}

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (typeof header !== 'string') return null;
  const [scheme, token] = header.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token.trim();
}
