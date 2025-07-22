import { Controller, Post, Get, Patch, Body, Param, UseGuards, Request, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // User: Place order
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user')
  @Post()
  async create(@Body() dto: any, @Request() req) {
    return this.ordersService.create({
      ...dto,
      userId: req.user.userId,
      status: 'Placed',
    });
  }

  // All roles: Get order by id
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.ordersService.findById(id);
  }

  // User: Get user's orders
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('user')
  @Get('user')
  async getUserOrders(@Request() req) {
    return this.ordersService.findByUser(req.user.userId);
  }

  // Kitchen: Get all orders for kitchen
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('kitchen')
  @Get('kitchen')
  async getKitchenOrders(@Request() req) {
    return this.ordersService.findByKitchen();
  }

  // Delivery: Get assigned orders
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('delivery')
  @Get('delivery')
  async getDeliveryOrders(@Request() req) {
    return this.ordersService.findByDelivery(req.user.userId);
  }

  // Kitchen/Delivery: Update order status
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('kitchen', 'delivery')
  @Patch(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }

  // Kitchen: Assign delivery boy
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('kitchen')
  @Patch(':id/assign-delivery')
  async assignDelivery(@Param('id') id: string, @Body('deliveryBoyId') deliveryBoyId: string) {
    return this.ordersService.assignDelivery(id, deliveryBoyId);
  }
} 