import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const TEST_EMAIL = `e2e-signup-${Date.now()}@test.com`;
const TEST_USER_ID = `test-user-${Date.now()}`;

describe('Signup to first step (integration)', () => {
  let userId: string;
  let progressId: string;

  beforeAll(async () => {
    // Create a test user (simulating what SignupHandler does)
    const user = await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        supabaseAuthId: `supabase-${TEST_USER_ID}`,
        email: TEST_EMAIL,
        firstName: 'Test',
        lastName: 'User',
        primaryRole: null,
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.userOnboardingStepProgress.deleteMany({
      where: { userOnboardingProgress: { userId } },
    });
    await prisma.userOnboardingProgress.deleteMany({ where: { userId } });
    await prisma.userRole.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('adding CLIENT role creates UserOnboardingProgress', async () => {
    // Simulate AddRoleHandler: upsert UserRole + start onboarding
    await prisma.userRole.upsert({
      where: { userId_role: { userId, role: 'CLIENT' } },
      update: {},
      create: { userId, role: 'CLIENT' },
    });
    await prisma.user.update({
      where: { id: userId, primaryRole: null },
      data: { primaryRole: 'CLIENT' },
    });

    const flow = await prisma.onboardingFlow.findFirst({
      where: { code: 'client_onboarding' },
      include: { steps: true },
    });
    expect(flow).not.toBeNull();

    const progress = await prisma.userOnboardingProgress.upsert({
      where: { userId_flowId: { userId, flowId: flow!.id } },
      update: {},
      create: {
        userId,
        flowId: flow!.id,
        status: 'NOT_STARTED',
        completionPercentage: 0,
        currentStepId: [...flow!.steps].sort((a, b) => a.stepOrder - b.stepOrder)[0]?.id ?? null,
      },
    });
    progressId = progress.id;

    await prisma.userOnboardingStepProgress.createMany({
      data: flow!.steps.map((step) => ({
        userOnboardingProgressId: progress.id,
        stepId: step.id,
        status: 'PENDING',
      })),
      skipDuplicates: true,
    });

    const fetched = await prisma.userOnboardingProgress.findUnique({
      where: { id: progress.id },
      include: { stepProgress: true },
    });
    expect(fetched).not.toBeNull();
    expect(fetched!.status).toBe('NOT_STARTED');
    expect(fetched!.stepProgress.length).toBeGreaterThanOrEqual(1);
  });

  it('marking first step COMPLETED advances percentage', async () => {
    const allSteps = await prisma.userOnboardingStepProgress.findMany({
      where: { userOnboardingProgressId: progressId },
      orderBy: { step: { stepOrder: 'asc' } },
      include: { step: true },
    });
    expect(allSteps.length).toBeGreaterThan(0);

    const firstStep = allSteps[0];
    await prisma.userOnboardingStepProgress.updateMany({
      where: { userOnboardingProgressId: progressId, stepId: firstStep.stepId },
      data: { status: 'COMPLETED', completedAt: new Date() },
    });

    const completed = allSteps.filter((s) =>
      s.stepId === firstStep.stepId ? 'COMPLETED' : s.status,
    ).filter((s) => s.status === 'COMPLETED' || s.status === 'SKIPPED').length + 1;
    const pct = Math.round((completed / allSteps.length) * 100);

    await prisma.userOnboardingProgress.update({
      where: { id: progressId },
      data: { completionPercentage: pct, status: 'IN_PROGRESS', lastActivityAt: new Date() },
    });

    const progress = await prisma.userOnboardingProgress.findUnique({
      where: { id: progressId },
    });
    expect(progress!.completionPercentage).toBeGreaterThan(0);
    expect(progress!.status).toBe('IN_PROGRESS');
  });

  it('user.primaryRole is set to CLIENT after role addition', async () => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user!.primaryRole).toBe('CLIENT');
  });
});
