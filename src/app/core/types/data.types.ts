// Core Data Types for the entire application
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  isActive: boolean;
  registeredDate: number;
  lastLogin?: number;
  phone?: string;
  address?: string;
  profile?: {
    avatar?: string;
    bio?: string;
    preferences?: UserPreferences;
  };
}

export interface UserPreferences {
  newsletter: boolean;
  emailNotifications: boolean;
  marketingEmails: boolean;
  language: string;
  currency: string;
  theme: 'light' | 'dark';
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  images?: string[];
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  featured: boolean;
  rating: number;
  reviews: number;
  warranty?: string;
  specifications?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
  tags?: string[];
  sku?: string;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  shipping?: {
    weight: number;
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    cost: number;
    free: boolean;
  };
}

export interface Category {
  id: string;
  name: string;
  description: string;
  parentId?: string;
  level: number; // 0 for root categories, 1+ for subcategories
  icon?: string;
  productCount: number;
  createdAt: number;
  updatedAt: number;
  isActive: boolean;
  sortOrder: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'returned';
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingAddress: Address;
  billingAddress?: Address;
  paymentMethod: {
    type: 'credit-card' | 'debit-card' | 'paypal' | 'cash-on-delivery' | 'bank-transfer';
    last4?: string;
    cardType?: string;
  };
  orderDate: number;
  estimatedDelivery?: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  price: number;
  subtotal: number;
  options?: Record<string, any>;
}

export interface Address {
  id: string;
  userId: string;
  type: 'shipping' | 'billing';
  isDefault: boolean;
  name: string;
  phone?: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  createdAt: number;
  updatedAt: number;
}

export interface Review {
  id: string;
  userId: string;
  productId: string;
  productName: string;
  rating: number;
  title: string;
  content: string;
  helpful: number;
  verified: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CartItem {
  productId: string;
  userId: string;
  quantity: number;
  addedAt: number;
}

export interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  addedAt: number;
}

export interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  topProducts: Product[];
  recentOrders: Order[];
  salesByCategory: Record<string, number>;
  salesByMonth: Record<string, number>;
  userGrowth: number;
  conversionRate: number;
  averageOrderValue: number;
  popularCategories: Category[];
  lowStockProducts: Product[];
  outOfStockProducts: Product[];
}

export interface Report {
  id: string;
  type: 'sales' | 'inventory' | 'users' | 'orders' | 'financial';
  title: string;
  description: string;
  generatedAt: number;
  generatedBy: string;
  period: {
    start: string;
    end: string;
  };
  data: any;
  format: 'pdf' | 'excel' | 'csv';
  fileSize: number;
}

export interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  supportPhone: string;
  address: string;
  currency: string;
  taxRate: number;
  shippingCosts: {
    domestic: number;
    international: number;
  };
  paymentMethods: string[];
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  maintenance: {
    enabled: boolean;
    message?: string;
    scheduledDate?: number;
  };
  security: {
    requireEmailVerification: boolean;
    requirePhoneVerification: boolean;
    passwordMinLength: number;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  features: {
    enableRegistration: boolean;
    enableGuestCheckout: boolean;
    enableReviews: boolean;
    enableWishlist: boolean;
    enableComparison: boolean;
  };
  createdAt: number;
  updatedAt: number;
}

// Storage Keys for LocalStorage
export const STORAGE_KEYS = {
  // User Data
  USERS: 'our_bikes_users',
  USER_PREFERENCES: 'our_bikes_user_preferences',
  
  // Product Data
  PRODUCTS: 'our_bikes_products',
  CATEGORIES: 'our_bikes_categories',
  
  // Order Data
  ORDERS: 'our_bikes_orders',
  
  // Cart Data
  CART: 'our_bikes_cart',
  
  // Wishlist Data
  WISHLIST: 'our_bikes_wishlist',
  
  // Review Data
  REVIEWS: 'our_bikes_reviews',
  
  // Analytics Data
  ANALYTICS: 'our_bikes_analytics',
  
  // Reports Data
  REPORTS: 'our_bikes_reports',
  
  // Settings Data
  SETTINGS: 'our_bikes_settings',
  
  // Session Data
  CURRENT_USER: 'our_bikes_current_user',
  SESSION_TOKEN: 'our_bikes_session_token',
  LAST_ACTIVITY: 'our_bikes_last_activity'
} as const;
