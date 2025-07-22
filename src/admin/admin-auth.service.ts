import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Admin } from './admin.schema';
import * as bcrypt from 'bcryptjs';
import { RegisterAdminDto } from '../common/dto/base.dto';

@Injectable()
export class AdminAuthService {
  constructor(
    @InjectModel(Admin.name) private adminModel: Model<Admin>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterAdminDto): Promise<{ admin: any, access_token: string }> {
    // Check if admin already exists
    const existingAdmin = await this.adminModel.findOne({ email: registerDto.email });
    if (existingAdmin) {
      throw new ConflictException('Admin with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Create admin
    const admin = new this.adminModel({
      ...registerDto,
      password: hashedPassword,
      role: 'admin',
      permissions: registerDto.permissions || ['read', 'write', 'delete'],
    });

    const savedAdmin = await admin.save();

    // Generate JWT token
    const payload = { 
      sub: (savedAdmin._id as any).toString(), 
      email: savedAdmin.email, 
      role: 'admin',
      type: 'admin' // To differentiate from user tokens
    };
    const access_token = this.jwtService.sign(payload);

    // Return admin without password
    const { password, ...result } = savedAdmin.toObject();
    
    return {
      admin: result,
      access_token,
    };
  }

  async login(email: string, password: string): Promise<{ admin: any, access_token: string }> {
    const admin = await this.adminModel.findOne({ email });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials');
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate JWT token
    const payload = { 
      sub: (admin._id as any).toString(), 
      email: admin.email, 
      role: 'admin',
      type: 'admin' // To differentiate from user tokens
    };
    const access_token = this.jwtService.sign(payload);

    // Return admin without password
    const { password: _, ...result } = admin.toObject();
    
    return {
      admin: result,
      access_token,
    };
  }

  async findById(id: string): Promise<Admin | null> {
    return this.adminModel.findById(id).select('-password').exec();
  }

  async findByEmail(email: string): Promise<Admin | null> {
    return this.adminModel.findOne({ email }).exec();
  }

  async validateAdmin(email: string, password: string): Promise<Admin | null> {
    const admin = await this.findByEmail(email);
    if (admin && await bcrypt.compare(password, admin.password)) {
      return admin;
    }
    return null;
  }
}
