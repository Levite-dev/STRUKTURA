import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { StepHandler } from '../step-handler.registry';
import { z } from 'zod';

const schema = z.object({
  businessName: z.string().optional(),
  storeName: z.string().optional(),
  businessDescription: z.string().optional(),
  contactPerson: z.string().optional(),
  contactNumber: z.string().optional(),
  businessEmail: z.string().email().optional(),
  tinNumber: z.string().optional(),
  storePhotos: z.array(z.string()).optional(),
});

@Injectable()
export class SupplierProfilePatchHandler implements StepHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(userId: string, _progressId: string, _stepId: string, data: unknown): Promise<void> {
    const parsed = schema.parse(data);
    await this.prisma.supplierProfile.upsert({
      where: { userId },
      update: parsed,
      create: { userId, businessName: parsed.businessName ?? 'My Store', ...parsed },
    });
  }
}
