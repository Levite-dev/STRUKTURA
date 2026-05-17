import { Role } from '@prisma/client';
import type { ProfileInput } from '../../domain/repositories/profile.repository';

export function buildProfileInput(
  role: Role,
  data: Record<string, unknown>,
): ProfileInput {
  switch (role) {
    case Role.CLIENT: {
      const profile = objectAt(data, 'profile_setup');
      const address = objectAt(data, 'address_setup');
      const prefs = objectAt(data, 'preferences_setup');
      return {
        role: Role.CLIENT,
        data: {
          firstName: stringOrNull(profile.first_name),
          lastName: stringOrNull(profile.last_name),
          phone: stringOrNull(profile.phone),
          region: stringOrNull(address.province),
          city: stringOrNull(address.city),
          province: stringOrNull(address.province),
          address: stringOrNull(address.address),
          preferredCategories: stringArray(
            prefs.interested_product_categories,
          ),
          interestedServices: stringArray(prefs.interested_services),
          preferredLocation: stringOrNull(prefs.preferred_location),
        },
      };
    }

    case Role.CONTRACTOR: {
      const profile = objectAt(data, 'contractor_profile');
      const service = objectAt(data, 'service_setup');
      return {
        role: Role.CONTRACTOR,
        data: {
          businessName: stringOrNull(profile.business_name),
          businessDescription: stringOrNull(profile.description),
          serviceArea: stringOrNull(service.service_area),
          serviceCategories: stringArray(service.service_categories),
          trade: stringArray(service.service_categories)[0] ?? '',
          yearsExperience: numberOrZero(profile.years_experience),
          bio: stringOrNull(profile.description),
          expertiseTags: stringArray(service.service_categories),
          location: stringOrNull(service.service_area),
          portfolioFiles: objectAt(data, 'portfolio_upload'),
          verificationDocuments: objectAt(data, 'document_upload'),
        },
      };
    }

    case Role.SUPPLIER: {
      const profile = objectAt(data, 'supplier_profile');
      const business = objectAt(data, 'business_information');
      const product = objectAt(data, 'product_setup');
      const inventory = objectAt(data, 'inventory_setup');
      return {
        role: Role.SUPPLIER,
        data: {
          businessName: stringOrNull(profile.business_name) ?? '',
          businessAddress: stringOrNull(profile.business_address) ?? '',
          contactPerson: stringOrNull(profile.contact_person),
          productCategory: stringOrNull(product.product_category),
          firstProduct: stringOrNull(product.first_product),
          inventoryStock: numberOrNull(inventory.inventory_stock),
          verificationDocuments: objectAt(data, 'document_upload'),
          businessRegNo: stringOrNull(
            business.business_registration_number,
          ),
          taxId: stringOrNull(business.tax_identification_number),
        },
      };
    }

    case Role.JOB_SEEKER: {
      const profile = objectAt(data, 'personal_profile');
      const skills = objectAt(data, 'skills_setup');
      const prefs = objectAt(data, 'work_preferences');
      const availability = objectAt(data, 'availability_setup');
      const additionalSkills = stringArray(skills.additional_skills);
      const primarySkill = stringOrNull(skills.primary_skill);
      return {
        role: Role.JOB_SEEKER,
        data: {
          firstName: stringOrNull(profile.first_name),
          lastName: stringOrNull(profile.last_name),
          location: stringOrNull(profile.location),
          primarySkill,
          additionalSkills,
          skills: [primarySkill, ...additionalSkills].filter(
            (value): value is string => Boolean(value),
          ),
          yearsExperience: numberOrZero(skills.years_experience),
          preferredLocations: stringArray(prefs.preferred_location),
          portfolioFiles: objectAt(data, 'portfolio_upload'),
          // Job seeker documents are intentionally optional. Agencies can choose
          // whether to hire based on the profile and portfolio first.
          verificationDocuments: objectAt(data, 'document_upload'),
          availabilityStatus: stringOrNull(
            availability.availability_status,
          ),
          availableFrom: parseDate(prefs.available_start_date),
        },
      };
    }

    default:
      throw new Error(`Unsupported role for onboarding: ${role}`);
  }
}

function objectAt(
  data: Record<string, unknown>,
  key: string,
): Record<string, unknown> {
  const value = data[key];
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function stringOrNull(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function stringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function numberOrZero(value: unknown): number {
  return numberOrNull(value) ?? 0;
}

function numberOrNull(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}
