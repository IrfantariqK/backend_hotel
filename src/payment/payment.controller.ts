import { Controller, Post, Body, Request, UseGuards, Get, Param, Headers, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Request as ExpressRequest } from 'express';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // User: Create Stripe payment intent
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user')
  @Post('intent')
  async createIntent(@Body() body: any, @Request() req) {
    // body: { orderId, amount }
    return this.paymentService.createIntent(body.orderId, req.user.userId, body.amount);
  }

  // User: Create COD payment record
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user')
  @Post('cod')
  async createCOD(@Body() body: any, @Request() req) {
    // body: { orderId, amount }
    return this.paymentService.createCOD(body.orderId, req.user.userId, body.amount);
  }

  // Stripe webhook
  @Post('webhook')
  async stripeWebhook(@Req() req: ExpressRequest, @Headers('stripe-signature') sig: string) {
    // Webhook logic to be implemented (Stripe event handling)
    return { received: true };
  }

  // Get payment status by orderId
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user', 'kitchen')
  @Get(':orderId')
  async getPayment(@Param('orderId') orderId: string) {
    return this.paymentService.findByOrderId(orderId);
  }
} 