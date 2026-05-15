import { Controller, Get } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';

import {
  CurrentUser,
  type AuthenticatedUser,
} from '../../../../shared/presentation/decorators';
import { GetUserByIdQuery } from '../../application/queries/get-user-by-id/get-user-by-id.query';
import { User } from '../../domain/entities/user.entity';
import { UserResponseDto } from '../http/response-dtos/user.response-dto';
import { NotFoundException } from '../../../../shared/domain/exceptions';

@Controller('users')
export class UsersController {
  constructor(private readonly queryBus: QueryBus) {}

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
}
