import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Role } from '@prisma/client';

import { SupabaseJwtGuard } from '../../../auth/presentation/guards/supabase-jwt.guard';
import { RolesGuard } from '../../../auth/presentation/guards/roles.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
  Roles,
} from '../../../../shared/presentation/decorators';

import { RejectOnboardingRequestDto } from '../http/request-dtos/reject-onboarding.request-dto';
import { OnboardingStateResponseDto } from '../http/response-dtos/onboarding-state.response-dto';
import { ApproveOnboardingCommand } from '../../application/commands/approve-onboarding/approve-onboarding.command';
import { RejectOnboardingCommand } from '../../application/commands/reject-onboarding/reject-onboarding.command';
import { ListPendingOnboardingQuery } from '../../application/queries/list-pending-onboarding/list-pending-onboarding.query';
import { OnboardingState } from '../../domain/entities/onboarding-state.entity';

@UseGuards(SupabaseJwtGuard, RolesGuard)
@Roles(Role.ADMIN, Role.MODERATOR)
@Controller('admin/onboarding')
export class AdminOnboardingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('pending')
  async listPending(): Promise<OnboardingStateResponseDto[]> {
    const states = await this.queryBus.execute<
      ListPendingOnboardingQuery,
      OnboardingState[]
    >(new ListPendingOnboardingQuery());
    return states.map((s) => OnboardingStateResponseDto.fromDomain(s));
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(
    @Param('id') id: string,
    @CurrentUser() admin: AuthenticatedUser,
  ): Promise<OnboardingStateResponseDto> {
    const state = await this.commandBus.execute<
      ApproveOnboardingCommand,
      OnboardingState
    >(new ApproveOnboardingCommand(id, admin.id));
    return OnboardingStateResponseDto.fromDomain(state);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(
    @Param('id') id: string,
    @Body() dto: RejectOnboardingRequestDto,
    @CurrentUser() admin: AuthenticatedUser,
  ): Promise<OnboardingStateResponseDto> {
    const state = await this.commandBus.execute<
      RejectOnboardingCommand,
      OnboardingState
    >(new RejectOnboardingCommand(id, admin.id, dto.reason));
    return OnboardingStateResponseDto.fromDomain(state);
  }
}
