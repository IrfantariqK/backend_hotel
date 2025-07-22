import { Controller, Post, Body, UnauthorizedException, ValidationPipe, UsePipes, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../common/dto/base.dto';
import { RegisterUserDto } from './user-register.dto';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async register(@Body() dto: RegisterUserDto) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    
    // Create user
    const user = await this.usersService.create({
      ...dto,
      password: hashedPassword,
      role: 'user',
    });

    // Return JWT token
    const { password, ...result } = user;
    return this.authService.login(result);
  }
}
