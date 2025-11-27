import { IsEmail, IsEnum, IsString, MinLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsEnum(['email', 'google', 'microsoft', 'github'])
  @IsOptional()
  source?: 'email' | 'google' | 'microsoft' | 'github';
}
  