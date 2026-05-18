import { User as PrismaUser, UserRole as PrismaUserRole } from '@prisma/client';
import { User } from '../../domain/entities/user.entity';

type PrismaUserWithRoles = PrismaUser & { userRoles: PrismaUserRole[] };

export class UserMapper {
  static toDomain(record: PrismaUserWithRoles): User {
    return User.create({
      id: record.id,
      supabaseAuthId: record.supabaseAuthId,
      email: record.email,
      emailVerifiedAt: record.emailVerifiedAt,
      firstName: record.firstName,
      lastName: record.lastName,
      phone: record.phone,
      avatarUrl: record.avatarUrl,
      status: record.status,
      primaryRole: record.primaryRole,
      lastLoginAt: record.lastLoginAt,
      lastLoginIp: record.lastLoginIp,
      roles: record.userRoles.map((r) => r.role),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  }
}
