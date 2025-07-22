import { Controller, Post, Body, Get, Param, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthService } from '../auth/auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

class RegisterDto {
  name: string;
  email: string;
  password: string;
}

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const hashedPassword = await this.authService.hashPassword(dto.password);
    return this.usersService.createUser({
      ...dto,
      password: hashedPassword,
      role: 'user', // Role is hardcoded to 'user'
    });
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user')
  @Get('profile')
  getUserProfile(@Request() req) {
    return req.user;
  }

  @Get(':id')
  async getUser(@Param('id') id: string) {
    return this.usersService.findById(id);
  }
} 