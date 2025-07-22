import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { DeliveryStaff } from './delivery-staff.schema';
import * as bcrypt from 'bcryptjs';

export class RegisterDeliveryDto {
  name: string;
  email: string;
  password: string;
  vehicleType?: string;
  licenseNumber?: string;
  phoneNumber?: string;
}

@Injectable()
export class DeliveryAuthService {
  constructor(
    @InjectModel(DeliveryStaff.name) private deliveryStaffModel: Model<DeliveryStaff>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDeliveryDto): Promise<{ deliveryStaff: any, access_token: string }> {
    // Check if delivery staff already exists
    const existingStaff = await this.deliveryStaffModel.findOne({ email: registerDto.email });
    if (existingStaff) {
      throw new ConflictException('Delivery staff with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create delivery staff
    const deliveryStaff = new this.deliveryStaffModel({
      ...registerDto,
      password: hashedPassword,
      role: 'delivery',
    });

    const savedStaff = await deliveryStaff.save();

    // Generate JWT token
    const payload = { 
      sub: (savedStaff._id as any).toString(), 
      email: savedStaff.email, 
      role: 'delivery',
      type: 'delivery' // To differentiate from other tokens
    };
    const access_token = this.jwtService.sign(payload);

    // Return delivery staff without password
    const { password, ...result } = savedStaff.toObject();
    
    return {
      deliveryStaff: result,
      access_token,
    };
  }

  async login(email: string, password: string): Promise<{ deliveryStaff: any, access_token: string }> {
    const deliveryStaff = await this.deliveryStaffModel.findOne({ email });
    if (!deliveryStaff) {
      throw new NotFoundException('Delivery staff not found');
    }

    const isPasswordValid = await bcrypt.compare(password, deliveryStaff.password);
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials');
    }

    // Update last login
    deliveryStaff.lastLogin = new Date();
    await deliveryStaff.save();

    // Generate JWT token
    const payload = { 
      sub: (deliveryStaff._id as any).toString(), 
      email: deliveryStaff.email, 
      role: 'delivery',
      type: 'delivery'
    };
    const access_token = this.jwtService.sign(payload);

    // Return delivery staff without password
    const { password: _, ...result } = deliveryStaff.toObject();
    
    return {
      deliveryStaff: result,
      access_token,
    };
  }

  async findById(id: string): Promise<DeliveryStaff | null> {
    return this.deliveryStaffModel.findById(id).select('-password').exec();
  }

  async findByEmail(email: string): Promise<DeliveryStaff | null> {
    return this.deliveryStaffModel.findOne({ email }).exec();
  }

  async validateDeliveryStaff(email: string, password: string): Promise<DeliveryStaff | null> {
    const deliveryStaff = await this.findByEmail(email);
    if (deliveryStaff && await bcrypt.compare(password, deliveryStaff.password)) {
      return deliveryStaff;
    }
    return null;
  }
}
