import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { GetOnboardingStateQuery } from './get-onboarding-state.query';
import {
  ONBOARDING_STATE_REPOSITORY,
  OnboardingProgressSnapshot,
  type OnboardingStateRepository,
} from '../../../domain/repositories/onboarding-state.repository';

@QueryHandler(GetOnboardingStateQuery)
export class GetOnboardingStateHandler implements IQueryHandler<
  GetOnboardingStateQuery,
  OnboardingProgressSnapshot | null
> {
  constructor(
    @Inject(ONBOARDING_STATE_REPOSITORY)
    private readonly states: OnboardingStateRepository,
  ) {}

  execute(
    query: GetOnboardingStateQuery,
  ): Promise<OnboardingProgressSnapshot | null> {
    return this.states.findByUserAndRole(query.userId, query.role);
  }
}
