import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.userService.create({
      email: registerDto.email,
      password: registerDto.password,
      source: 'email',
    });

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    
    if (!user || user.source !== 'email') {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await user.comparePassword(loginDto.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user);
  }

  async googleLogin(googleUser: any) {
    let user = await this.userService.findByGoogleId(googleUser.googleId);

    if (!user) {
      user = await this.userService.findByEmail(googleUser.email);
      
      if (user) {
        throw new ConflictException('Email already registered with different method');
      }

      user = await this.userService.create({
        email: googleUser.email,
        googleId: googleUser.googleId,
        source: 'google',
      });
    }

    return this.generateTokens(user);
  }

  private generateTokens(user: any) {
    const payload = { email: user.email, sub: user._id.toString() };
    
    const accessToken = this.jwtService.sign(payload);
    
    // For refresh token, we need to create a separate JWT service instance or use signAsync
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET');
    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshSecret,
      expiresIn: '7d', // Use string literal instead of config value
    });
    
    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id,
        email: user.email,
        source: user.source,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userService.findOneWithPassword(userId);

    // Verify current password
    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Check if user registered with email (not OAuth)
    if (user.source !== 'email') {
      throw new UnauthorizedException(
        'Cannot change password for OAuth accounts',
      );
    }

    // Update password (will be hashed by schema pre-save hook)
    user.password = newPassword;
    await user.save();

    return {
      message: 'Password changed successfully',
    };
  }
}
