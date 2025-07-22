export type OrderStatus = 'Placed' | 'Accepted' | 'In Process' | 'On The Way' | 'Delivered' | 'Cancelled';
export type PaymentType = 'COD' | 'Card';

export interface Order {
  _id?: string;
  userId: string;
  dealId: string;
  quantity: number;
  description?: string;
  paymentType: PaymentType;
  status: OrderStatus;
  deliveryBoyId?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 