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

  async handleWebhook(body: any, signature: string): Promise<{ received: boolean }> {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!endpointSecret) {
      throw new Error('Stripe webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = this.stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      throw new Error('Webhook signature verification failed');
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await this.updateStatus(
          paymentIntent.id, 
          'completed', 
          new Date()
        );
        console.log('Payment succeeded:', paymentIntent.id);
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object as Stripe.PaymentIntent;
        await this.updateStatus(failedPayment.id, 'failed');
        console.log('Payment failed:', failedPayment.id);
        break;

      case 'payment_intent.canceled':
        const canceledPayment = event.data.object as Stripe.PaymentIntent;
        await this.updateStatus(canceledPayment.id, 'cancelled');
        console.log('Payment canceled:', canceledPayment.id);
        break;

      case 'payment_intent.requires_action':
        const actionRequired = event.data.object as Stripe.PaymentIntent;
        await this.updateStatus(actionRequired.id, 'requires_action');
        console.log('Payment requires action:', actionRequired.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  }
}
