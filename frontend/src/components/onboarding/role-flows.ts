import { z } from 'zod'

export type RoleFlowStep = {
  stepCode: string
  title: string
  phase: 1 | 2 | 3 | 4
  fieldGroupCode: string
  isRequired: boolean
  isSkippable: boolean
}

export const CLIENT_STEPS: RoleFlowStep[] = [
  { stepCode: 'client.personal_info', title: 'Personal Info', phase: 1, fieldGroupCode: 'client.personal_info', isRequired: true, isSkippable: false },
  { stepCode: 'client.address', title: 'Delivery Address', phase: 2, fieldGroupCode: 'client.address', isRequired: true, isSkippable: false },
  { stepCode: 'client.preferences', title: 'Preferences', phase: 2, fieldGroupCode: 'client.preferences', isRequired: false, isSkippable: true },
  { stepCode: 'client.cover', title: 'Profile Photo', phase: 3, fieldGroupCode: '*.cover', isRequired: false, isSkippable: true },
]

export const CONTRACTOR_STEPS: RoleFlowStep[] = [
  { stepCode: 'contractor.personal_info', title: 'Personal Info', phase: 1, fieldGroupCode: 'contractor.personal_info', isRequired: true, isSkippable: false },
  { stepCode: 'contractor.business_basics', title: 'Business Basics', phase: 2, fieldGroupCode: 'contractor.business_basics', isRequired: true, isSkippable: false },
  { stepCode: 'contractor.first_service', title: 'First Service', phase: 2, fieldGroupCode: 'contractor.first_service', isRequired: true, isSkippable: false },
  { stepCode: 'contractor.service_details', title: 'Service Details', phase: 2, fieldGroupCode: 'contractor.service_details', isRequired: false, isSkippable: true },
  { stepCode: 'contractor.portfolio', title: 'Portfolio', phase: 2, fieldGroupCode: '*.portfolio', isRequired: false, isSkippable: true },
  { stepCode: 'contractor.verification', title: 'Valid ID', phase: 3, fieldGroupCode: '*.verification', isRequired: true, isSkippable: false },
  { stepCode: 'contractor.payout', title: 'Payout Account', phase: 3, fieldGroupCode: 'contractor.payout', isRequired: true, isSkippable: false },
  { stepCode: 'contractor.quotation_templates', title: 'Quotation Templates', phase: 3, fieldGroupCode: 'contractor.quotation_templates', isRequired: false, isSkippable: true },
  { stepCode: 'contractor.cover', title: 'Profile Photo', phase: 4, fieldGroupCode: '*.cover', isRequired: false, isSkippable: true },
]

export const SUPPLIER_STEPS: RoleFlowStep[] = [
  { stepCode: 'supplier.personal_info', title: 'Personal Info', phase: 1, fieldGroupCode: 'supplier.personal_info', isRequired: true, isSkippable: false },
  { stepCode: 'supplier.store_identity', title: 'Store Identity', phase: 2, fieldGroupCode: 'supplier.store_identity', isRequired: true, isSkippable: false },
  { stepCode: 'supplier.business_registration', title: 'Business Registration', phase: 2, fieldGroupCode: 'supplier.business_registration', isRequired: true, isSkippable: false },
  { stepCode: 'supplier.first_product', title: 'First Product', phase: 2, fieldGroupCode: 'supplier.first_product', isRequired: true, isSkippable: false },
  { stepCode: 'supplier.delivery', title: 'Delivery Settings', phase: 3, fieldGroupCode: 'supplier.delivery', isRequired: true, isSkippable: false },
  { stepCode: 'supplier.verification', title: 'Business Permit', phase: 3, fieldGroupCode: '*.verification', isRequired: true, isSkippable: false },
  { stepCode: 'supplier.payout', title: 'Payout Account', phase: 3, fieldGroupCode: 'supplier.payout', isRequired: true, isSkippable: false },
  { stepCode: 'supplier.cover', title: 'Store Photo', phase: 4, fieldGroupCode: '*.cover', isRequired: false, isSkippable: true },
]

