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

import { StepHandlerRegistry } from './application/commands/save-step/step-handler.registry';
import { StepHandlerBootstrapService } from './application/commands/save-step/step-handler-bootstrap.service';
import { ClientAddressHandler } from './application/commands/save-step/handlers/client-address.handler';
import { ClientPreferencesHandler } from './application/commands/save-step/handlers/client-preferences.handler';
import { ContractorBusinessBasicsHandler } from './application/commands/save-step/handlers/contractor-business-basics.handler';
import { ContractorServiceHandler } from './application/commands/save-step/handlers/contractor-service.handler';
import { PortfolioItemHandler } from './application/commands/save-step/handlers/portfolio-item.handler';
import { DocumentUploadHandler } from './application/commands/save-step/handlers/document-upload.handler';
import { PayoutAccountHandler } from './application/commands/save-step/handlers/payout-account.handler';
import { QuotationTemplateHandler } from './application/commands/save-step/handlers/quotation-template.handler';
import { SupplierProfilePatchHandler } from './application/commands/save-step/handlers/supplier-profile-patch.handler';
import { ProductHandler } from './application/commands/save-step/handlers/product.handler';
import { DeliverySettingHandler } from './application/commands/save-step/handlers/delivery-setting.handler';
import { JobSeekerProfilePatchHandler } from './application/commands/save-step/handlers/job-seeker-profile-patch.handler';
import { CoverImageHandler } from './application/commands/save-step/handlers/cover-image.handler';

const CommandHandlers = [
  StartOnboardingHandler,
  SaveStepHandler,
  SubmitOnboardingHandler,
  ApproveOnboardingHandler,
  RejectOnboardingHandler,
];

const QueryHandlers = [GetOnboardingStateHandler, ListPendingOnboardingHandler];

const StepHandlers = [
  ClientAddressHandler,
  ClientPreferencesHandler,
  ContractorBusinessBasicsHandler,
  ContractorServiceHandler,
  PortfolioItemHandler,
  DocumentUploadHandler,
  PayoutAccountHandler,
  QuotationTemplateHandler,
  SupplierProfilePatchHandler,
  ProductHandler,
  DeliverySettingHandler,
  JobSeekerProfilePatchHandler,
  CoverImageHandler,
];

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
    StepHandlerRegistry,
    StepHandlerBootstrapService,
    ...StepHandlers,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
})
export class OnboardingModule {}
