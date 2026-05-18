import { Role, UserStatus } from '@prisma/client';

export interface UserProps {
  id: string;
  supabaseAuthId: string;
  email: string;
  emailVerifiedAt: Date | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  status: UserStatus;
  primaryRole: Role | null;
  lastLoginAt: Date | null;
  lastLoginIp: string | null;
  roles: Role[];
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private props: UserProps) {}

  static create(props: UserProps): User {
    return new User(props);
  }

  get id(): string {
    return this.props.id;
  }

  get supabaseAuthId(): string {
    return this.props.supabaseAuthId;
  }

  get email(): string {
    return this.props.email;
  }

  get emailVerifiedAt(): Date | null {
    return this.props.emailVerifiedAt;
  }

  get firstName(): string | null {
    return this.props.firstName;
  }

  get lastName(): string | null {
    return this.props.lastName;
  }

  get phone(): string | null {
    return this.props.phone;
  }

  get avatarUrl(): string | null {
    return this.props.avatarUrl;
  }

  get status(): UserStatus {
    return this.props.status;
  }

  get primaryRole(): Role | null {
    return this.props.primaryRole;
  }

  get roles(): Role[] {
    return [...this.props.roles];
  }

  get lastLoginAt(): Date | null {
    return this.props.lastLoginAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  isEmailVerified(): boolean {
    return this.props.emailVerifiedAt !== null;
  }

  isActive(): boolean {
    return this.props.status === UserStatus.ACTIVE;
  }

  hasRole(role: Role): boolean {
    return this.props.roles.includes(role);
  }

  hasAnyRole(roles: Role[]): boolean {
    return roles.some((r) => this.props.roles.includes(r));
  }

  toPrimitives(): UserProps {
    return { ...this.props, roles: [...this.props.roles] };
  }
}
