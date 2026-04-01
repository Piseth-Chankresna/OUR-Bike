// Test setup file for OUR-Bikes Store
import 'zone.js/dist/zone-testing';

// Global test environment setup
declare global {
  interface Window {
    testing: Record<string, unknown>;
  }
}

// Mock localStorage for tests
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
    get length() {
      return Object.keys(store).length;
    }
  };
})();

// Setup test environment
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Setup test utilities
export const testHelpers = {
  // Create mock user
  createMockUser: (overrides: Partial<{userId: string; email: string; role: 'user' | 'admin'; fullName: string; loginTime: number}> = {}) => ({
    userId: 'test-user-123',
    email: 'test@example.com',
    role: 'user' as const,
    fullName: 'Test User',
    loginTime: Date.now(),
    ...overrides
  }),

  // Create mock admin user
  createMockAdmin: (overrides: Partial<{userId: string; email: string; role: 'user' | 'admin'; fullName: string; loginTime: number}> = {}) => ({
    userId: 'test-admin-456',
    email: 'admin@example.com',
    role: 'admin' as const,
    fullName: 'Admin User',
    loginTime: Date.now(),
    ...overrides
  }),

  // Create mock product
  createMockProduct: (overrides: Partial<{id: string; name: string; category: string; price: number; description: string; images: string[]; stock: number; dateAdded: number; specifications: Record<string, unknown>}> = {}) => ({
    id: 'test-product-789',
    name: 'Test Product',
    category: 'bikes' as const,
    price: 9999,
    description: 'Test product description',
    images: ['https://picsum.photos/seed/test/400/300.jpg'],
    stock: 10,
    dateAdded: Date.now(),
    specifications: {
      brand: 'Test Brand',
      model: 'Test Model',
      engineSize: '450cc',
      color: 'Red',
      size: 'Large',
      weight: '200kg',
      material: 'Aluminum',
      features: ['Feature 1', 'Feature 2'],
      dimensions: '200x100x80cm',
      warranty: '2 years',
      ...overrides.specifications
    },
    ...overrides
  }),

  // Create mock order
  createMockOrder: (overrides: Partial<{id: string; userId: string; customerName: string; items: unknown[]; summary: Record<string, unknown>; status: string; createdAt: number}> = {}) => ({
    id: 'test-order-101',
    userId: 'test-user-123',
    customerName: 'Test User',
    items: [
      {
        productId: 'test-product-789',
        name: 'Test Product',
        price: 9999,
        quantity: 1,
        image: 'https://picsum.photos/seed/test/400/300.jpg'
      }
    ],
    summary: {
      subtotal: 9999,
      tax: 999,
      shipping: 50,
      total: 11048
    },
    status: 'pending' as const,
    createdAt: Date.now(),
    ...overrides
  }),

  // Wait for async operations
  waitFor: (condition: () => boolean, timeout = 5000): Promise<void> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        if (condition()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error(`Timeout waiting for condition: ${timeout}ms`));
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  },

  // Generate random data
  randomString: (length = 10) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  randomEmail: () => {
    return `test-${testHelpers.randomString(8)}@example.com`;
  },

  randomNumber: (min = 1, max = 9999) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

// Export test constants
export const TEST_CONSTANTS = {
  TIMEOUTS: {
    SHORT: 1000,
    MEDIUM: 3000,
    LONG: 10000
  },
  ENDPOINTS: {
    API_BASE: 'http://localhost:4200/api',
    PRODUCTS: '/products',
    USERS: '/users',
    ORDERS: '/orders'
  },
  MESSAGES: {
    SUCCESS: 'Operation completed successfully',
    ERROR: 'An error occurred',
    TIMEOUT: 'Operation timed out'
  }
};
