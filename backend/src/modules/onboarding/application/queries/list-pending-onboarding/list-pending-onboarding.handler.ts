import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { ListPendingOnboardingQuery } from './list-pending-onboarding.query';
import {
  ONBOARDING_STATE_REPOSITORY,
  OnboardingProgressSnapshot,
  type OnboardingStateRepository,
} from '../../../domain/repositories/onboarding-state.repository';

@QueryHandler(ListPendingOnboardingQuery)
export class ListPendingOnboardingHandler implements IQueryHandler<
  ListPendingOnboardingQuery,
  OnboardingProgressSnapshot[]
> {
  constructor(
    @Inject(ONBOARDING_STATE_REPOSITORY)
    private readonly states: OnboardingStateRepository,
  ) {}

  execute(): Promise<OnboardingProgressSnapshot[]> {
    return this.states.listPending();
  }
}
