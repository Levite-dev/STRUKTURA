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
import { Role } from '@prisma/client';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../../../shared/presentation/decorators';
import { SupabaseJwtGuard } from '../../../auth/presentation/guards/supabase-jwt.guard';
import { EmailVerifiedGuard } from '../../../auth/presentation/guards/email-verified.guard';
import { PrismaService } from '../../../../shared/infrastructure/prisma/prisma.service';
import { GetUserByIdQuery } from '../../application/queries/get-user-by-id/get-user-by-id.query';
import { User } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../http/response-dtos/user.response-dto';
import { AddRoleCommand } from '../../application/commands/add-role/add-role.command';
import { NotFoundException } from '../../../../shared/domain/exceptions';

@Controller('users')
export class UsersController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly prisma: PrismaService,
  ) {}

  @Get('me')
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
    @Body() body: { role: Role },
  ): Promise<void> {
    await this.commandBus.execute(new AddRoleCommand(user.id, body.role));
  }

  @Patch('me/primary-role')
  @UseGuards(SupabaseJwtGuard, EmailVerifiedGuard)
  async setPrimaryRole(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: { role: Role },
  ): Promise<void> {
    await this.prisma.user.update({
      where: { id: user.id },
      data: { primaryRole: body.role },
    });
  }
}
