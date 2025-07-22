import { Controller, Post, Body, Request, UseGuards, Get } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { KitchenService } from './kitchen.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

class RegisterDto {
  name: string;
  email: string;
  password: string;
}

@Controller('kitchen')
export class KitchenController {
  constructor(
    private readonly authService: AuthService,
    private readonly kitchenService: KitchenService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const hashedPassword = await this.authService.hashPassword(dto.password);
    return this.kitchenService.create({
      ...dto,
      password: hashedPassword,
    });
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('kitchen')
  @Get('profile')
  getKitchenProfile(@Request() req) {
    return req.user;
  }
} 