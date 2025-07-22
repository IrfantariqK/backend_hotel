import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment } from './payment.schema';
import Stripe from 'stripe';

@Injectable()
export class PaymentService {
  private stripe: Stripe;
  constructor(@InjectModel(Payment.name) private paymentModel: Model<Payment>) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  async createIntent(orderId: string, userId: string, amount: number): Promise<any> {
    const intAmount = Number(amount);
    if (isNaN(intAmount) || intAmount <= 0) {
      throw new Error('Invalid amount');
    }
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount: Math.round(intAmount * 100), // Stripe expects amount in cents
      currency: 'usd',
      metadata: { orderId, userId },
    });
    const payment = new this.paymentModel({
      orderId,
      userId,
      amount: intAmount,
      paymentType: 'Card',
      status: 'pending',
      stripePaymentId: paymentIntent.id,
    });
    await payment.save();
    return paymentIntent;
  }

  async createCOD(orderId: string, userId: string, amount: number): Promise<Payment> {
    const intAmount = Number(amount);
    if (isNaN(intAmount) || intAmount <= 0) {
      throw new Error('Invalid amount');
    }
    const payment = new this.paymentModel({
      orderId,
      userId,
      amount: intAmount,
      paymentType: 'COD',
      status: 'pending',
    });
    return payment.save();
  }

  async updateStatus(stripePaymentId: string, status: string, paidAt?: Date): Promise<Payment> {
    const payment = await this.paymentModel.findOneAndUpdate(
      { stripePaymentId },
      { status, paidAt },
      { new: true },
    ).exec();
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async findByOrderId(orderId: string): Promise<Payment | null> {
    return this.paymentModel.findOne({ orderId }).exec();
  }
} 