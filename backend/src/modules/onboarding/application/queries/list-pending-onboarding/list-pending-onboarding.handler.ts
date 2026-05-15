import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { ListPendingOnboardingQuery } from './list-pending-onboarding.query';
import {
  ONBOARDING_STATE_REPOSITORY,
  type OnboardingStateRepository,
} from '../../../domain/repositories/onboarding-state.repository';
import { OnboardingState } from '../../../domain/entities/onboarding-state.entity';

@QueryHandler(ListPendingOnboardingQuery)
export class ListPendingOnboardingHandler implements IQueryHandler<
  ListPendingOnboardingQuery,
  OnboardingState[]
> {
  constructor(
    @Inject(ONBOARDING_STATE_REPOSITORY)
    private readonly states: OnboardingStateRepository,
  ) {}

  execute(): Promise<OnboardingState[]> {
    return this.states.listPending();
  }
}
