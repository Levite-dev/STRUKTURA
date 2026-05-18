import {
  VerificationGateService,
  VerificationRequiredException,
} from '../../src/modules/onboarding/domain/services/verification-gate.service';
import { PrismaService } from '../../src/shared/infrastructure/prisma/prisma.service';

describe('VerificationGateService', () => {
  let service: VerificationGateService;
  let prisma: jest.Mocked<Pick<PrismaService, 'document'>>;

  beforeEach(() => {
    prisma = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      document: { findMany: jest.fn() } as any,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    service = new VerificationGateService(prisma as any);
  });

  it('throws VerificationRequiredException when no docs approved', async () => {
    (prisma.document.findMany as jest.Mock).mockResolvedValue([]);
    await expect(
      service.assertCanPerform('user1', 'quote.accept'),
    ).rejects.toBeInstanceOf(VerificationRequiredException);
  });

  it('throws with correct missing doc types', async () => {
    (prisma.document.findMany as jest.Mock).mockResolvedValue([
      { type: 'VALID_ID' },
    ]);
    const err = await service
      .assertCanPerform('user1', 'quote.accept')
      .catch((e: unknown) => e);
    expect(err).toBeInstanceOf(VerificationRequiredException);
    expect((err as VerificationRequiredException).missingDocTypes).toEqual([
      'BUSINESS_PERMIT',
    ]);
  });

  it('resolves when all required docs are approved', async () => {
    (prisma.document.findMany as jest.Mock).mockResolvedValue([
      { type: 'VALID_ID' },
      { type: 'BUSINESS_PERMIT' },
    ]);
    await expect(
      service.assertCanPerform('user1', 'quote.accept'),
    ).resolves.toBeUndefined();
  });

  it('job.contact only requires VALID_ID', async () => {
    (prisma.document.findMany as jest.Mock).mockResolvedValue([
      { type: 'VALID_ID' },
    ]);
    await expect(
      service.assertCanPerform('user1', 'job.contact'),
    ).resolves.toBeUndefined();
  });
});
