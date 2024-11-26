export class CreateUserDto {
    email: string;
    password: string;
    source: 'email' | 'google' | 'microsoft' | 'github';
  }
  