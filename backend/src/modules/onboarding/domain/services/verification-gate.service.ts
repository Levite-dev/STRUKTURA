import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { DocumentType } from '@prisma/client';

export class VerificationRequiredException extends Error {
  constructor(public readonly missingDocTypes: DocumentType[]) {
    super(`Verification required: ${missingDocTypes.join(', ')}`);
    this.name = 'VerificationRequiredException';
  }
}

export type GatedAction = 'quote.accept' | 'order.fulfill' | 'job.contact';

const REQUIRED_DOCS: Record<GatedAction, DocumentType[]> = {
  'quote.accept': ['VALID_ID', 'BUSINESS_PERMIT'],
  'order.fulfill': ['BUSINESS_PERMIT'],
  'job.contact': ['VALID_ID'],
};

@Injectable()
export class VerificationGateService {
  constructor(private readonly prisma: PrismaService) {}

  async assertCanPerform(userId: string, action: GatedAction): Promise<void> {
    const required = REQUIRED_DOCS[action];
    const approved = await this.prisma.document.findMany({
      where: {
        ownerUserId: userId,
        type: { in: required },
        status: 'APPROVED',
      },
      select: { type: true },
    });
    const approvedTypes = new Set(approved.map((d) => d.type));
    const missing = required.filter((t) => !approvedTypes.has(t));
    if (missing.length > 0) throw new VerificationRequiredException(missing);
  }
}
