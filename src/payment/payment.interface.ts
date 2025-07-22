export type PaymentStatus = 'pending' | 'succeeded' | 'failed';
export type PaymentType = 'COD' | 'Card';

export interface Payment {
  _id?: string;
  orderId: string;
  userId: string;
  amount: number;
  paymentType: PaymentType;
  status: PaymentStatus;
  stripePaymentId?: string;
  paidAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
} 