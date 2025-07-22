export type UserRole = 'user' | 'kitchen' | 'delivery';

export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
} 