import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DeliveryStaff extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: 'delivery' })
  role: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLogin: Date;

  @Prop()
  vehicleType: string;

  @Prop()
  licenseNumber: string;

  @Prop()
  phoneNumber: string;

  @Prop({ default: 'available' })
  currentStatus: string; // available, busy, offline
}

export const DeliveryStaffSchema = SchemaFactory.createForClass(DeliveryStaff);