export const JOB_SEEKER_STEPS: RoleFlowStep[] = [
  { stepCode: 'jobseeker.personal_info', title: 'Personal Info', phase: 1, fieldGroupCode: 'jobseeker.personal_info', isRequired: true, isSkippable: false },
  { stepCode: 'jobseeker.skills', title: 'Skills', phase: 2, fieldGroupCode: 'jobseeker.skills', isRequired: true, isSkippable: false },
  { stepCode: 'jobseeker.profile', title: 'Profile Summary', phase: 2, fieldGroupCode: 'jobseeker.profile', isRequired: true, isSkippable: false },
  { stepCode: 'jobseeker.preferences', title: 'Job Preferences', phase: 2, fieldGroupCode: 'jobseeker.preferences', isRequired: false, isSkippable: true },
  { stepCode: 'jobseeker.work_history', title: 'Work History', phase: 2, fieldGroupCode: 'jobseeker.work_history', isRequired: false, isSkippable: true },
  { stepCode: 'jobseeker.verification', title: 'Valid ID', phase: 3, fieldGroupCode: '*.verification', isRequired: true, isSkippable: false },
  { stepCode: 'jobseeker.cover', title: 'Profile Photo', phase: 4, fieldGroupCode: '*.cover', isRequired: false, isSkippable: true },
]

export const ROLE_STEPS: Record<string, RoleFlowStep[]> = {
  CLIENT: CLIENT_STEPS,
  CONTRACTOR: CONTRACTOR_STEPS,
  SUPPLIER: SUPPLIER_STEPS,
  JOB_SEEKER: JOB_SEEKER_STEPS,
}

// ─── Zod schemas ──────────────────────────────────────────────────────────────

export const addressSchema = z.object({
  line1: z.string().min(1, 'Required'),
  line2: z.string().optional(),
  barangay: z.string().optional(),
  city: z.string().min(1, 'Required'),
  province: z.string().min(1, 'Required'),
  postalCode: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  isDefault: z.boolean().default(true),
})

export const personalInfoSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  phone: z.string().optional(),
})

export const businessBasicsSchema = z.object({
  businessName: z.string().min(1, 'Required'),
  businessDescription: z.string().optional(),
})

export const serviceSchema = z.object({
  name: z.string().min(1, 'Required'),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  pricingType: z.enum(['FIXED', 'HOURLY', 'DAILY', 'PER_SQM', 'PER_PROJECT', 'QUOTE_BASED']),
  basePriceMin: z.number().optional(),
  basePriceMax: z.number().optional(),
  description: z.string().optional(),
})

export const documentSchema = z.object({
  type: z.enum(['VALID_ID', 'BUSINESS_PERMIT', 'TESDA', 'NBI', 'POLICE', 'LICENSE', 'CERTIFICATE', 'TAX_DOC', 'RECOMMENDATION', 'OTHER']),
  ownerType: z.enum(['CONTRACTOR_PROFILE', 'SUPPLIER_PROFILE', 'JOB_SEEKER_PROFILE', 'USER']),
  url: z.string().url('Must be a valid URL'),
  fileName: z.string().optional(),
})

export const payoutSchema = z.object({
  method: z.enum(['BANK', 'GCASH', 'MAYA']),
  bankName: z.string().optional(),
  accountName: z.string().optional(),
  accountNumber: z.string().optional(),
  gcashNumber: z.string().optional(),
  mayaNumber: z.string().optional(),
})

export const coverSchema = z.object({ avatarUrl: z.string().url('Must be a valid URL') })

export const preferencesSchema = z.object({
  preferredCategories: z.array(z.string()).optional(),
  preferredLocation: z.string().optional(),
})

export const skillsSchema = z.object({
  skillCategory: z.string().min(1, 'Required'),
  skills: z.array(z.string()).min(1, 'Add at least one skill'),
  bio: z.string().optional(),
})

export const productSchema = z.object({
  name: z.string().min(1, 'Required'),
  unit: z.string().min(1, 'Required'),
  price: z.number().positive('Must be positive'),
  availableStock: z.number().int().min(0),
  description: z.string().optional(),
})

export const deliverySchema = z.object({
  deliveryAreas: z.array(z.string()).min(1, 'Add at least one area'),
  deliveryAvailable: z.boolean().default(false),
  pickupAvailable: z.boolean().default(false),
  deliveryFee: z.number().optional(),
  estimatedDays: z.number().int().optional(),
})

export const storeIdentitySchema = z.object({
  businessName: z.string().min(1, 'Required'),
  storeName: z.string().optional(),
  businessDescription: z.string().optional(),
  contactPerson: z.string().optional(),
  contactNumber: z.string().optional(),
})
