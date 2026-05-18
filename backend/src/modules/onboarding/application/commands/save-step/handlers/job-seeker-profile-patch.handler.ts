import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../shared/infrastructure/prisma/prisma.service';
import { StepHandler } from '../step-handler.registry';
import { z } from 'zod';

const schema = z.object({
  skillCategory: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  previousEmployer: z.string().optional(),
  workHistoryJson: z.record(z.unknown()).optional(),
  expectedDailyRate: z.number().optional(),
});

@Injectable()
export class JobSeekerProfilePatchHandler implements StepHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(userId: string, _progressId: string, _stepId: string, data: unknown): Promise<void> {
    const parsed = schema.parse(data);
    await this.prisma.jobSeekerProfile.upsert({
      where: { userId },
      update: { ...parsed, expectedDailyRate: parsed.expectedDailyRate?.toString() },
      create: { userId, ...parsed, expectedDailyRate: parsed.expectedDailyRate?.toString() },
    });
  }
}
