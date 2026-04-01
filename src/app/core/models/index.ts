// Export all models for easy importing
export * from './user.model';
export * from './product.model';
export * from './order.model';
export * from './cart.model';
export * from './comment.model';
export * from './favorite.model';
export * from './address.model';
export * from './order-summary.model';

// Common utility types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  search?: string;
  category?: string;
  status?: string;
  dateRange?: {
    start: number;
    end: number;
  };
  priceRange?: {
    min: number;
    max: number;
  };
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  actionUrl?: string;
}

export interface ThemeSettings {
  isDarkMode: boolean;
  primaryColor: string;
  secondaryColor: string;
}

export interface AppSettings {
  theme: ThemeSettings;
  language: string;
  currency: string;
  notifications: boolean;
}
