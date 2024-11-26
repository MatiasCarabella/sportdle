export class UpdateUserDto {
    email?: string;
    password?: string;
    source?: 'email' | 'google' | 'microsoft' | 'github';
  }
  