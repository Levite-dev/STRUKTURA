import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../../shared/infrastructure/prisma/prisma.service';
import { StepHandler } from '../step-handler.registry';
import { z } from 'zod';

const schema = z.object({
  skillCategory: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  previousEmployer: z.string().optional(),
  workHistoryJson: z.record(z.string(), z.unknown()).optional(),
  expectedDailyRate: z.number().optional(),
});

@Injectable()
export class JobSeekerProfilePatchHandler implements StepHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(
    userId: string,
    _progressId: string,
    _stepId: string,
    data: unknown,
  ): Promise<void> {
    const parsed = schema.parse(data);
    const { workHistoryJson, expectedDailyRate, ...rest } = parsed;
    const workHistory =
      workHistoryJson !== undefined
        ? (workHistoryJson as Prisma.InputJsonValue)
        : undefined;
    const dailyRate = expectedDailyRate?.toString();

    await this.prisma.jobSeekerProfile.upsert({
      where: { userId },
      update: {
        ...rest,
        ...(workHistory !== undefined && { workHistoryJson: workHistory }),
        ...(dailyRate !== undefined && { expectedDailyRate: dailyRate }),
      },
      create: {
        userId,
        yearsExperience: 0,
        ...rest,
        ...(workHistory !== undefined && { workHistoryJson: workHistory }),
        ...(dailyRate !== undefined && { expectedDailyRate: dailyRate }),
      },
    });
  }
}
