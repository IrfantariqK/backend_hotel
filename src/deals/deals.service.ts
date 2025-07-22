import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Deal } from './deals.schema';

@Injectable()
export class DealsService {
  constructor(@InjectModel(Deal.name) private dealModel: Model<Deal>) {}

  async findAll(): Promise<Deal[]> {
    return this.dealModel.find().exec();
  }

  async findOne(id: string): Promise<Deal> {
    const deal = await this.dealModel.findById(id).exec();
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  async create(data: Partial<Deal>): Promise<Deal> {
    const deal = new this.dealModel(data);
    return deal.save();
  }

  async update(id: string, data: Partial<Deal>): Promise<Deal> {
    const deal = await this.dealModel.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!deal) throw new NotFoundException('Deal not found');
    return deal;
  }

  async delete(id: string): Promise<void> {
    const result = await this.dealModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Deal not found');
  }
} 