import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandBus } from '@nestjs/cqrs';
import { timingSafeEqual } from 'crypto';

import { Public } from '../../../../shared/presentation/decorators';
import { WebhookSignatureInvalidException } from '../../domain/exceptions/auth.exceptions';
import { MarkEmailVerifiedCommand } from '../../../users/application/commands/mark-email-verified/mark-email-verified.command';

interface SupabaseAuthHookPayload {
  type?: string;
  event?: string;
  record?: { id?: string; email?: string; email_confirmed_at?: string | null };
  // Generic shape — Supabase Auth Hooks vary by event.
}

@Controller('auth/webhooks')
export class AuthWebhooksController {
  private readonly logger = new Logger(AuthWebhooksController.name);

  constructor(
    private readonly commandBus: CommandBus,
    private readonly config: ConfigService,
  ) {}

  /**
   * Supabase Auth Hook receiver. Set up in Supabase dashboard → Auth → Hooks.
   * Header expected: `x-webhook-secret: <SUPABASE_WEBHOOK_SECRET>`
   */
  @Public()
  @Post('email-verified')
  @HttpCode(HttpStatus.NO_CONTENT)
  async emailVerified(
    @Headers('x-webhook-secret') signature: string | undefined,
    @Body() payload: SupabaseAuthHookPayload,
  ): Promise<void> {
    this.verifySignature(signature);

    const supabaseAuthId = payload.record?.id;
    const confirmedAtIso = payload.record?.email_confirmed_at;

    if (!supabaseAuthId || !confirmedAtIso) {
      this.logger.warn(
        { payload },
        'Email-verified webhook missing record.id or email_confirmed_at',
      );
      return;
    }

    await this.commandBus.execute(
      new MarkEmailVerifiedCommand(supabaseAuthId, new Date(confirmedAtIso)),
    );
  }

  private verifySignature(provided: string | undefined): void {
    const expected = this.config.getOrThrow<string>('SUPABASE_WEBHOOK_SECRET');
    if (!provided) {
      throw new WebhookSignatureInvalidException();
    }
    const a = Buffer.from(provided);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new WebhookSignatureInvalidException();
    }
  }
}
