import { Controller, Post, Body, ValidationPipe, UsePipes, UnauthorizedException } from '@nestjs/common';
import { KitchenAuthService, RegisterKitchenDto } from './kitchen-auth.service';
import { LoginDto } from '../common/dto/base.dto';

@Controller('kitchen/auth')
export class KitchenAuthController {
  constructor(private readonly kitchenAuthService: KitchenAuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async register(@Body() registerDto: RegisterKitchenDto) {
    return this.kitchenAuthService.register(registerDto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(@Body() loginDto: LoginDto) {
    const result = await this.kitchenAuthService.validateKitchenStaff(loginDto.email, loginDto.password);
    if (!result) {
      throw new UnauthorizedException('Invalid kitchen staff credentials');
    }
    return this.kitchenAuthService.login(loginDto.email, loginDto.password);
  }
}
