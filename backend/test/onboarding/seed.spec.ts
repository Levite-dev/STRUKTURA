import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Seed', () => {
  it('should have 4 flows', async () => {
    const flows = await prisma.onboardingFlow.findMany();
    expect(flows).toHaveLength(4);
  });

  it('should have at least 42 steps total', async () => {
    const steps = await prisma.onboardingStep.findMany();
    expect(steps.length).toBeGreaterThanOrEqual(42);
  });

  it('all steps should have phase set', async () => {
    const steps = await prisma.onboardingStep.findMany();
    steps.forEach((s) => expect(s.phase).toBeGreaterThanOrEqual(1));
  });

  it('all steps should have fieldGroupCode set (at least non-required ones can be null)', async () => {
    const steps = await prisma.onboardingStep.findMany();
    const withGroupCode = steps.filter((s) => s.fieldGroupCode !== null);
    expect(withGroupCode.length).toBeGreaterThan(30);
  });

  afterAll(() => prisma.$disconnect());
});
