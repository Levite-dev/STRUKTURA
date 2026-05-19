import { Role } from '@prisma/client';
import { User } from '../entities/user.entity';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findBySupabaseAuthId(supabaseAuthId: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;

  create(input: {
    supabaseAuthId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    emailVerifiedAt?: Date | null;
  }): Promise<User>;

  markEmailVerified(userId: string, verifiedAt: Date): Promise<void>;

  recordLogin(userId: string, ip: string | null, at: Date): Promise<void>;

  assignRole(
    userId: string,
    role: Role,
    assignedBy?: string | null,
  ): Promise<void>;

  revokeRole(userId: string, role: Role): Promise<void>;
}
