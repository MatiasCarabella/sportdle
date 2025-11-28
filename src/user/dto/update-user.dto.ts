import { IsEmail, IsEnum, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEnum(['email', 'google', 'microsoft', 'github'])
  @IsOptional()
  source?: 'email' | 'google' | 'microsoft' | 'github';

  @IsEnum(['user', 'admin'])
  @IsOptional()
  role?: 'user' | 'admin';
}
