export interface KitchenStaff {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: 'kitchen';
  isActive?: boolean;
  lastLogin?: Date;
  specialties?: string[];
  shift?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
