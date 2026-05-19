import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../shared/infrastructure/prisma/prisma.service';
import { StepHandler } from '../step-handler.registry';
import { z } from 'zod';
import { PayoutMethod } from '@prisma/client';

const schema = z.object({
  method: z.nativeEnum(PayoutMethod),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  gcashNumber: z.string().optional(),
  mayaNumber: z.string().optional(),
  isDefault: z.boolean().default(true),
});

@Injectable()
export class PayoutAccountHandler implements StepHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(
    userId: string,
    _progressId: string,
    _stepId: string,
    data: unknown,
  ): Promise<void> {
    const parsed = schema.parse(data);
    if (parsed.isDefault) {
      await this.prisma.payoutAccount.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }
    await this.prisma.payoutAccount.create({ data: { userId, ...parsed } });
  }
}
