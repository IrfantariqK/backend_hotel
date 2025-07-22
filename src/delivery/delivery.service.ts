import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Delivery } from './delivery.schema';

@Injectable()
export class DeliveryService {
  constructor(@InjectModel(Delivery.name) private deliveryModel: Model<Delivery>) {}

  async create(data: Partial<Delivery>): Promise<Delivery> {
    const delivery = new this.deliveryModel(data);
    return delivery.save();
  }

  async findByEmail(email: string): Promise<Delivery | null> {
    return this.deliveryModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<Delivery | null> {
    return this.deliveryModel.findById(id).exec();
  }
} 