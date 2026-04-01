import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { User, Product, Order, Comment } from '../models';

@Injectable({
  providedIn: 'root'
})
export class SeedDataService {
  constructor(private storageService: StorageService) {}

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
    const products = this.storageService.getProducts() as Product[] || [];
    const orders = this.storageService.getOrders() as Order[] || [];
    const comments = this.storageService.getComments() as Comment[] || [];
    
    return users.length > 0 && products.length > 0 && orders.length > 0 && comments.length > 0;
  }

  // Get seed data statistics
  getSeedDataStats(): { users: number; products: number; orders: number; comments: number } {
    return {
      users: (this.storageService.getUsers() as User[] || []).length,
      products: (this.storageService.getProducts() as Product[] || []).length,
      orders: (this.storageService.getOrders() as Order[] || []).length,
      comments: (this.storageService.getComments() as Comment[] || []).length
    };
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

  // Seed products with reliable placeholder images
  private seedProducts(): void {
    const products: Product[] = [
      // Bikes - New 2024 Models with reliable placeholder images
      {
        id: this.storageService.generateId(),
        name: 'Honda CRF450R 2024',
        category: 'bikes',
        price: 9999,
        description: 'The 2024 Honda CRF450R is a championship-winning motocross bike with enhanced electronics, updated suspension, and improved ergonomics. Features a 449cc liquid-cooled single-cylinder engine with exceptional power delivery.',
        images: [
          'https://motocrossactionmag.com/wp-content/uploads/2022/05/2023-Honda-Intro-7282.jpg',
          'https://southcoastpowersports.co.uk/wp-content/uploads/2024/06/VDPV6514.jpg',
          'https://bikesales.pxcrush.net/cars/dealer/bejylba8h0jn97wq4xefybkke.jpg?pxc_method=fitfill&pxc_bgtype=self&pxc_size=720,480'
        ],
        stock: 5,
        dateAdded: Date.now() - (7 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'Honda',
          model: 'CRF450R 2024',
          engineSize: '449cc',
          color: 'Red/Black',
          weight: '233 lbs',
          fuelCapacity: '1.7 gallons',
          suspension: 'Showa 49mm USD fork',
          brakes: 'Front: 260mm disc, Rear: 240mm disc',
          year: 2024
        }
      },
      {
        id: this.storageService.generateId(),
        name: 'KTM 450 SX-F FACTORY 2024',
        category: 'bikes',
        price: 11999,
        description: 'The 2024 KTM 450 SX-F FACTORY edition features top-of-the-line components including WP XACT Pro suspension, Brembo brakes, and factory racing graphics. The ultimate racing machine for serious competitors.',
        images: [
          'https://images.otf3.pixelmotiondemo.com/te9mB-20251015194222.png',
          'https://www.motorcyclesrus.com.au/media/24193/1716859578.KTM-450-SXF-FACTORY-2024-ARRIVAL_20240528_001.jpg',
          'https://enduro21.com/images/2023/december-2023/2024-ktm-sx-f-factory-editions/my24-ktm-250-sx-f-factory-edition_static_usa_02_static.jpg'
        ],
        stock: 3,
        dateAdded: Date.now() - (5 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'KTM',
          model: '450 SX-F FACTORY 2024',
          engineSize: '449.9cc',
          color: 'Orange/Black',
          weight: '218 lbs',
          fuelCapacity: '2.25 gallons',
          suspension: 'WP XACT Pro 48mm fork',
          brakes: 'Brembo Front: 260mm disc, Rear: 220mm disc',
          year: 2024
        }
      },
      {
        id: this.storageService.generateId(),
        name: 'Yamaha YZ250F 2024',
        category: 'bikes',
        price: 8499,
        description: 'The 2024 Yamaha YZ250F features an all-new engine with improved power delivery, updated KYB suspension, and enhanced ergonomics. A proven winner in the 250cc class.',
        images: [
          'https://www.50grafx.com/products/2021-2023-mc-mxec-125-300-yamaha-yz250f.jpg',
          'https://www.50grafx.com/products/2021-2023-mc-mxec-125-300-yamaha-yz250f-side.jpg',
          'https://www.50grafx.com/products/2021-2023-mc-mxec-125-300-yamaha-yz250f-detail.jpg'
        ],
        stock: 7,
        dateAdded: Date.now() - (10 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'Yamaha',
          model: 'YZ250F 2024',
          engineSize: '250cc',
          color: 'Blue/White',
          weight: '229 lbs',
          fuelCapacity: '2.2 gallons',
          suspension: 'KYB 48mm fork',
          brakes: 'Front: 270mm disc, Rear: 245mm disc',
          year: 2024
        }
      },
      {
        id: this.storageService.generateId(),
        name: 'Kawasaki KX450 2024',
        category: 'bikes',
        price: 9799,
        description: 'The 2024 Kawasaki KX450 features a powerful 449cc engine with dual fuel injection, Showa suspension, and Kawasaki\'s latest traction control system. Built for championship performance.',
        images: [
          'https://www.dirtrider.com/wp-content/uploads/2024/03/kawasaki-kx450-2024-action-1.jpg',
          'https://www.dirtrider.com/wp-content/uploads/2024/03/kawasaki-kx450-2024-action-2.jpg',
          'https://www.dirtrider.com/wp-content/uploads/2024/03/kawasaki-kx450-2024-action-3.jpg'
        ],
        stock: 4,
        dateAdded: Date.now() - (12 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'Kawasaki',
          model: 'KX450 2024',
          engineSize: '449cc',
          color: 'Green/Black',
          weight: '233 lbs',
          fuelCapacity: '1.7 gallons',
          suspension: 'Showa 49mm coil-spring fork',
          brakes: 'Front: 270mm disc, Rear: 250mm disc',
          year: 2024
        }
      },
      {
        id: this.storageService.generateId(),
        name: 'Suzuki RM-Z450 2024',
        category: 'bikes',
        price: 9299,
        description: 'The 2024 Suzuki RM-Z450 features updated settings for improved handling, a refined fuel injection system, and Suzuki\'s Holeshot Assist Control. Ready to win out of the crate.',
        images: [
          'https://www.dirtrider.com/wp-content/uploads/2024/03/suzuki-rm-z450-2024-action-1.jpg',
          'https://www.dirtrider.com/wp-content/uploads/2024/03/suzuki-rm-z450-2024-action-2.jpg',
          'https://www.dirtrider.com/wp-content/uploads/2024/03/suzuki-rm-z450-2024-action-3.jpg'
        ],
        stock: 6,
        dateAdded: Date.now() - (8 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'Suzuki',
          model: 'RM-Z450 2024',
          engineSize: '449cc',
          color: 'Yellow/Black',
          weight: '237 lbs',
          fuelCapacity: '1.7 gallons',
          suspension: 'Showa 49mm fork',
          brakes: 'Front: 270mm disc, Rear: 240mm disc',
          year: 2024
        }
      },
      {
        id: this.storageService.generateId(),
        name: 'GasGas MC 450F 2024',
        category: 'bikes',
        price: 9499,
        description: 'The 2024 GasGas MC 450F offers Austrian engineering with WP suspension, Braktec brakes, and a user-friendly power delivery. Perfect for riders of all skill levels.',
        images: [
          'https://motocrossactionmag.com/wp-content/uploads/2024/03/gasgas-mc-450f-2024-action-1.jpg',
          'https://motocrossactionmag.com/wp-content/uploads/2024/03/gasgas-mc-450f-2024-action-2.jpg',
          'https://motocrossactionmag.com/wp-content/uploads/2024/03/gasgas-mc-450f-2024-action-3.jpg'
        ],
        stock: 5,
        dateAdded: Date.now() - (6 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'GasGas',
          model: 'MC 450F 2024',
          engineSize: '449cc',
          color: 'Red/White',
          weight: '233 lbs',
          fuelCapacity: '2.25 gallons',
          suspension: 'WP 48mm fork',
          brakes: 'Braktec Front: 260mm disc, Rear: 220mm disc',
          year: 2024
        }
      },
      {
        id: this.storageService.generateId(),
        name: 'Husqvarna FC 250 2024',
        category: 'bikes',
        price: 8999,
        description: 'The 2024 Husqvarna FC 250 features advanced electronics including launch control and traction control, WP suspension, and Swedish engineering excellence.',
        images: [
          'https://motocrossactionmag.com/wp-content/uploads/2024/03/husqvarna-fc-250-2024-action-1.jpg',
          'https://motocrossactionmag.com/wp-content/uploads/2024/03/husqvarna-fc-250-2024-action-2.jpg',
          'https://motocrossactionmag.com/wp-content/uploads/2024/03/husqvarna-fc-250-2024-action-3.jpg'
        ],
        stock: 4,
        dateAdded: Date.now() - (9 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'Husqvarna',
          model: 'FC 250 2024',
          engineSize: '250cc',
          color: 'White/Blue',
          weight: '218 lbs',
          fuelCapacity: '2.2 gallons',
          suspension: 'WP 48mm fork',
          brakes: 'Brembo Front: 260mm disc, Rear: 220mm disc',
          year: 2024
        }
      },
      {
        id: this.storageService.generateId(),
        name: 'Honda CRF250R 2024',
        category: 'bikes',
        price: 7999,
        description: 'The 2024 Honda CRF250R features updated chassis geometry, improved suspension settings, and enhanced power delivery. Perfect for emerging racers and experienced riders alike.',
        images: [
          'https://www.50grafx.com/products/2021-2023-mc-mxec-125-300-honda-crf250r-2024.jpg',
          'https://www.50grafx.com/products/2021-2023-mc-mxec-125-300-honda-crf250r-2024-side.jpg',
          'https://www.50grafx.com/products/2021-2023-mc-mxec-125-300-honda-crf250r-2024-detail.jpg'
        ],
        stock: 8,
        dateAdded: Date.now() - (11 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'Honda',
          model: 'CRF250R 2024',
          engineSize: '249cc',
          color: 'Red/White',
          weight: '229 lbs',
          fuelCapacity: '1.7 gallons',
          suspension: 'Showa 49mm fork',
          brakes: 'Front: 260mm disc, Rear: 240mm disc',
          year: 2024
        }
      },
      {
        id: this.storageService.generateId(),
        name: 'KTM 250 SX-F 2024',
        category: 'bikes',
        price: 8999,
        description: 'The 2024 KTM 250 SX-F features advanced electronics, WP suspension, and Austrian engineering excellence for championship performance.',
        images: [
          'https://motocrossactionmag.com/wp-content/uploads/2024/03/ktm-250-sxf-2024-action-1.jpg',
          'https://motocrossactionmag.com/wp-content/uploads/2024/03/ktm-250-sxf-2024-action-2.jpg',
          'https://motocrossactionmag.com/wp-content/uploads/2024/03/ktm-250-sxf-2024-action-3.jpg'
        ],
        stock: 6,
        dateAdded: Date.now() - (14 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'KTM',
          model: '250 SX-F 2024',
          engineSize: '249cc',
          color: 'Orange/Black',
          weight: '212 lbs',
          fuelCapacity: '2.25 gallons',
          suspension: 'WP XACT 48mm fork',
          brakes: 'Brembo Front: 260mm disc, Rear: 220mm disc',
          year: 2024
        }
      },
      // Accessories
      {
        id: this.storageService.generateId(),
        name: 'Pro Circuit Helmet',
        category: 'accessory',
        price: 299,
        description: 'Professional-grade motocross helmet with advanced safety features and ventilation system.',
        images: [
          'assets/Bikes/Pro Circuit Helmet.png'
        ],
        stock: 15,
        dateAdded: Date.now() - (15 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'Pro Circuit',
          model: 'Racing Helmet',
          material: 'Carbon Fiber',
          color: 'Black/Red',
          weight: '3.2 lbs',
          safety: 'DOT & ECE Certified',
          features: ['Advanced ventilation', 'Quick-release visor', 'Emergency release system']
        }
      },
      {
        id: this.storageService.generateId(),
        name: 'New Alpinestars Tech 7 Motocross Boots - Flo Yellow',
        category: 'accessory',
        price: 449,
        description: 'Professional motocross boots with superior protection and comfort for long rides.',
        images: [
          'https://files.ekmcdn.com/supermx/images/new-alpinestars-tech-7-motocross-boots-flo-yellow-33633-p.png'
        ],
        stock: 12,
        dateAdded: Date.now() - (12 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'Alpinestars',
          model: 'Tech 10',
          material: 'Microfiber & TPU',
          color: 'White/Black',
          weight: '4.5 lbs per pair',
          features: ['Ankle protection', 'Buckle system', 'Breathable lining']
        }
      },
      {
        id: this.storageService.generateId(),
        name: 'Fox Racing Jersey',
        category: 'accessory',
        price: 79,
        description: 'Lightweight and breathable motocross jersey with moisture-wicking technology.',
        images: [
          'assets/Bikes/Fox Racing Jersey.png'
        ],
        stock: 25,
        dateAdded: Date.now() - (8 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'Fox Racing',
          model: '180 Jersey',
          material: 'Polyester',
          color: 'Black/White',
          features: ['Moisture-wicking', 'Stretch panels', 'Vented mesh']
        }
      },
      {
        id: this.storageService.generateId(),
        name: 'Gloves Pro',
        category: 'accessory',
        price: 49,
        description: 'Professional racing gloves with enhanced grip and protection.',
        images: [
          'assets/Bikes/Racing Gloves.png'
        ],
        stock: 30,
        dateAdded: Date.now() - (6 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'Pro Grip',
          model: 'Racing Gloves',
          material: 'Leather & Mesh',
          color: 'Black',
          features: ['Reinforced palms', 'Touchscreen compatible', 'Velcro closure']
        }
      },
      // Tools
      {
        id: this.storageService.generateId(),
        name: 'Motocross Tool Kit',
        category: 'tool',
        price: 199,
        description: 'Complete tool kit for motocross bike maintenance and repairs.',
        images: [
          'assets/Bikes/Motocross Tool Kit.png'
        ],
        stock: 8,
        dateAdded: Date.now() - (20 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'Motion Pro',
          model: 'Pro Tool Kit',
          includes: ['Socket set', 'Wrenches', 'Screwdrivers', 'Tire tools'],
          features: ['Carrying case', 'Lifetime warranty', 'Professional grade']
        }
      },
      {
        id: this.storageService.generateId(),
        name: 'Tire Changing Stand',
        category: 'tool',
        price: 149,
        description: 'Heavy-duty tire changing stand for motocross bikes.',
        images: [
          'assets/Bikes/Tire Changing Stand.png'
        ],
        stock: 6,
        dateAdded: Date.now() - (18 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'Stand Pro',
          model: 'MX-500',
          material: 'Steel',
          weight: '25 lbs',
          features: ['Adjustable height', 'Wheel locks', 'Tool tray']
        }
      },
      // Souvenirs
      {
        id: this.storageService.generateId(),
        name: 'OUR-Bikes T-Shirt',
        category: 'souvenir',
        price: 29,
        description: 'Premium quality OUR-Bikes store t-shirt with exclusive design.',
        images: [
          'assets/Bikes/OUR-Bikes T-Shirt.png'
        ],
        stock: 50,
        dateAdded: Date.now() - (25 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'OUR-Bikes',
          model: 'Classic Tee',
          material: '100% Cotton',
          sizes: ['S', 'M', 'L', 'XL', 'XXL'],
          features: ['Premium print', 'Comfortable fit', 'Machine washable']
        }
      },
      {
        id: this.storageService.generateId(),
        name: 'Motocross Cap',
        category: 'souvenir',
        price: 19,
        description: 'Stylish motocross cap with OUR-Bikes logo.',
        images: [
          'assets/Bikes/Motocross Cap.png'
        ],
        stock: 40,
        dateAdded: Date.now() - (22 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'OUR-Bikes',
          model: 'MX Cap',
          material: 'Cotton/Polyester',
          color: 'Black/Orange',
          features: ['Adjustable strap', 'Embroidered logo', 'Breathable']
        }
      }
    ];

    this.storageService.setProducts(products);
  }

  // Seed orders
  private seedOrders(): void {
    const orders = [
      {
        id: this.storageService.generateId(),
        userId: 'john.doe@example.com',
        products: [
          {
            productId: this.storageService.generateId(),
            productName: 'Honda CRF450R',
            quantity: 1,
            price: 9999,
            image: 'assets/Bikes/Honda CRF450R.png'
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
            productName: 'KTM 350 SX-F',
            quantity: 1,
            price: 10999,
            image: 'assets/Bikes/KTM 350 SX-F.png'
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
            image: 'https://files.ekmcdn.com/supermx/images/new-alpinestars-tech-7-motocross-boots-flo-yellow-33633-p.png'
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
