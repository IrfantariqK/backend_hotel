export interface Deal {
  _id?: string;
  title: string;
  description: string;
  price: number;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
} 