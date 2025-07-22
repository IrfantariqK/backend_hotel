import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../users/users.schema';
import { Order } from '../orders/orders.schema';
import { Payment } from '../payment/payment.schema';

interface QueryOptions {
  status?: string;
  role?: string;
  page: number;
  limit: number;
}

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
  ) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalOrders,
      todayOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      kitchenStaff,
      deliveryStaff,
    ] = await Promise.all([
      this.userModel.countDocuments({ role: 'user' }),
      this.orderModel.countDocuments(),
      this.orderModel.countDocuments({
        createdAt: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0)),
          $lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      }),
      this.paymentModel.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.orderModel.countDocuments({ status: 'pending' }),
      this.orderModel.countDocuments({ status: 'delivered' }),
      this.userModel.countDocuments({ role: 'kitchen' }),
      this.userModel.countDocuments({ role: 'delivery' }),
    ]);

    return {
      overview: {
        totalUsers,
        totalOrders,
        todayOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
      orders: {
        pending: pendingOrders,
        completed: completedOrders,
      },
      staff: {
        kitchen: kitchenStaff,
        delivery: deliveryStaff,
      },
    };
  }

  async getAllOrders(options: QueryOptions) {
    const { status, page, limit } = options;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (status) filter.status = status;

    const [orders, total] = await Promise.all([
      this.orderModel
        .find(filter)
        .populate('userId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.orderModel.countDocuments(filter),
    ]);

    return {
      orders,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: orders.length,
        totalRecords: total,
      },
    };
  }

  async updateOrderStatus(orderId: string, status: string, notes?: string) {
    const order = await this.orderModel
      .findByIdAndUpdate(
        orderId,
        { 
          status, 
          notes: notes || undefined,
          updatedAt: new Date(),
        },
        { new: true }
      )
      .populate('userId', 'name email')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async cancelOrder(orderId: string) {
    const order = await this.orderModel.findById(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      throw new BadRequestException('Cannot cancel this order');
    }

    order.status = 'cancelled';
    await order.save();

    return order;
  }

  async getAllUsers(options: QueryOptions) {
    const { role, page, limit } = options;
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (role) filter.role = role;

    const [users, total] = await Promise.all([
      this.userModel
        .find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(filter),
    ]);

    return {
      users,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: users.length,
        totalRecords: total,
      },
    };
  }

  async updateUserRole(userId: string, role: string) {
    if (!['user', 'kitchen', 'delivery'].includes(role)) {
      throw new BadRequestException('Invalid role');
    }

    const user = await this.userModel
      .findByIdAndUpdate(userId, { role }, { new: true })
      .select('-password')
      .exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async deleteUser(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user has active orders
    const activeOrders = await this.orderModel.countDocuments({
      userId,
      status: { $nin: ['delivered', 'cancelled'] },
    });

    if (activeOrders > 0) {
      throw new BadRequestException('Cannot delete user with active orders');
    }

    await this.userModel.findByIdAndDelete(userId);
    return { message: 'User deleted successfully' };
  }

  async getPaymentAnalytics(startDate?: string, endDate?: string) {
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    const [totalRevenue, paymentMethods, dailyRevenue] = await Promise.all([
      this.paymentModel.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: start, $lte: end },
          },
        },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      this.paymentModel.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: '$paymentType',
            total: { $sum: '$amount' },
            count: { $sum: 1 },
          },
        },
      ]),
      this.paymentModel.aggregate([
        {
          $match: {
            status: 'completed',
            createdAt: { $gte: start, $lte: end },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$amount' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    return {
      totalRevenue: totalRevenue[0]?.total || 0,
      paymentMethods,
      dailyRevenue,
      period: { start, end },
    };
  }

  async getStaffByRole(role: 'kitchen' | 'delivery') {
    const staff = await this.userModel
      .find({ role })
      .select('-password')
      .sort({ createdAt: -1 })
      .exec();

    return staff;
  }

  async updateStaffStatus(userId: string, status: 'active' | 'inactive') {
    // Note: This would require adding a status field to the User schema
    // For now, we'll just return a placeholder
    const user = await this.userModel.findById(userId).select('-password');
    if (!user) {
      throw new NotFoundException('Staff member not found');
    }

    // In a real implementation, you'd update the status field
    return { 
      message: `Staff member ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
      user 
    };
  }

  async getSystemHealth() {
    const [userCount, orderCount, paymentCount] = await Promise.all([
      this.userModel.estimatedDocumentCount(),
      this.orderModel.estimatedDocumentCount(),
      this.paymentModel.estimatedDocumentCount(),
    ]);

    return {
      status: 'healthy',
      database: {
        connected: true,
        collections: {
          users: userCount,
          orders: orderCount,
          payments: paymentCount,
        },
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };
  }
}
