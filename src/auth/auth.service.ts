import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { KitchenService } from '../kitchen/kitchen.service';
import { DeliveryService } from '../delivery/delivery.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private kitchenService: KitchenService,
    private deliveryService: DeliveryService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string) {
    // Check unified users collection (user/kitchen/delivery)
    const user = await this.usersService.findByEmail(email);
    if (user && await this.comparePassword(password, user.password)) {
      const { password, ...result } = user.toObject();
      return { ...result, type: 'user' };
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user._id, role: user.role, email: user.email, collection: user.collection };
    return {
      access_token: this.jwtService.sign(payload),
      user,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
} 