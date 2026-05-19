import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const TEST_USER_ID = `multi-role-${Date.now()}`;

async function seedOnboarding(userId: string, roleCode: string) {
  const flow = await prisma.onboardingFlow.findFirst({
    where: { code: `${roleCode.toLowerCase()}_onboarding` },
    include: { steps: true },
  });
  if (!flow) return null;

  const progress = await prisma.userOnboardingProgress.upsert({
    where: { userId_flowId: { userId, flowId: flow.id } },
    update: {},
    create: {
      userId,
      flowId: flow.id,
      status: 'NOT_STARTED',
      completionPercentage: 0,
    },
  });

  await prisma.userOnboardingStepProgress.createMany({
    data: flow.steps.map((step) => ({
      userOnboardingProgressId: progress.id,
      stepId: step.id,
      status: 'PENDING',
    })),
    skipDuplicates: true,
  });

  return progress;
}

describe('Multi-role onboarding (integration)', () => {
  let userId: string;

  beforeAll(async () => {
    const user = await prisma.user.create({
      data: {
        id: TEST_USER_ID,
        supabaseAuthId: `supabase-${TEST_USER_ID}`,
        email: `multi-role-${Date.now()}@test.com`,
        firstName: 'Multi',
        lastName: 'Role',
        primaryRole: null,
      },
    });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.userOnboardingStepProgress.deleteMany({
      where: { progress: { userId } },
    });
    await prisma.userOnboardingProgress.deleteMany({ where: { userId } });
    await prisma.userRole.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } });
    await prisma.$disconnect();
  });

  it('adding CLIENT role creates one progress row', async () => {
    await prisma.userRole.upsert({
      where: { userId_role: { userId, role: 'CLIENT' } },
      update: {},
      create: { userId, role: 'CLIENT' },
    });
    await prisma.user.updateMany({
      where: { id: userId, primaryRole: null },
      data: { primaryRole: 'CLIENT' },
    });

    await seedOnboarding(userId, 'CLIENT');

    const rows = await prisma.userOnboardingProgress.findMany({
      where: { userId },
    });
    expect(rows).toHaveLength(1);
  });

  it('adding CONTRACTOR role creates second progress row; primaryRole stays CLIENT', async () => {
    await prisma.userRole.upsert({
      where: { userId_role: { userId, role: 'CONTRACTOR' } },
      update: {},
      create: { userId, role: 'CONTRACTOR' },
    });
    // primaryRole stays CLIENT because it's already set
    await prisma.user.updateMany({
      where: { id: userId, primaryRole: null },
      data: { primaryRole: 'CONTRACTOR' },
    });

    await seedOnboarding(userId, 'CONTRACTOR');

    const rows = await prisma.userOnboardingProgress.findMany({
      where: { userId },
    });
    expect(rows).toHaveLength(2);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    expect(user!.primaryRole).toBe('CLIENT'); // unchanged — was already set
  });

  it('both progress rows are independent — completing CLIENT step does not affect CONTRACTOR', async () => {
    const [clientProgress, contractorProgress] = await Promise.all([
      prisma.userOnboardingProgress.findFirst({
        where: { userId, flow: { code: 'client_onboarding' } },
        include: { stepProgress: true },
      }),
      prisma.userOnboardingProgress.findFirst({
        where: { userId, flow: { code: 'contractor_onboarding' } },
        include: { stepProgress: true },
      }),
    ]);

    expect(clientProgress).not.toBeNull();
    expect(contractorProgress).not.toBeNull();

    // Mark first CLIENT step completed
    const firstClientStep = clientProgress!.stepProgress[0];
    await prisma.userOnboardingStepProgress.updateMany({
      where: {
        userOnboardingProgressId: clientProgress!.id,
        stepId: firstClientStep.stepId,
      },
      data: { status: 'COMPLETED' },
    });

    // Contractor steps should all still be PENDING
    const contractorSteps = await prisma.userOnboardingStepProgress.findMany({
      where: { userOnboardingProgressId: contractorProgress!.id },
    });
    const allPending = contractorSteps.every((s) => s.status === 'PENDING');
    expect(allPending).toBe(true);
  });

  it('StartOnboarding is idempotent — re-running does not create duplicate rows', async () => {
    await seedOnboarding(userId, 'CLIENT');
    await seedOnboarding(userId, 'CLIENT');

    const rows = await prisma.userOnboardingProgress.findMany({
      where: { userId, flow: { code: 'client_onboarding' } },
    });
    expect(rows).toHaveLength(1);
  });
});
