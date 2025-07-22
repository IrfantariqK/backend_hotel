import { Controller, Post, Body, Request, UseGuards, Get } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { DeliveryService } from './delivery.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

class RegisterDto {
  name: string;
  email: string;
  password: string;
}

@Controller('delivery')
export class DeliveryController {
  constructor(
    private readonly authService: AuthService,
    private readonly deliveryService: DeliveryService,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const hashedPassword = await this.authService.hashPassword(dto.password);
    return this.deliveryService.create({
      ...dto,
      password: hashedPassword,
    });
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('delivery')
  @Get('profile')
  getDeliveryProfile(@Request() req) {
    return req.user;
  }
} 