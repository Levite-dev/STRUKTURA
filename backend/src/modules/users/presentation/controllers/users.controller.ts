import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../../../shared/presentation/decorators';
import { SupabaseJwtGuard } from '../../../auth/presentation/guards/supabase-jwt.guard';
import { EmailVerifiedGuard } from '../../../auth/presentation/guards/email-verified.guard';
import { GetUserByIdQuery } from '../../application/queries/get-user-by-id/get-user-by-id.query';
import { User } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../http/response-dtos/user.response-dto';
import { AddRoleCommand } from '../../application/commands/add-role/add-role.command';
import { SetPrimaryRoleCommand } from '../../application/commands/set-primary-role/set-primary-role.command';
import { AddRoleRequestDto } from '../http/request-dtos/add-role.request-dto';
import { SetPrimaryRoleRequestDto } from '../http/request-dtos/set-primary-role.request-dto';
import { NotFoundException } from '../../../../shared/domain/exceptions';

@Controller('users')
export class UsersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get('me')
  @UseGuards(SupabaseJwtGuard, EmailVerifiedGuard)
  async me(@CurrentUser() user: AuthenticatedUser): Promise<UserResponseDto> {
    const fullUser = await this.queryBus.execute<GetUserByIdQuery, User | null>(
      new GetUserByIdQuery(user.id),
    );
    if (!fullUser) {
      throw new NotFoundException('Authenticated user not found in database');
    }
    return UserResponseDto.fromDomain(fullUser);
  }

  @Post('me/roles')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(SupabaseJwtGuard, EmailVerifiedGuard)
  async addRole(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: AddRoleRequestDto,
  ): Promise<void> {
    await this.commandBus.execute(new AddRoleCommand(user.id, body.role));
  }

  @Patch('me/primary-role')
  @UseGuards(SupabaseJwtGuard, EmailVerifiedGuard)
  async setPrimaryRole(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: SetPrimaryRoleRequestDto,
  ): Promise<void> {
    await this.commandBus.execute(new SetPrimaryRoleCommand(user.id, body.role));
  }
}
