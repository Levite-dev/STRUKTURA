import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  IsUrl,
} from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  redirectTo?: string;
}

export class ConfirmPasswordResetDto {
  @IsString()
  @MinLength(1)
  accessToken!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword!: string;
}
