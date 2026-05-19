import { Injectable } from '@nestjs/common';

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
      case 'CLIENT': {
        await this.syncUserName(
          userId,
          input.data.firstName ?? undefined,
          input.data.lastName ?? undefined,
          input.data.phone ?? undefined,
        );
        await this.prisma.clientProfile.upsert({
          where: { userId },
          create: {
            userId,
            preferredCategories: input.data.preferredCategories ?? [],
            interestedServices: input.data.interestedServices ?? [],
            preferredLocation: input.data.preferredLocation ?? null,
          },
          update: {
            preferredCategories: input.data.preferredCategories ?? [],
            interestedServices: input.data.interestedServices ?? [],
            preferredLocation: input.data.preferredLocation ?? null,
          },
        });
        return;
      }

      case 'CONTRACTOR': {
        await this.prisma.contractorProfile.upsert({
          where: { userId },
          create: {
            userId,
            businessName: input.data.businessName ?? null,
            businessDescription: input.data.businessDescription ?? null,
            yearsExperience: input.data.yearsExperience,
            bio: input.data.bio ?? null,
            expertiseTags: input.data.expertiseTags ?? [],
          },
          update: {
            businessName: input.data.businessName ?? null,
            businessDescription: input.data.businessDescription ?? null,
            yearsExperience: input.data.yearsExperience,
            bio: input.data.bio ?? null,
            expertiseTags: input.data.expertiseTags ?? [],
          },
        });
        return;
      }

      case 'SUPPLIER': {
        await this.prisma.supplierProfile.upsert({
          where: { userId },
          create: {
            userId,
            businessName: input.data.businessName,
            businessAddress: input.data.businessAddress,
            contactPerson: input.data.contactPerson ?? null,
            businessRegNo: input.data.businessRegNo ?? null,
            taxId: input.data.taxId ?? null,
          },
          update: {
            businessName: input.data.businessName,
            businessAddress: input.data.businessAddress,
            contactPerson: input.data.contactPerson ?? null,
            businessRegNo: input.data.businessRegNo ?? null,
            taxId: input.data.taxId ?? null,
          },
        });
        return;
      }

      case 'JOB_SEEKER': {
        await this.syncUserName(
          userId,
          input.data.firstName ?? undefined,
          input.data.lastName ?? undefined,
        );
        await this.prisma.jobSeekerProfile.upsert({
          where: { userId },
          create: {
            userId,
            primarySkill: input.data.primarySkill ?? null,
            additionalSkills: input.data.additionalSkills ?? [],
            skills: input.data.skills,
            yearsExperience: input.data.yearsExperience,
            preferredLocations: input.data.preferredLocations ?? [],
            availabilityStatus: input.data.availabilityStatus ?? null,
            availableFrom: input.data.availableFrom ?? null,
            resumeUrl: input.data.resumeUrl ?? null,
          },
          update: {
            primarySkill: input.data.primarySkill ?? null,
            additionalSkills: input.data.additionalSkills ?? [],
            skills: input.data.skills,
            yearsExperience: input.data.yearsExperience,
            preferredLocations: input.data.preferredLocations ?? [],
            availabilityStatus: input.data.availabilityStatus ?? null,
            availableFrom: input.data.availableFrom ?? null,
            resumeUrl: input.data.resumeUrl ?? null,
          },
        });
        return;
      }
    }
  }

  private async syncUserName(
    userId: string,
    firstName?: string | null,
    lastName?: string | null,
    phone?: string | null,
  ): Promise<void> {
    const data: {
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
    } = {};
    if (firstName !== undefined) data.firstName = firstName;
    if (lastName !== undefined) data.lastName = lastName;
    if (phone !== undefined) data.phone = phone;
    if (Object.keys(data).length === 0) return;
    await this.prisma.user.update({ where: { id: userId }, data });
  }
}
