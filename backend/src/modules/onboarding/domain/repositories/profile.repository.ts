export const PROFILE_REPOSITORY = Symbol('PROFILE_REPOSITORY');

export interface ClientProfileInput {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  region?: string | null;
  city?: string | null;
  province?: string | null;
  address?: string | null;
  preferredCategories?: string[];
  interestedServices?: string[];
  preferredLocation?: string | null;
}

export interface ContractorProfileInput {
  businessName?: string | null;
  businessDescription?: string | null;
  serviceArea?: string | null;
  serviceCategories?: string[];
  trade?: string;
  yearsExperience: number;
  bio?: string | null;
  expertiseTags?: string[];
  location?: string | null;
  portfolioFiles?: unknown;
  verificationDocuments?: unknown;
}

export interface SupplierProfileInput {
  businessName: string;
  businessAddress: string;
  contactPerson?: string | null;
  productCategory?: string | null;
  firstProduct?: string | null;
  inventoryStock?: number | null;
  verificationDocuments?: unknown;
  businessRegNo?: string | null;
  taxId?: string | null;
  payoutBankName?: string | null;
  payoutAcctName?: string | null;
  payoutAcctNo?: string | null;
}

export interface JobSeekerProfileInput {
  firstName?: string | null;
  lastName?: string | null;
  location?: string | null;
  primarySkill?: string | null;
  additionalSkills?: string[];
  skills: string[];
  yearsExperience: number;
  preferredLocations?: string[];
  portfolioFiles?: unknown;
  verificationDocuments?: unknown;
  availabilityStatus?: string | null;
  availableFrom?: Date | null;
  resumeUrl?: string | null;
}

export type ProfileInput =
  | { role: 'CLIENT'; data: ClientProfileInput }
  | { role: 'CONTRACTOR'; data: ContractorProfileInput }
  | { role: 'SUPPLIER'; data: SupplierProfileInput }
  | { role: 'JOB_SEEKER'; data: JobSeekerProfileInput };

export interface ProfileRepository {
  upsertProfile(userId: string, input: ProfileInput): Promise<void>;
}
