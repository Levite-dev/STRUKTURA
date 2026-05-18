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
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';

import { PublicRoleParamPipe } from '../pipes/role-param.pipe';
import { SaveStepRequestDto } from '../http/request-dtos/save-step.request-dto';
import { OnboardingStateResponseDto } from '../http/response-dtos/onboarding-state.response-dto';

import { StartOnboardingCommand } from '../../application/commands/start-onboarding/start-onboarding.command';
import { SaveStepCommand } from '../../application/commands/save-step/save-step.command';
import { SubmitOnboardingCommand } from '../../application/commands/submit-onboarding/submit-onboarding.command';
import { GetOnboardingStateQuery } from '../../application/queries/get-onboarding-state/get-onboarding-state.query';
import { OnboardingNotFoundException } from '../../domain/exceptions/onboarding.exceptions';

@UseGuards(SupabaseJwtGuard, EmailVerifiedGuard)
@Controller('onboarding')
export class OnboardingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly prisma: PrismaService,
  ) {}

  @Post(':role/start')
  @HttpCode(HttpStatus.CREATED)
  async start(
    @Param('role', PublicRoleParamPipe) role: Role,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.commandBus.execute(new StartOnboardingCommand(user.id, [role]));
  }

  @Get('state')
  async getState(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const state = await this.queryBus.execute(new GetOnboardingStateQuery(user.id));
    if (!state) {
      throw new OnboardingNotFoundException();
    }
    return state;
  }

  @Patch('step/:stepCode')
  async saveStep(
    @Param('stepCode') stepCode: string,
    @Body() body: { role: Role; data: unknown },
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.commandBus.execute(
      new SaveStepCommand(user.id, body.role, stepCode, body.data),
    );
  }

  @Post('step/:stepCode/skip')
  @HttpCode(HttpStatus.NO_CONTENT)
  async skipStep(
    @CurrentUser() user: AuthenticatedUser,
    @Param('stepCode') stepCode: string,
    @Body() body: { role: Role },
  ): Promise<void> {
    const flowCode = `${(body.role as string).toLowerCase()}_onboarding`;
    const flow = await this.prisma.onboardingFlow.findFirstOrThrow({
      where: { code: flowCode },
    });
    const step = await this.prisma.onboardingStep.findFirstOrThrow({
      where: { flowId: flow.id, stepCode, isSkippable: true },
    });
    const progress = await this.prisma.userOnboardingProgress.findFirstOrThrow({
      where: { userId: user.id, flowId: flow.id },
    });
    await this.prisma.userOnboardingStepProgress.updateMany({
      where: { userOnboardingProgressId: progress.id, stepId: step.id },
      data: { status: 'SKIPPED', skippedAt: new Date() },
    });
    const allSteps = await this.prisma.userOnboardingStepProgress.findMany({
      where: { userOnboardingProgressId: progress.id },
    });
    const done = allSteps.filter(
      (s) => s.status === 'COMPLETED' || s.status === 'SKIPPED',
    ).length;
    const pct = Math.round((done / allSteps.length) * 100);
    await this.prisma.userOnboardingProgress.update({
      where: { id: progress.id },
      data: {
        completionPercentage: pct,
        status: pct === 100 ? 'COMPLETED' : 'IN_PROGRESS',
        lastActivityAt: new Date(),
      },
    });
  }

  @Post(':role/submit')
  @HttpCode(HttpStatus.OK)
  async submit(
    @Param('role', PublicRoleParamPipe) role: Role,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.commandBus.execute(new SubmitOnboardingCommand(user.id, role));
  }
}
