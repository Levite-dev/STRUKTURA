import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../shared/infrastructure/prisma/prisma.service';
import { StepHandler } from '../step-handler.registry';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  scopeOfWorkTemplate: z.string().optional(),
  paymentTermsTemplate: z.string().optional(),
  estimatedDurationTemplate: z.string().optional(),
  fileUrl: z.string().optional(),
  isDefault: z.boolean().default(false),
});

@Injectable()
export class QuotationTemplateHandler implements StepHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(
    userId: string,
    _progressId: string,
    _stepId: string,
    data: unknown,
  ): Promise<void> {
    const parsed = schema.parse(data);
    const profile = await this.prisma.contractorProfile.upsert({
      where: { userId },
      update: {},
      create: { userId, yearsExperience: 0 },
    });
    await this.prisma.quotationTemplate.create({
      data: { contractorProfileId: profile.id, ...parsed },
    });
  }
}
