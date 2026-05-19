import { Injectable } from '@nestjs/common';
import { Prisma, PortfolioOwnerType } from '@prisma/client';
import { PrismaService } from '../../../../../../shared/infrastructure/prisma/prisma.service';
import { StepHandler } from '../step-handler.registry';
import { z } from 'zod';

const schema = z.object({
  ownerType: z.nativeEnum(PortfolioOwnerType),
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrls: z.array(z.string()),
  projectDate: z.string().datetime().optional(),
  clientName: z.string().optional(),
  location: z.string().optional(),
  tagsJson: z.record(z.string(), z.unknown()).optional(),
  displayOrder: z.number().default(0),
});

@Injectable()
export class PortfolioItemHandler implements StepHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(
    userId: string,
    _progressId: string,
    _stepId: string,
    data: unknown,
  ): Promise<void> {
    const parsed = schema.parse(data);
    const { tagsJson, projectDate, ...rest } = parsed;
    await this.prisma.portfolioItem.create({
      data: {
        ownerUserId: userId,
        ...rest,
        ...(projectDate && { projectDate: new Date(projectDate) }),
        ...(tagsJson !== undefined && {
          tagsJson: tagsJson as Prisma.InputJsonValue,
        }),
      },
    });
  }
}
