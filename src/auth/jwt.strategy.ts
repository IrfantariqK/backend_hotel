import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { AdminAuthService } from '../admin/admin-auth.service';
import { KitchenAuthService } from '../kitchen/kitchen-auth.service';
import { DeliveryAuthService } from '../delivery/delivery-auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
    private adminAuthService: AdminAuthService,
    private kitchenAuthService: KitchenAuthService,
    private deliveryAuthService: DeliveryAuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', { infer: true })!,
    });
  }

  async validate(payload: any) {
    if (payload.type === 'admin') {
      // Handle admin authentication
      const admin = await this.adminAuthService.findById(payload.sub);
      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        type: 'admin',
        user: admin,
      };
    } else if (payload.type === 'kitchen') {
      // Handle kitchen staff authentication
      const kitchenStaff = await this.kitchenAuthService.findById(payload.sub);
      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        type: 'kitchen',
        user: kitchenStaff,
      };
    } else if (payload.type === 'delivery') {
      // Handle delivery staff authentication
      const deliveryStaff = await this.deliveryAuthService.findById(payload.sub);
      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        type: 'delivery',
        user: deliveryStaff,
      };
    } else {
      // Handle regular user authentication
      const user = await this.usersService.findById(payload.sub);
      return {
        userId: payload.sub,
        email: payload.email,
        role: payload.role,
        type: 'user',
        user,
      };
    }
  }
}
