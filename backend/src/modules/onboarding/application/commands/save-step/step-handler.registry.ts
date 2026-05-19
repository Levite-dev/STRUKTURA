import { Injectable } from '@nestjs/common';

export interface StepHandler {
  handle(
    userId: string,
    progressId: string,
    stepId: string,
    data: unknown,
  ): Promise<void>;
}

@Injectable()
export class StepHandlerRegistry {
  private readonly handlers = new Map<string, StepHandler>();

  register(fieldGroupCode: string, handler: StepHandler): void {
    this.handlers.set(fieldGroupCode, handler);
  }

  get(fieldGroupCode: string): StepHandler | undefined {
    return this.handlers.get(fieldGroupCode);
  }
}
