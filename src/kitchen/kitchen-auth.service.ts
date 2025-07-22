import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { KitchenStaff } from './kitchen-staff.schema';
import * as bcrypt from 'bcryptjs';

export class RegisterKitchenDto {
  name: string;
  email: string;
  password: string;
  specialties?: string[];
  shift?: string;
}

@Injectable()
export class KitchenAuthService {
  constructor(
    @InjectModel(KitchenStaff.name) private kitchenStaffModel: Model<KitchenStaff>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterKitchenDto): Promise<{ kitchenStaff: any, access_token: string }> {
    // Check if kitchen staff already exists
    const existingStaff = await this.kitchenStaffModel.findOne({ email: registerDto.email });
    if (existingStaff) {
      throw new ConflictException('Kitchen staff with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create kitchen staff
    const kitchenStaff = new this.kitchenStaffModel({
      ...registerDto,
      password: hashedPassword,
      role: 'kitchen',
    });

    const savedStaff = await kitchenStaff.save();

    // Generate JWT token
    const payload = { 
      sub: (savedStaff._id as any).toString(), 
      email: savedStaff.email, 
      role: 'kitchen',
      type: 'kitchen' // To differentiate from other tokens
    };
    const access_token = this.jwtService.sign(payload);

    // Return kitchen staff without password
    const { password, ...result } = savedStaff.toObject();
    
    return {
      kitchenStaff: result,
      access_token,
    };
  }

  async login(email: string, password: string): Promise<{ kitchenStaff: any, access_token: string }> {
    const kitchenStaff = await this.kitchenStaffModel.findOne({ email });
    if (!kitchenStaff) {
      throw new NotFoundException('Kitchen staff not found');
    }

    const isPasswordValid = await bcrypt.compare(password, kitchenStaff.password);
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials');
    }

    // Update last login
    kitchenStaff.lastLogin = new Date();
    await kitchenStaff.save();

    // Generate JWT token
    const payload = { 
      sub: (kitchenStaff._id as any).toString(), 
      email: kitchenStaff.email, 
      role: 'kitchen',
      type: 'kitchen'
    };
    const access_token = this.jwtService.sign(payload);

    // Return kitchen staff without password
    const { password: _, ...result } = kitchenStaff.toObject();
    
    return {
      kitchenStaff: result,
      access_token,
    };
  }

  async findById(id: string): Promise<KitchenStaff | null> {
    return this.kitchenStaffModel.findById(id).select('-password').exec();
  }

  async findByEmail(email: string): Promise<KitchenStaff | null> {
    return this.kitchenStaffModel.findOne({ email }).exec();
  }

  async validateKitchenStaff(email: string, password: string): Promise<KitchenStaff | null> {
    const kitchenStaff = await this.findByEmail(email);
    if (kitchenStaff && await bcrypt.compare(password, kitchenStaff.password)) {
      return kitchenStaff;
    }
    return null;
  }
}
