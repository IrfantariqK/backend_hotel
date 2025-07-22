import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
  namespace: '/notifications',
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  
  private readonly logger = new Logger(NotificationsGateway.name);
  private connectedUsers = new Map<string, AuthenticatedSocket>();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token || client.handshake.query.token;
      if (!token) {
        this.logger.warn('Client connected without authentication token');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      client.userRole = payload.role;

      // Store the connection
      if (client.userId) {
        this.connectedUsers.set(client.userId, client);
      }

      // Join role-based rooms
      client.join(`role:${client.userRole}`);
      client.join(`user:${client.userId}`);

      this.logger.log(`Client ${client.userId} (${client.userRole}) connected`);
    } catch (error) {
      this.logger.error('Authentication failed for WebSocket connection', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      this.logger.log(`Client ${client.userId} disconnected`);
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    client.join(data.room);
    this.logger.log(`User ${client.userId} joined room: ${data.room}`);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { room: string },
  ) {
    client.leave(data.room);
    this.logger.log(`User ${client.userId} left room: ${data.room}`);
  }

  // Notification methods to be called by services
  notifyOrderStatusUpdate(orderId: string, status: string, userId: string) {
    const notification = {
      type: 'order_status_update',
      orderId,
      status,
      message: `Your order has been ${status}`,
      timestamp: new Date().toISOString(),
    };

    // Notify the specific user
    this.server.to(`user:${userId}`).emit('notification', notification);

    // Notify kitchen staff about new orders
    if (status === 'pending') {
      this.server.to('role:kitchen').emit('notification', {
        ...notification,
        message: 'New order received',
      });
    }

    // Notify delivery staff when order is ready
    if (status === 'ready') {
      this.server.to('role:delivery').emit('notification', {
        ...notification,
        message: 'Order ready for delivery',
      });
    }

    this.logger.log(`Order status notification sent for order ${orderId}: ${status}`);
  }

  notifyPaymentUpdate(orderId: string, paymentStatus: string, userId: string) {
    const notification = {
      type: 'payment_update',
      orderId,
      paymentStatus,
      message: `Payment ${paymentStatus} for your order`,
      timestamp: new Date().toISOString(),
    };

    this.server.to(`user:${userId}`).emit('notification', notification);
    this.logger.log(`Payment notification sent for order ${orderId}: ${paymentStatus}`);
  }

  notifyNewUser(userRole: string) {
    const notification = {
      type: 'new_user',
      role: userRole,
      message: `New ${userRole} registered`,
      timestamp: new Date().toISOString(),
    };

    this.server.to('role:admin').emit('notification', notification);
    this.logger.log(`New user notification sent: ${userRole}`);
  }

  notifySystemAlert(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    const notification = {
      type: 'system_alert',
      level,
      message,
      timestamp: new Date().toISOString(),
    };

    this.server.to('role:admin').emit('notification', notification);
    this.logger.log(`System alert sent: ${message}`);
  }

  broadcastToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
    this.logger.log(`Broadcast to role ${role}: ${event}`);
  }

  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
    this.logger.log(`Message sent to user ${userId}: ${event}`);
  }

  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers.keys());
  }

  getConnectedUsersByRole(role: string): AuthenticatedSocket[] {
    return Array.from(this.connectedUsers.values()).filter(
      (socket) => socket.userRole === role,
    );
  }
}
