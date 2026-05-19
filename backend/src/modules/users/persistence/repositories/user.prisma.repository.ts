import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';

import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { User } from '../../domain/entities/user.entity';
import { UserRepository } from '../../domain/repositories/user.repository';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserPrismaRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { id },
      include: { userRoles: true },
    });
    return record ? UserMapper.toDomain(record) : null;
  }

  async findBySupabaseAuthId(supabaseAuthId: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { supabaseAuthId },
      include: { userRoles: true },
    });
    return record ? UserMapper.toDomain(record) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const record = await this.prisma.user.findUnique({
      where: { email },
      include: { userRoles: true },
    });
    return record ? UserMapper.toDomain(record) : null;
  }

  async create(input: {
    supabaseAuthId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    emailVerifiedAt?: Date | null;
  }): Promise<User> {
    const record = await this.prisma.user.create({
      data: {
        supabaseAuthId: input.supabaseAuthId,
        email: input.email,
        firstName: input.firstName ?? null,
        lastName: input.lastName ?? null,
        phone: input.phone ?? null,
        emailVerifiedAt: input.emailVerifiedAt ?? null,
        primaryRole: null,
      },
      include: { userRoles: true },
    });
    return UserMapper.toDomain(record);
  }

  async markEmailVerified(userId: string, verifiedAt: Date): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: verifiedAt },
    });
  }

  async recordLogin(
    userId: string,
    ip: string | null,
    at: Date,
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: at, lastLoginIp: ip },
    });
  }

  async assignRole(
    userId: string,
    role: Role,
    assignedBy?: string | null,
  ): Promise<void> {
    await this.prisma.userRole.upsert({
      where: { userId_role: { userId, role } },
      create: { userId, role, assignedBy: assignedBy ?? null },
      update: {},
    });
  }

  async revokeRole(userId: string, role: Role): Promise<void> {
    await this.prisma.userRole.deleteMany({
      where: { userId, role },
    });
  }
}
