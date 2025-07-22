import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order } from './orders.schema';
import { NotificationsGateway } from '../notifications/notifications.gateway';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @Inject(forwardRef(() => NotificationsGateway))
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(data: Partial<Order>): Promise<Order> {
    const order = new this.orderModel(data);
    const savedOrder = await order.save();
    
    // Notify kitchen staff of new order
    if (this.notificationsGateway) {
      this.notificationsGateway.notifyOrderStatusUpdate(
        (savedOrder._id as any).toString(),
        'pending',
        (savedOrder.userId as any).toString()
      );
    }
    
    return savedOrder;
  }

  async findById(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).populate('userId', 'name email').exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async findByUser(userId: string): Promise<Order[]> {
    return this.orderModel.find({ userId }).populate('userId', 'name email').exec();
  }

  async findByKitchen(): Promise<Order[]> {
    return this.orderModel.find().populate('userId', 'name email').exec();
  }

  async findByDelivery(deliveryBoyId: string): Promise<Order[]> {
    return this.orderModel.find({ deliveryBoyId }).populate('userId', 'name email').exec();
  }

  async updateStatus(id: string, status: string): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(id, { status }, { new: true }).populate('userId', 'name email').exec();
    if (!order) throw new NotFoundException('Order not found');
    
    // Send notification about status update
    if (this.notificationsGateway) {
      this.notificationsGateway.notifyOrderStatusUpdate(
        (order._id as any).toString(),
        status,
        (order.userId as any).toString()
      );
    }
    
    return order;
  }

  async assignDelivery(id: string, deliveryBoyId: string): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(id, { deliveryBoyId }, { new: true }).populate('userId', 'name email').exec();
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }
} 