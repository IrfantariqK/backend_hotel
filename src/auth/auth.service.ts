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
    // 1. Check users collection
    let user = await this.usersService.findByEmail(email);
    if (user && await this.comparePassword(password, user.password)) {
      const { password, ...result } = user.toObject();
      return { ...result, role: 'user', collection: 'users' };
    }
    // 2. Check kitchens collection
    let kitchen = await this.kitchenService.findByEmail(email);
    if (kitchen && await this.comparePassword(password, kitchen.password)) {
      const { password, ...result } = kitchen.toObject();
      return { ...result, role: 'kitchen', collection: 'kitchens' };
    }
    // 3. Check deliveries collection
    let delivery = await this.deliveryService.findByEmail(email);
    if (delivery && await this.comparePassword(password, delivery.password)) {
      const { password, ...result } = delivery.toObject();
      return { ...result, role: 'delivery', collection: 'deliveries' };
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