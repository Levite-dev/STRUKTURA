import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';

import { GetUserBySupabaseIdQuery } from './get-user-by-supabase-id.query';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../../../domain/repositories/user.repository';
import { User } from '../../../domain/entities/user.entity';

@QueryHandler(GetUserBySupabaseIdQuery)
export class GetUserBySupabaseIdHandler implements IQueryHandler<
  GetUserBySupabaseIdQuery,
  User | null
> {
  constructor(
    @Inject(USER_REPOSITORY) private readonly users: UserRepository,
  ) {}

  execute(query: GetUserBySupabaseIdQuery): Promise<User | null> {
    return this.users.findBySupabaseAuthId(query.supabaseAuthId);
  }
}
