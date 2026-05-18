import { PrismaClient, OnboardingTriggerType, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const flows: Array<{ code: string; name: string; targetRole: Role }> = [
  { code: 'client_onboarding', name: 'Client Onboarding', targetRole: 'CLIENT' },
  { code: 'contractor_onboarding', name: 'Contractor Onboarding', targetRole: 'CONTRACTOR' },
  { code: 'supplier_onboarding', name: 'Supplier Onboarding', targetRole: 'SUPPLIER' },
  { code: 'job_seeker_onboarding', name: 'Job Seeker Onboarding', targetRole: 'JOB_SEEKER' },
];

const steps: Record<string, Array<{
  stepCode: string; title: string; phase: number;
  triggerType: OnboardingTriggerType; fieldGroupCode: string;
  stepOrder: number; isRequired: boolean; isSkippable: boolean;
}>> = {
  client_onboarding: [
    { stepCode: 'client.personal_info', title: 'Personal Info', phase: 1, triggerType: 'INTERNAL', fieldGroupCode: 'client.personal_info', stepOrder: 1, isRequired: true, isSkippable: false },
    { stepCode: 'client.address', title: 'Delivery Address', phase: 2, triggerType: 'ACTION_GATE', fieldGroupCode: 'client.address', stepOrder: 2, isRequired: true, isSkippable: false },
    { stepCode: 'client.preferences', title: 'Preferences', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'client.preferences', stepOrder: 3, isRequired: false, isSkippable: true },
    { stepCode: 'client.cover', title: 'Profile Photo', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.cover', stepOrder: 4, isRequired: false, isSkippable: true },
    { stepCode: 'client.complete', title: 'Complete', phase: 4, triggerType: 'INTERNAL', fieldGroupCode: 'client.complete', stepOrder: 5, isRequired: true, isSkippable: false },
  ],
  contractor_onboarding: [
    { stepCode: 'contractor.personal_info', title: 'Personal Info', phase: 1, triggerType: 'INTERNAL', fieldGroupCode: 'contractor.personal_info', stepOrder: 1, isRequired: true, isSkippable: false },
    { stepCode: 'contractor.business_basics', title: 'Business Basics', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'contractor.business_basics', stepOrder: 2, isRequired: true, isSkippable: false },
    { stepCode: 'contractor.first_service', title: 'First Service', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'contractor.first_service', stepOrder: 3, isRequired: true, isSkippable: false },
    { stepCode: 'contractor.service_details', title: 'Service Details', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'contractor.service_details', stepOrder: 4, isRequired: false, isSkippable: true },
    { stepCode: 'contractor.portfolio', title: 'Portfolio', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.portfolio', stepOrder: 5, isRequired: false, isSkippable: true },
    { stepCode: 'contractor.verification', title: 'Valid ID', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.verification', stepOrder: 6, isRequired: true, isSkippable: false },
    { stepCode: 'contractor.license', title: 'License', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.license', stepOrder: 7, isRequired: false, isSkippable: true },
    { stepCode: 'contractor.certificates', title: 'Certificates', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.certificates', stepOrder: 8, isRequired: false, isSkippable: true },
    { stepCode: 'contractor.tax', title: 'Tax Documents', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.tax', stepOrder: 9, isRequired: false, isSkippable: true },
    { stepCode: 'contractor.payout', title: 'Payout Account', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'contractor.payout', stepOrder: 10, isRequired: true, isSkippable: false },
    { stepCode: 'contractor.quotation_templates', title: 'Quotation Templates', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'contractor.quotation_templates', stepOrder: 11, isRequired: false, isSkippable: true },
    { stepCode: 'contractor.cover', title: 'Profile Photo', phase: 4, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.cover', stepOrder: 12, isRequired: false, isSkippable: true },
  ],
  supplier_onboarding: [
    { stepCode: 'supplier.personal_info', title: 'Personal Info', phase: 1, triggerType: 'INTERNAL', fieldGroupCode: 'supplier.personal_info', stepOrder: 1, isRequired: true, isSkippable: false },
    { stepCode: 'supplier.store_identity', title: 'Store Identity', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'supplier.store_identity', stepOrder: 2, isRequired: true, isSkippable: false },
    { stepCode: 'supplier.store_details', title: 'Store Details', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'supplier.store_details', stepOrder: 3, isRequired: false, isSkippable: true },
    { stepCode: 'supplier.business_registration', title: 'Business Registration', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'supplier.business_registration', stepOrder: 4, isRequired: true, isSkippable: false },
    { stepCode: 'supplier.first_product', title: 'First Product', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'supplier.first_product', stepOrder: 5, isRequired: true, isSkippable: false },
    { stepCode: 'supplier.product_details', title: 'Product Details', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'supplier.product_details', stepOrder: 6, isRequired: false, isSkippable: true },
    { stepCode: 'supplier.inventory', title: 'Inventory', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'supplier.inventory', stepOrder: 7, isRequired: false, isSkippable: true },
    { stepCode: 'supplier.pricing_extras', title: 'Pricing Extras', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'supplier.pricing_extras', stepOrder: 8, isRequired: false, isSkippable: true },
    { stepCode: 'supplier.delivery', title: 'Delivery Settings', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'supplier.delivery', stepOrder: 9, isRequired: true, isSkippable: false },
    { stepCode: 'supplier.verification', title: 'Business Permit', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.verification', stepOrder: 10, isRequired: true, isSkippable: false },
    { stepCode: 'supplier.tax', title: 'Tax Documents', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.tax', stepOrder: 11, isRequired: false, isSkippable: true },
    { stepCode: 'supplier.payout', title: 'Payout Account', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'contractor.payout', stepOrder: 12, isRequired: true, isSkippable: false },
    { stepCode: 'supplier.cover', title: 'Store Photo', phase: 4, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.cover', stepOrder: 13, isRequired: false, isSkippable: true },
  ],
  job_seeker_onboarding: [
    { stepCode: 'jobseeker.personal_info', title: 'Personal Info', phase: 1, triggerType: 'INTERNAL', fieldGroupCode: 'jobseeker.personal_info', stepOrder: 1, isRequired: true, isSkippable: false },
    { stepCode: 'jobseeker.skills', title: 'Skills', phase: 2, triggerType: 'ACTION_GATE', fieldGroupCode: 'jobseeker.skills', stepOrder: 2, isRequired: true, isSkippable: false },
    { stepCode: 'jobseeker.profile', title: 'Profile Summary', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'jobseeker.profile', stepOrder: 3, isRequired: true, isSkippable: false },
    { stepCode: 'jobseeker.preferences', title: 'Job Preferences', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'jobseeker.preferences', stepOrder: 4, isRequired: false, isSkippable: true },
    { stepCode: 'jobseeker.tools', title: 'Tools & Equipment', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'jobseeker.tools', stepOrder: 5, isRequired: false, isSkippable: true },
    { stepCode: 'jobseeker.work_history', title: 'Work History', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: 'jobseeker.work_history', stepOrder: 6, isRequired: false, isSkippable: true },
    { stepCode: 'jobseeker.portfolio', title: 'Portfolio', phase: 2, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.portfolio', stepOrder: 7, isRequired: false, isSkippable: true },
    { stepCode: 'jobseeker.verification', title: 'Valid ID', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.verification', stepOrder: 8, isRequired: true, isSkippable: false },
    { stepCode: 'jobseeker.clearances', title: 'NBI/Police Clearance', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.clearances', stepOrder: 9, isRequired: false, isSkippable: true },
    { stepCode: 'jobseeker.recommendations', title: 'Recommendations', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.recommendations', stepOrder: 10, isRequired: false, isSkippable: true },
    { stepCode: 'jobseeker.tesda', title: 'TESDA / Certifications', phase: 3, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.certificates', stepOrder: 11, isRequired: false, isSkippable: true },
    { stepCode: 'jobseeker.cover', title: 'Profile Photo', phase: 4, triggerType: 'PERSISTENT_CARD', fieldGroupCode: '*.cover', stepOrder: 12, isRequired: false, isSkippable: true },
  ],
};

async function main() {
  for (const flow of flows) {
    const created = await prisma.onboardingFlow.upsert({
      where: { code: flow.code },
      update: { name: flow.name },
      create: { code: flow.code, name: flow.name, description: `${flow.name} flow`, targetRole: flow.targetRole },
    });

    for (const step of steps[flow.code]) {
      await prisma.onboardingStep.upsert({
        where: { flowId_stepCode: { flowId: created.id, stepCode: step.stepCode } },
        update: {
          title: step.title,
          phase: step.phase,
          triggerType: step.triggerType,
          fieldGroupCode: step.fieldGroupCode,
          stepOrder: step.stepOrder,
          isRequired: step.isRequired,
          isSkippable: step.isSkippable,
        },
        create: { flowId: created.id, ...step },
      });
    }
  }
  console.log('Seed complete: 4 flows, 42 steps');
}

main().catch(console.error).finally(() => prisma.$disconnect());
