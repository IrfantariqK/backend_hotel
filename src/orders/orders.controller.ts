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

  // Role-based: Get orders
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Get()
  async findOrders(@Request() req) {
    if (req.user.role === 'user') {
      return this.ordersService.findByUser(req.user.userId);
    } else if (req.user.role === 'kitchen') {
      return this.ordersService.findByKitchen();
    } else if (req.user.role === 'delivery') {
      return this.ordersService.findByDelivery(req.user.userId);
    }
    return [];
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