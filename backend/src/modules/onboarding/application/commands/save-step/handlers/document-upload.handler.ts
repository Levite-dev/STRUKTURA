import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../../shared/infrastructure/prisma/prisma.service';
import { StepHandler } from '../step-handler.registry';
import { z } from 'zod';
import { DocumentType, DocumentOwnerType } from '@prisma/client';

const schema = z.object({
  type: z.nativeEnum(DocumentType),
  ownerType: z.nativeEnum(DocumentOwnerType),
  url: z.string().url(),
  fileName: z.string().optional(),
  mimeType: z.string().optional(),
  sizeBytes: z.number().optional(),
  expiryDate: z.string().datetime().optional(),
});

@Injectable()
export class DocumentUploadHandler implements StepHandler {
  constructor(private readonly prisma: PrismaService) {}

  async handle(
    userId: string,
    _progressId: string,
    _stepId: string,
    data: unknown,
  ): Promise<void> {
    const parsed = schema.parse(data);
    await this.prisma.document.create({
      data: {
        ownerUserId: userId,
        ...parsed,
        expiryDate: parsed.expiryDate ? new Date(parsed.expiryDate) : undefined,
      },
    });
  }
}
