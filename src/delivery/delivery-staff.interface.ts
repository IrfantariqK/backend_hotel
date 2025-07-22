export interface DeliveryStaff {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: 'delivery';
  isActive?: boolean;
  lastLogin?: Date;
  vehicleType?: string;
  licenseNumber?: string;
  phoneNumber?: string;
  currentStatus?: 'available' | 'busy' | 'offline';
  createdAt?: Date;
  updatedAt?: Date;
}
