import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ required: true })
  dealId: string;

  @Prop({ required: true })
  quantity: number;

  @Prop()
  description?: string;

  @Prop({ required: true, enum: ['COD', 'Card'] })
  paymentType: string;

  @Prop({ required: true, enum: ['Placed', 'Accepted', 'In Process', 'On The Way', 'Delivered', 'Cancelled'] })
  status: string;

  @Prop()
  deliveryBoyId?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order); 