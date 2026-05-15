import { OnboardingStatus, Role } from '@prisma/client';
import {
  ONBOARDING_STEPS,
  isValidStep,
  requiresVerification,
} from '../value-objects/onboarding-steps';
import {
  InvalidStepException,
  OnboardingAlreadyCompletedException,
  OnboardingNotReadyException,
} from '../exceptions/onboarding.exceptions';

export interface OnboardingStateProps {
  id: string;
  userId: string;
  role: Role;
  status: OnboardingStatus;
  currentStep: string | null;
  data: Record<string, unknown>;
  startedAt: Date | null;
  completedAt: Date | null;
  rejectedAt: Date | null;
  rejectReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class OnboardingState {
  private constructor(private props: OnboardingStateProps) {}

  static create(props: OnboardingStateProps): OnboardingState {
    return new OnboardingState(props);
  }

  get id(): string {
    return this.props.id;
  }
  get userId(): string {
    return this.props.userId;
  }
  get role(): Role {
    return this.props.role;
  }
  get status(): OnboardingStatus {
    return this.props.status;
  }
  get currentStep(): string | null {
    return this.props.currentStep;
  }
  get data(): Record<string, unknown> {
    return { ...this.props.data };
  }
  get startedAt(): Date | null {
    return this.props.startedAt;
  }
  get completedAt(): Date | null {
    return this.props.completedAt;
  }
  get rejectedAt(): Date | null {
    return this.props.rejectedAt;
  }
  get rejectReason(): string | null {
    return this.props.rejectReason;
  }

  isCompleted(): boolean {
    return this.props.status === OnboardingStatus.COMPLETED;
  }

  isPending(): boolean {
    return this.props.status === OnboardingStatus.PENDING_VERIFICATION;
  }

  /**
   * Returns missing required steps (steps not present in `data`).
   */
  missingSteps(): string[] {
    return ONBOARDING_STEPS[this.props.role].filter(
      (s) => !(s in this.props.data),
    );
  }

  saveStep(step: string, stepData: Record<string, unknown>): void {
    if (this.isCompleted()) {
      throw new OnboardingAlreadyCompletedException();
    }
    if (!isValidStep(this.props.role, step)) {
      throw new InvalidStepException(step);
    }
    this.props.data = { ...this.props.data, [step]: stepData };
    this.props.currentStep = step;
    this.props.status = OnboardingStatus.IN_PROGRESS;
    if (!this.props.startedAt) {
      this.props.startedAt = new Date();
    }
    this.props.updatedAt = new Date();
  }

  /**
   * Transitions the state to either COMPLETED (Client/JobSeeker) or PENDING_VERIFICATION
   * (Contractor/Supplier). Throws if required steps are missing.
   */
  submit(): { autoCompleted: boolean } {
    if (this.isCompleted()) {
      throw new OnboardingAlreadyCompletedException();
    }
    const missing = this.missingSteps();
    if (missing.length > 0) {
      throw new OnboardingNotReadyException(missing);
    }

    if (requiresVerification(this.props.role)) {
      this.props.status = OnboardingStatus.PENDING_VERIFICATION;
      this.props.updatedAt = new Date();
      return { autoCompleted: false };
    }

    this.props.status = OnboardingStatus.COMPLETED;
    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();
    return { autoCompleted: true };
  }

  approve(): void {
    if (this.props.status !== OnboardingStatus.PENDING_VERIFICATION) {
      throw new OnboardingNotReadyException([
        'submission required before approval',
      ]);
    }
    this.props.status = OnboardingStatus.COMPLETED;
    this.props.completedAt = new Date();
    this.props.updatedAt = new Date();
  }

  reject(reason: string): void {
    if (this.props.status !== OnboardingStatus.PENDING_VERIFICATION) {
      throw new OnboardingNotReadyException([
        'submission required before rejection',
      ]);
    }
    this.props.status = OnboardingStatus.REJECTED;
    this.props.rejectedAt = new Date();
    this.props.rejectReason = reason;
    this.props.updatedAt = new Date();
  }

  toPersistence(): OnboardingStateProps {
    return { ...this.props, data: { ...this.props.data } };
  }
}
