import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

import { OnboardingController } from './presentation/controllers/onboarding.controller';
import { AdminOnboardingController } from './presentation/controllers/admin-onboarding.controller';
import { PublicRoleParamPipe } from './presentation/pipes/role-param.pipe';

import { OnboardingStatePrismaRepository } from './persistence/repositories/onboarding-state.prisma.repository';
import { ProfilePrismaRepository } from './persistence/repositories/profile.prisma.repository';
import { ONBOARDING_STATE_REPOSITORY } from './domain/repositories/onboarding-state.repository';
import { PROFILE_REPOSITORY } from './domain/repositories/profile.repository';

import { StartOnboardingHandler } from './application/commands/start-onboarding/start-onboarding.handler';
import { SaveStepHandler } from './application/commands/save-step/save-step.handler';
import { SubmitOnboardingHandler } from './application/commands/submit-onboarding/submit-onboarding.handler';
import { ApproveOnboardingHandler } from './application/commands/approve-onboarding/approve-onboarding.handler';
import { RejectOnboardingHandler } from './application/commands/reject-onboarding/reject-onboarding.handler';
import { GetOnboardingStateHandler } from './application/queries/get-onboarding-state/get-onboarding-state.handler';
import { ListPendingOnboardingHandler } from './application/queries/list-pending-onboarding/list-pending-onboarding.handler';

const CommandHandlers = [
  StartOnboardingHandler,
  SaveStepHandler,
  SubmitOnboardingHandler,
  ApproveOnboardingHandler,
  RejectOnboardingHandler,
];

const QueryHandlers = [GetOnboardingStateHandler, ListPendingOnboardingHandler];

@Module({
  imports: [CqrsModule, UsersModule, AuthModule],
  controllers: [OnboardingController, AdminOnboardingController],
  providers: [
    OnboardingStatePrismaRepository,
    {
      provide: ONBOARDING_STATE_REPOSITORY,
      useExisting: OnboardingStatePrismaRepository,
    },
    ProfilePrismaRepository,
    { provide: PROFILE_REPOSITORY, useExisting: ProfilePrismaRepository },
    PublicRoleParamPipe,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class OnboardingModule {}
