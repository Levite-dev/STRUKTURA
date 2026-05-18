import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { StepHandler } from '../step-handler.registry';
import { z } from 'zod';

const schema = z.object({
  label: z.string().optional(),
  line1: z.string().min(1),
  line2: z.string().optional(),
  barangay: z.string().optional(),
  city: z.string().min(1),
  province: z.string().min(1),
  postalCode: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  isDefault: z.boolean().default(true),
});

@Injectable()
export class ClientAddressHandler implements StepHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(userId: string, _progressId: string, _stepId: string, data: unknown): Promise<void> {
    const parsed = schema.parse(data);
    if (parsed.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId, ownerType: 'CLIENT_PROFILE' },
        data: { isDefault: false },
      });
    }
    await this.prisma.address.create({
      data: { userId, ownerType: 'CLIENT_PROFILE', ...parsed },
    });
  }
}
