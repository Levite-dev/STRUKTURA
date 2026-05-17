import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import {
  ProfileInput,
  ProfileRepository,
} from '../../domain/repositories/profile.repository';

@Injectable()
export class ProfilePrismaRepository implements ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertProfile(userId: string, input: ProfileInput): Promise<void> {
    switch (input.role) {
      case 'CLIENT':
        await this.prisma.clientProfile.upsert({
          where: { userId },
          create: {
            userId,
            firstName: input.data.firstName ?? null,
            lastName: input.data.lastName ?? null,
            phone: input.data.phone ?? null,
            region: input.data.region ?? null,
            city: input.data.city ?? null,
            province: input.data.province ?? null,
            address: input.data.address ?? null,
            preferredCategories: input.data.preferredCategories ?? [],
            interestedServices: input.data.interestedServices ?? [],
            preferredLocation: input.data.preferredLocation ?? null,
          },
          update: {
            firstName: input.data.firstName ?? null,
            lastName: input.data.lastName ?? null,
            phone: input.data.phone ?? null,
            region: input.data.region ?? null,
            city: input.data.city ?? null,
            province: input.data.province ?? null,
            address: input.data.address ?? null,
            preferredCategories: input.data.preferredCategories ?? [],
            interestedServices: input.data.interestedServices ?? [],
            preferredLocation: input.data.preferredLocation ?? null,
          },
        });
        return;

      case 'CONTRACTOR':
        await this.prisma.contractorProfile.upsert({
          where: { userId },
          create: {
            userId,
            businessName: input.data.businessName ?? null,
            businessDescription: input.data.businessDescription ?? null,
            serviceArea: input.data.serviceArea ?? null,
            serviceCategories: input.data.serviceCategories ?? [],
            trade: input.data.trade ?? '',
            yearsExperience: input.data.yearsExperience,
            bio: input.data.bio ?? null,
            expertiseTags: input.data.expertiseTags ?? [],
            location: input.data.location ?? null,
            portfolioFiles: jsonOrNull(input.data.portfolioFiles),
            verificationDocuments: jsonOrNull(
              input.data.verificationDocuments,
            ),
          },
          update: {
            businessName: input.data.businessName ?? null,
            businessDescription: input.data.businessDescription ?? null,
            serviceArea: input.data.serviceArea ?? null,
            serviceCategories: input.data.serviceCategories ?? [],
            trade: input.data.trade ?? '',
            yearsExperience: input.data.yearsExperience,
            bio: input.data.bio ?? null,
            expertiseTags: input.data.expertiseTags ?? [],
            location: input.data.location ?? null,
            portfolioFiles: jsonOrNull(input.data.portfolioFiles),
            verificationDocuments: jsonOrNull(
              input.data.verificationDocuments,
            ),
          },
        });
        return;

      case 'SUPPLIER':
        await this.prisma.supplierProfile.upsert({
          where: { userId },
          create: {
            userId,
            businessName: input.data.businessName,
            businessAddress: input.data.businessAddress,
            contactPerson: input.data.contactPerson ?? null,
            productCategory: input.data.productCategory ?? null,
            firstProduct: input.data.firstProduct ?? null,
            inventoryStock: input.data.inventoryStock ?? null,
            verificationDocuments: jsonOrNull(
              input.data.verificationDocuments,
            ),
            businessRegNo: input.data.businessRegNo ?? null,
            taxId: input.data.taxId ?? null,
            payoutBankName: input.data.payoutBankName ?? null,
            payoutAcctName: input.data.payoutAcctName ?? null,
            payoutAcctNo: input.data.payoutAcctNo ?? null,
          },
          update: {
            businessName: input.data.businessName,
            businessAddress: input.data.businessAddress,
            contactPerson: input.data.contactPerson ?? null,
            productCategory: input.data.productCategory ?? null,
            firstProduct: input.data.firstProduct ?? null,
            inventoryStock: input.data.inventoryStock ?? null,
            verificationDocuments: jsonOrNull(
              input.data.verificationDocuments,
            ),
            businessRegNo: input.data.businessRegNo ?? null,
            taxId: input.data.taxId ?? null,
            payoutBankName: input.data.payoutBankName ?? null,
            payoutAcctName: input.data.payoutAcctName ?? null,
            payoutAcctNo: input.data.payoutAcctNo ?? null,
          },
        });
        return;

      case 'JOB_SEEKER':
        await this.prisma.jobSeekerProfile.upsert({
          where: { userId },
          create: {
            userId,
            firstName: input.data.firstName ?? null,
            lastName: input.data.lastName ?? null,
            location: input.data.location ?? null,
            primarySkill: input.data.primarySkill ?? null,
            additionalSkills: input.data.additionalSkills ?? [],
            skills: input.data.skills,
            yearsExperience: input.data.yearsExperience,
            preferredLocations: input.data.preferredLocations ?? [],
            portfolioFiles: jsonOrNull(input.data.portfolioFiles),
            verificationDocuments: jsonOrNull(
              input.data.verificationDocuments,
            ),
            availabilityStatus: input.data.availabilityStatus ?? null,
            availableFrom: input.data.availableFrom ?? null,
            resumeUrl: input.data.resumeUrl ?? null,
          },
          update: {
            firstName: input.data.firstName ?? null,
            lastName: input.data.lastName ?? null,
            location: input.data.location ?? null,
            primarySkill: input.data.primarySkill ?? null,
            additionalSkills: input.data.additionalSkills ?? [],
            skills: input.data.skills,
            yearsExperience: input.data.yearsExperience,
            preferredLocations: input.data.preferredLocations ?? [],
            portfolioFiles: jsonOrNull(input.data.portfolioFiles),
            verificationDocuments: jsonOrNull(
              input.data.verificationDocuments,
            ),
            availabilityStatus: input.data.availabilityStatus ?? null,
            availableFrom: input.data.availableFrom ?? null,
            resumeUrl: input.data.resumeUrl ?? null,
          },
        });
        return;
    }
  }
}

function jsonOrNull(value: unknown): Prisma.InputJsonValue | undefined {
  if (value === undefined || value === null) return undefined;
  return value as Prisma.InputJsonValue;
}
