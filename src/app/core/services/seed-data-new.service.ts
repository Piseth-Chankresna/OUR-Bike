import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { ProductDataCoordinatorService } from './product-data-coordinator.service';
import { User, Order, Comment } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SeedDataService {
  constructor(
    private storageService: StorageService,
    private productCoordinator: ProductDataCoordinatorService
  ) {}

  // Initialize all seed data
  initializeSeedData(): void {
    console.log('🌱 Initializing seed data...');
    
    // Always reinitialize products to fix image URLs
    this.seedProducts();
    
    // Only seed other data if it doesn't exist
    if ((this.storageService.getUsers() as User[] || []).length === 0) {
      console.log('👥 Seeding users...');
      this.seedUsers();
    }
    
    if ((this.storageService.getOrders() as Order[] || []).length === 0) {
      console.log('📦 Seeding orders...');
      this.seedOrders();
    }
    
    if ((this.storageService.getComments() as Comment[] || []).length === 0) {
      console.log('💬 Seeding comments...');
      this.seedComments();
    }
    
    console.log('✅ Seed data initialization complete!');
  }

  // Force reinitialize all data (for testing/reset)
  forceReinitializeAllData(): void {
    console.log('🔄 Force reinitializing all seed data...');
    
    // Reinitialize everything (this will overwrite existing data)
    this.seedUsers();
    this.seedProducts();
    this.seedOrders();
    this.seedComments();
    
    console.log('✅ Force reinitialization complete!');
  }

  // Check if seed data exists
  hasSeedData(): boolean {
    const users = this.storageService.getUsers() as User[] || [];
    const products = this.storageService.getProducts() as any[] || [];
    const orders = this.storageService.getOrders() as Order[] || [];
    const comments = this.storageService.getComments() as Comment[] || [];
    
    return users.length > 0 && products.length > 0 && orders.length > 0 && comments.length > 0;
  }

  // Get seed data statistics
  getSeedDataStats(): { users: number; products: number; orders: number; comments: number } {
    return {
      users: (this.storageService.getUsers() as User[] || []).length,
      products: (this.storageService.getProducts() as any[] || []).length,
      orders: (this.storageService.getOrders() as Order[] || []).length,
      comments: (this.storageService.getComments() as Comment[] || []).length
    };
  }

  // Seed products using the new category services
  private seedProducts(): void {
    console.log('🏍️ Seeding products by category...');
    this.productCoordinator.seedAllProducts();
    
    // Log statistics
    const stats = this.productCoordinator.getOverallStats();
    console.log('📊 Product Statistics:', stats);
  }

  // Seed users
  private seedUsers(): void {
    const users: User[] = [
      {
        id: this.storageService.generateId(),
        email: 'pisethchankresna@gmail.com',
        password: btoa('Sna#123$123$' + 'our_bikes_salt'),
        role: 'admin',
        fullName: 'Store Owner',
        phoneNumber: '+1234567890',
        address: 'Store Headquarters',
        registeredDate: Date.now() - (365 * 24 * 60 * 60 * 1000) // 1 year ago
      }
    ];

    this.storageService.setUsers(users);
  }

  // Seed orders
  private seedOrders(): void {
    const orders = [
      {
        id: this.storageService.generateId(),
        userId: 'pisethchankresna@gmail.com',
        products: [
          {
            productId: this.storageService.generateId(),
            productName: 'Honda CRF450R',
            quantity: 1,
            price: 9999,
            image: 'https://motocrossactionmag.com/wp-content/uploads/2022/05/2023-Honda-Intro-7282.jpg'
          },
          {
            productId: this.storageService.generateId(),
            productName: 'Pro Circuit Helmet',
            quantity: 1,
            price: 299,
            image: 'assets/Bikes/Pro Circuit Helmet.png'
          }
        ],
        totalAmount: 10298,
        status: 'shipped' as const,
        orderDate: Date.now() - (5 * 24 * 60 * 60 * 1000),
        customerName: 'John Doe',
        customerEmail: 'john.doe@example.com',
        shippingAddress: 'Siem Reap, Cambodia',
        trackingNumber: 'TRK123456789',
        estimatedDelivery: Date.now() + (2 * 24 * 60 * 60 * 1000)
      },
      {
        id: this.storageService.generateId(),
        userId: 'jane.smith@example.com',
        products: [
          {
            productId: this.storageService.generateId(),
            productName: 'KTM 450 SX-F',
            quantity: 1,
            price: 10999,
            image: 'https://images.otf3.pixelmotiondemo.com/te9mB-20251015194222.png'
          }
        ],
        totalAmount: 10999,
        status: 'pending' as const,
        orderDate: Date.now() - (2 * 24 * 60 * 60 * 1000),
        customerName: 'Jane Smith',
        customerEmail: 'jane.smith@example.com',
        shippingAddress: 'Sihanoukville, Cambodia'
      },
      {
        id: this.storageService.generateId(),
        userId: 'mike.wilson@example.com',
        products: [
          {
            productId: this.storageService.generateId(),
            productName: 'Fox Racing Jersey',
            quantity: 2,
            price: 79,
            image: 'https://i.ebayimg.com/images/g/2R4AAeSwgB9n2YEO/s-l1200.jpg'
          },
          {
            productId: this.storageService.generateId(),
            productName: 'Gloves Pro',
            quantity: 2,
            price: 49,
            image: 'assets/Bikes/Racing Gloves.png'
          }
        ],
        totalAmount: 256,
        status: 'complete' as const,
        orderDate: Date.now() - (10 * 24 * 60 * 60 * 1000),
        customerName: 'Mike Wilson',
        customerEmail: 'mike.wilson@example.com',
        shippingAddress: 'Battambang, Cambodia'
      }
    ];

    this.storageService.setOrders(orders);
  }

  // Seed comments
  private seedComments(): void {
    const comments = [
      {
        id: this.storageService.generateId(),
        productId: '1',
        userId: 'john.doe@example.com',
        userName: 'John Doe',
        comment: 'Amazing bike! The Honda CRF450R exceeded my expectations. Great power delivery and handling.',
        rating: 5,
        date: Date.now() - (3 * 24 * 60 * 60 * 1000),
        helpful: 12,
        notHelpful: 1
      },
      {
        id: this.storageService.generateId(),
        productId: '2',
        userId: 'jane.smith@example.com',
        userName: 'Jane Smith',
        comment: 'The KTM 350 SX-F is perfect for my skill level. Not too intimidating but still plenty of power.',
        rating: 4,
        date: Date.now() - (5 * 24 * 60 * 60 * 1000),
        helpful: 8,
        notHelpful: 2
      },
      {
        id: this.storageService.generateId(),
        productId: '1',
        userId: 'mike.wilson@example.com',
        userName: 'Mike Wilson',
        comment: 'Good bike overall, but suspension could be better for heavier riders.',
        rating: 4,
        date: Date.now() - (7 * 24 * 60 * 60 * 1000),
        helpful: 5,
        notHelpful: 3
      },
      {
        id: this.storageService.generateId(),
        productId: '5',
        userId: 'sarah.johnson@example.com',
        userName: 'Sarah Johnson',
        comment: 'This helmet saved my life in a crash! Best investment I ever made.',
        rating: 5,
        date: Date.now() - (2 * 24 * 60 * 60 * 1000),
        helpful: 20,
        notHelpful: 0
      },
      {
        id: this.storageService.generateId(),
        productId: '6',
        userId: 'john.doe@example.com',
        userName: 'John Doe',
        comment: 'The Alpinestars boots are worth every penny. Great protection and comfort.',
        rating: 5,
        date: Date.now() - (4 * 24 * 60 * 60 * 1000),
        helpful: 15,
        notHelpful: 1
      }
    ];

    this.storageService.setComments(comments);
  }

  // Clear all data (for testing purposes)
  clearAllData(): void {
    this.storageService.clear();
    console.log('All data cleared from LocalStorage');
  }

  // Reset to seed data
  resetToSeedData(): void {
    this.clearAllData();
    this.initializeSeedData();
    console.log('Data reset to seed values');
  }
}
