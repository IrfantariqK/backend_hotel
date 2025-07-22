import { Controller, Post, Body, ValidationPipe, UsePipes, UnauthorizedException } from '@nestjs/common';
import { DeliveryAuthService, RegisterDeliveryDto } from './delivery-auth.service';
import { LoginDto } from '../common/dto/base.dto';

@Controller('delivery/auth')
export class DeliveryAuthController {
  constructor(private readonly deliveryAuthService: DeliveryAuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async register(@Body() registerDto: RegisterDeliveryDto) {
    return this.deliveryAuthService.register(registerDto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(@Body() loginDto: LoginDto) {
    const result = await this.deliveryAuthService.validateDeliveryStaff(loginDto.email, loginDto.password);
    if (!result) {
      throw new UnauthorizedException('Invalid delivery staff credentials');
    }
    return this.deliveryAuthService.login(loginDto.email, loginDto.password);
  }
}
