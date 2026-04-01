export interface Cart {
  userId: string;
  items: CartItem[];
  updatedAt: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image: string;
}

export interface CartUpdate {
  productId: string;
  quantity: number;
}

export interface CartAddItem {
  productId: string;
  productName: string;
  price: number;
  image: string;
  quantity?: number;
}

export interface CartSummary {
  itemCount: number;
  subtotal: number;
  estimatedShipping: number;
  total: number;
}
