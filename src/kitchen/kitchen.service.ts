import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Kitchen } from './kitchen.schema';

@Injectable()
export class KitchenService {
  constructor(@InjectModel(Kitchen.name) private kitchenModel: Model<Kitchen>) {}

  async create(data: Partial<Kitchen>): Promise<Kitchen> {
    const kitchen = new this.kitchenModel(data);
    return kitchen.save();
  }

  async findByEmail(email: string): Promise<Kitchen | null> {
    return this.kitchenModel.findOne({ email }).exec();
  }

  async findById(id: string): Promise<Kitchen | null> {
    return this.kitchenModel.findById(id).exec();
  }
} 