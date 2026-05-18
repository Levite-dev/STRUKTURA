import { Role, UserStatus } from '@prisma/client';
import { User } from '../../../domain/entities/user.entity';

export class UserResponseDto {
  id!: string;
  email!: string;
  emailVerified!: boolean;
  firstName!: string | null;
  lastName!: string | null;
  phone!: string | null;
  avatarUrl!: string | null;
  status!: UserStatus;
  primaryRole!: Role | null;
  roles!: Role[];
  createdAt!: string;

  static fromDomain(user: User): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.emailVerified = user.isEmailVerified();
    dto.firstName = user.firstName;
    dto.lastName = user.lastName;
    dto.phone = user.phone;
    dto.avatarUrl = user.avatarUrl;
    dto.status = user.status;
    dto.primaryRole = user.primaryRole;
    dto.roles = user.roles;
    dto.createdAt = user.createdAt.toISOString();
    return dto;
  }
}
