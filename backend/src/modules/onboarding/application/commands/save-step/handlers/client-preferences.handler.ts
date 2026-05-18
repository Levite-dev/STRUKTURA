import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../shared/infrastructure/prisma/prisma.service';
import { StepHandler } from '../step-handler.registry';
import { z } from 'zod';

const schema = z.object({
  preferredCategories: z.array(z.string()).optional(),
  interestedServices: z.array(z.string()).optional(),
  preferredLocation: z.string().optional(),
});

@Injectable()
export class ClientPreferencesHandler implements StepHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(
    userId: string,
    _progressId: string,
    _stepId: string,
    data: unknown,
  ): Promise<void> {
    const parsed = schema.parse(data);
    await this.prisma.clientProfile.update({
      where: { userId },
      data: parsed,
    });
  }
}
