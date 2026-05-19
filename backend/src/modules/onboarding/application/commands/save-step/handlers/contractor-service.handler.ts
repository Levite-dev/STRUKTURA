import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../shared/infrastructure/prisma/prisma.service';
import { StepHandler } from '../step-handler.registry';
import { z } from 'zod';
import { PricingType } from '@prisma/client';

const schema = z.object({
  name: z.string().min(1),
  categories: z.array(z.string()),
  pricingType: z.nativeEnum(PricingType),
  basePriceMin: z.number().optional(),
  basePriceMax: z.number().optional(),
  serviceArea: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

@Injectable()
export class ContractorServiceHandler implements StepHandler {
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
    await this.prisma.contractorService.create({
      data: { contractorProfileId: profile.id, ...parsed },
    });
  }
}
