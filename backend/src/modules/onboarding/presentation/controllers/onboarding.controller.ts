import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Role } from '@prisma/client';

import { SupabaseJwtGuard } from '../../../auth/presentation/guards/supabase-jwt.guard';
import { EmailVerifiedGuard } from '../../../auth/presentation/guards/email-verified.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../../../shared/presentation/decorators';

import { PublicRoleParamPipe } from '../pipes/role-param.pipe';
import { SaveStepRequestDto } from '../http/request-dtos/save-step.request-dto';
import { OnboardingStateResponseDto } from '../http/response-dtos/onboarding-state.response-dto';

import { StartOnboardingCommand } from '../../application/commands/start-onboarding/start-onboarding.command';
import { SaveStepCommand } from '../../application/commands/save-step/save-step.command';
import { SubmitOnboardingCommand } from '../../application/commands/submit-onboarding/submit-onboarding.command';
import { GetOnboardingStateQuery } from '../../application/queries/get-onboarding-state/get-onboarding-state.query';
import { OnboardingState } from '../../domain/entities/onboarding-state.entity';
import { OnboardingNotFoundException } from '../../domain/exceptions/onboarding.exceptions';

@UseGuards(SupabaseJwtGuard, EmailVerifiedGuard)
@Controller('onboarding')
export class OnboardingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post(':role/start')
  @HttpCode(HttpStatus.CREATED)
  async start(
    @Param('role', PublicRoleParamPipe) role: Role,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OnboardingStateResponseDto> {
    const state = await this.commandBus.execute<
      StartOnboardingCommand,
      OnboardingState
    >(new StartOnboardingCommand(user.id, role));
    return OnboardingStateResponseDto.fromDomain(state);
  }

  @Get(':role')
  async get(
    @Param('role', PublicRoleParamPipe) role: Role,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OnboardingStateResponseDto> {
    const state = await this.queryBus.execute<
      GetOnboardingStateQuery,
      OnboardingState | null
    >(new GetOnboardingStateQuery(user.id, role));
    if (!state) {
      throw new OnboardingNotFoundException();
    }
    return OnboardingStateResponseDto.fromDomain(state);
  }

  @Patch(':role/step')
  async saveStep(
    @Param('role', PublicRoleParamPipe) role: Role,
    @Body() dto: SaveStepRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OnboardingStateResponseDto> {
    const state = await this.commandBus.execute<
      SaveStepCommand,
      OnboardingState
    >(new SaveStepCommand(user.id, role, dto.step, dto.data));
    return OnboardingStateResponseDto.fromDomain(state);
  }

  @Post(':role/submit')
  @HttpCode(HttpStatus.OK)
  async submit(
    @Param('role', PublicRoleParamPipe) role: Role,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<OnboardingStateResponseDto> {
    const state = await this.commandBus.execute<
      SubmitOnboardingCommand,
      OnboardingState
    >(new SubmitOnboardingCommand(user.id, role));
    return OnboardingStateResponseDto.fromDomain(state);
  }
}
