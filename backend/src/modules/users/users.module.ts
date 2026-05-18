import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { UsersController } from './presentation/controllers/users.controller';
import { UserPrismaRepository } from './persistence/repositories/user.prisma.repository';
import { USER_REPOSITORY } from './domain/repositories/user.repository';

import { SyncSupabaseUserHandler } from './application/commands/sync-supabase-user/sync-supabase-user.handler';
import { AssignRoleHandler } from './application/commands/assign-role/assign-role.handler';
import { AddRoleHandler } from './application/commands/add-role/add-role.handler';
import { RecordLoginHandler } from './application/commands/record-login/record-login.handler';
import { MarkEmailVerifiedHandler } from './application/commands/mark-email-verified/mark-email-verified.handler';
import { SetPrimaryRoleHandler } from './application/commands/set-primary-role/set-primary-role.handler';
import { GetUserByIdHandler } from './application/queries/get-user-by-id/get-user-by-id.handler';
import { GetUserBySupabaseIdHandler } from './application/queries/get-user-by-supabase-id/get-user-by-supabase-id.handler';

const CommandHandlers = [
  SyncSupabaseUserHandler,
  AssignRoleHandler,
  AddRoleHandler,
  RecordLoginHandler,
  MarkEmailVerifiedHandler,
  SetPrimaryRoleHandler,
];

const QueryHandlers = [GetUserByIdHandler, GetUserBySupabaseIdHandler];

@Module({
  imports: [CqrsModule],
  controllers: [UsersController],
  providers: [
    UserPrismaRepository,
    { provide: USER_REPOSITORY, useExisting: UserPrismaRepository },
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [USER_REPOSITORY],
})
export class UsersModule {}
