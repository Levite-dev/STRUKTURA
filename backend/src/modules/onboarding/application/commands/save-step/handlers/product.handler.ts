import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../shared/infrastructure/prisma/prisma.service';
import { StepHandler } from '../step-handler.registry';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1),
  unit: z.string().min(1),
  price: z.number().positive(),
  availableStock: z.number().int().min(0),
  categoryId: z.string().optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  brand: z.string().optional(),
  images: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

@Injectable()
export class ProductHandler implements StepHandler {
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
      create: { userId, businessName: 'My Store' },
    });
    await this.prisma.product.create({
      data: {
        supplierProfileId: profile.id,
        ...parsed,
        price: parsed.price.toString(),
      },
    });
  }
}
