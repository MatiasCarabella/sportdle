import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsEnum(['email', 'google', 'microsoft', 'github'])
  @IsNotEmpty()
  source: 'email' | 'google' | 'microsoft' | 'github';

  @IsString()
  @IsOptional()
  googleId?: string;
}
  