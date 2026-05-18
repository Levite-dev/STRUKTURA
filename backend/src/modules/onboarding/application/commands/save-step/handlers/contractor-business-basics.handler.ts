import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { StepHandler } from '../step-handler.registry';
import { z } from 'zod';

const schema = z.object({
  businessName: z.string().min(1).optional(),
  businessDescription: z.string().optional(),
  yearsOfExperience: z.number().optional(),
  coverImageUrl: z.string().optional(),
});

@Injectable()
export class ContractorBusinessBasicsHandler implements StepHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(userId: string, _progressId: string, _stepId: string, data: unknown): Promise<void> {
    const parsed = schema.parse(data);
    await this.prisma.contractorProfile.upsert({
      where: { userId },
      update: parsed,
      create: { userId, ...parsed },
    });
  }
}
