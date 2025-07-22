export interface Admin {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: 'admin';
  isActive?: boolean;
  lastLogin?: Date;
  permissions?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
