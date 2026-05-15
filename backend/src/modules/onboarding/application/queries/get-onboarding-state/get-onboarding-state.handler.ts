import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { GetOnboardingStateQuery } from './get-onboarding-state.query';
import {
  ONBOARDING_STATE_REPOSITORY,
  type OnboardingStateRepository,
} from '../../../domain/repositories/onboarding-state.repository';
import { OnboardingState } from '../../../domain/entities/onboarding-state.entity';

@QueryHandler(GetOnboardingStateQuery)
export class GetOnboardingStateHandler implements IQueryHandler<
  GetOnboardingStateQuery,
  OnboardingState | null
> {
  constructor(
    @Inject(ONBOARDING_STATE_REPOSITORY)
    private readonly states: OnboardingStateRepository,
  ) {}

  execute(query: GetOnboardingStateQuery): Promise<OnboardingState | null> {
    return this.states.findByUserAndRole(query.userId, query.role);
  }
}
