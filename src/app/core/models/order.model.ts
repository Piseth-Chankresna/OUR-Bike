export interface Order {
  id: string;
  userId: string;
  products: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderDate: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  trackingNumber?: string;
  estimatedDelivery?: number;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

export type OrderStatus = 'pending' | 'shipped' | 'complete' | 'cancelled';

export interface OrderCreate {
  userId: string;
  products: OrderItem[];
  totalAmount: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  notes?: string;
}

export interface OrderUpdate {
  status?: OrderStatus;
  trackingNumber?: string;
  estimatedDelivery?: number;
  notes?: string;
}

export interface OrderFilter {
  status?: OrderStatus | 'all';
  dateFrom?: number;
  dateTo?: number;
  userId?: string;
  searchQuery?: string;
}

export interface OrderListItem {
  id: string;
  orderDate: number;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  itemCount: number;
}
