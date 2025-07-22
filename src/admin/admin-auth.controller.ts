import { Controller, Post, Body, ValidationPipe, UsePipes, UnauthorizedException } from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { RegisterAdminDto, LoginDto } from '../common/dto/base.dto';

@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('register')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async register(@Body() registerDto: RegisterAdminDto) {
    return this.adminAuthService.register(registerDto);
  }

  @Post('login')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async login(@Body() loginDto: LoginDto) {
    const result = await this.adminAuthService.validateAdmin(loginDto.email, loginDto.password);
    if (!result) {
      throw new UnauthorizedException('Invalid admin credentials');
    }
    return this.adminAuthService.login(loginDto.email, loginDto.password);
  }
}
