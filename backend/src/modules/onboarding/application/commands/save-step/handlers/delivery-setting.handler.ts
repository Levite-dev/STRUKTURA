import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../shared/infrastructure/prisma/prisma.service';
import { StepHandler } from '../step-handler.registry';
import { z } from 'zod';

const schema = z.object({
  deliveryAreas: z.array(z.string()).default([]),
  deliveryFee: z.number().optional(),
  deliveryAvailable: z.boolean().default(false),
  pickupAvailable: z.boolean().default(false),
  pickupAddress: z.string().optional(),
  minOrderForDelivery: z.number().optional(),
  estimatedDays: z.number().int().optional(),
  notes: z.string().optional(),
});

@Injectable()
export class DeliverySettingHandler implements StepHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(
    userId: string,
    _progressId: string,
    _stepId: string,
    data: unknown,
  ): Promise<void> {
    const parsed = schema.parse(data);
    const profile = await this.prisma.supplierProfile.upsert({
      where: { userId },
      update: {},
      create: { userId, businessName: 'My Store', businessAddress: '' },
    });
    await this.prisma.deliverySetting.upsert({
      where: { supplierProfileId: profile.id },
      update: {
        ...parsed,
        deliveryFee: parsed.deliveryFee?.toString(),
        minOrderForDelivery: parsed.minOrderForDelivery?.toString(),
      },
      create: {
        supplierProfileId: profile.id,
        ...parsed,
        deliveryFee: parsed.deliveryFee?.toString(),
        minOrderForDelivery: parsed.minOrderForDelivery?.toString(),
      },
    });
  }
}
