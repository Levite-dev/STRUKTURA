import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../shared/infrastructure/prisma/prisma.service';
import { StepHandler } from '../step-handler.registry';
import { z } from 'zod';

const schema = z.object({ avatarUrl: z.string().url() });

@Injectable()
export class CoverImageHandler implements StepHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(
    userId: string,
    _progressId: string,
    _stepId: string,
    data: unknown,
  ): Promise<void> {
    const { avatarUrl } = schema.parse(data);
    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
  }
}
