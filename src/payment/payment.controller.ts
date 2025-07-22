import { Controller, Post, Body, Request, UseGuards, Get, Param, Headers, Req, ValidationPipe, UsePipes } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Request as ExpressRequest } from 'express';
import { CreatePaymentIntentDto } from '../common/dto/base.dto';

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // User: Create Stripe payment intent
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user')
  @Post('intent')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createIntent(@Body() body: CreatePaymentIntentDto, @Request() req) {
    return this.paymentService.createIntent(body.orderId, req.user.userId, body.amount);
  }

  // User: Create COD payment record
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user')
  @Post('cod')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async createCOD(@Body() body: CreatePaymentIntentDto, @Request() req) {
    return this.paymentService.createCOD(body.orderId, req.user.userId, body.amount);
  }

  // Stripe webhook
  @Post('webhook')
  async stripeWebhook(@Req() req: ExpressRequest, @Headers('stripe-signature') sig: string) {
    return this.paymentService.handleWebhook(req.body, sig);
  }

  // Get payment status by orderId
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user', 'kitchen')
  @Get(':orderId')
  async getPayment(@Param('orderId') orderId: string) {
    return this.paymentService.findByOrderId(orderId);
  }
} 