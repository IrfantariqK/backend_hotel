import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, ValidationPipe, UsePipes } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminService } from './admin.service';
import { UpdateOrderStatusDto } from '../common/dto/base.dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard Statistics
  @Get('dashboard/stats')
  @Roles('admin')
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // Order Management
  @Get('orders')
  @Roles('admin', 'kitchen')
  async getAllOrders(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllOrders({
      status,
      page: parseInt(page || '1') || 1,
      limit: parseInt(limit || '10') || 10,
    });
  }

  @Put('orders/:orderId/status')
  @Roles('admin', 'kitchen', 'delivery')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async updateOrderStatus(
    @Param('orderId') orderId: string,
    @Body() updateDto: UpdateOrderStatusDto,
  ) {
    return this.adminService.updateOrderStatus(orderId, updateDto.status, updateDto.notes);
  }

  @Delete('orders/:orderId')
  @Roles('admin')
  async cancelOrder(@Param('orderId') orderId: string) {
    return this.adminService.cancelOrder(orderId);
  }

  // User Management
  @Get('users')
  @Roles('admin')
  async getAllUsers(
    @Query('role') role?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getAllUsers({
      role,
      page: parseInt(page || '1') || 1,
      limit: parseInt(limit || '10') || 10,
    });
  }

  @Put('users/:userId/role')
  @Roles('admin')
  async updateUserRole(
    @Param('userId') userId: string,
    @Body('role') role: string,
  ) {
    return this.adminService.updateUserRole(userId, role);
  }

  @Delete('users/:userId')
  @Roles('admin')
  async deleteUser(@Param('userId') userId: string) {
    return this.adminService.deleteUser(userId);
  }

  // Payment Analytics
  @Get('payments/analytics')
  @Roles('admin')
  async getPaymentAnalytics(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getPaymentAnalytics(startDate, endDate);
  }

  // Staff Management
  @Get('staff/kitchen')
  @Roles('admin')
  async getKitchenStaff() {
    return this.adminService.getStaffByRole('kitchen');
  }

  @Get('staff/delivery')
  @Roles('admin')
  async getDeliveryStaff() {
    return this.adminService.getStaffByRole('delivery');
  }

  @Post('staff/:userId/activate')
  @Roles('admin')
  async activateStaff(@Param('userId') userId: string) {
    return this.adminService.updateStaffStatus(userId, 'active');
  }

  @Post('staff/:userId/deactivate')
  @Roles('admin')
  async deactivateStaff(@Param('userId') userId: string) {
    return this.adminService.updateStaffStatus(userId, 'inactive');
  }

  // System Health
  @Get('system/health')
  @Roles('admin')
  async getSystemHealth() {
    return this.adminService.getSystemHealth();
  }
}
