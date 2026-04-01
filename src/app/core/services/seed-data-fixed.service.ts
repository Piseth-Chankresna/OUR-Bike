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
          'Bikes/Honda CRF450R 2024.png',
          'Bikes/Honda CRF450R 2024(2).png',
          'Bikes/Honda CRF450R 2024(3).png'
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
          'Bikes/KTM 450 SX-F FACTORY EDITION 2024.png',
          'Bikes/KTM 450 SX-F FACTORY EDITION 2024(2).png',
          'Bikes/KTM 450 SX-F FACTORY EDITION 2024(3).png'
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
          'Bikes/Yamaha YZ250F 2024.png',
          'Bikes/Yamaha YZ250F 2024(2).png',
          'Bikes/Yamaha YZ250F 2024(3).png'
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
          'Bikes/Kawasaki KX450 2024.png',
          'Bikes/Kawasaki KX450 2024(2).png',
          'Bikes/Kawasaki KX450 2024(3).png'
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
          'Bikes/Suzuki RM-Z450 2024.png',
          'Bikes/Suzuki RM-Z450 2024(2).png',
          'Bikes/Suzuki RM-Z450 2024(3).png'
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
          'Bikes/GasGas MC 450F 2024.png',
          'Bikes/GasGas MC 450F 2024(2).png',
          'Bikes/GasGas MC 450F 2024(3).png'
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
          'Bikes/Husqvarna FC 250 2024.png',
          'Bikes/Husqvarna FC 250 2024(2).png',
          'Bikes/Husqvarna FC 250 2024(3).png'
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
          'https://i.ytimg.com/vi/R40YQozjF8w/sddefault.jpg',
          'https://live.staticflickr.com/65535/52654132281_2da23eecf4_b.jpg',
          'https://cdn.dealerspike.com/imglib/v1/800x600/imglib/Assets/Inventory/50/AE/50AEDDB2-8911-4EBB-BA6F-84A9D4ED37F0.jpg'
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
          'Bikes/KTM 250 SX-F 2024.png',
          'Bikes/KTM 250 SX-F 2024(2).png',
          'Bikes/KTM 250 SX-F 2024.png'
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
          'Accessories/Gemini_Generated_Image_e1q4fde1q4fde1q4.png'
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
          'Accessories/Alpinestars Tech 7 Boots.png'
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
          'Accessories/Fox Racing Jersey.png'
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
          'Accessories/Racing Gloves.png'
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
      {
        id: this.storageService.generateId(),
        name: 'Arai MX-V EVO Battle Motocross Helmet - Yellow',
        category: 'accessory',
        price: 599,
        description: 'Premium Arai helmet with advanced safety technology and distinctive yellow battle design.',
        images: [
          'Accessories/Arai MX-V EVO Battle Motocross Helmet - Yellow.png',
          'Accessories/Arai MX-V EVO Battle Motocross Helmet - Yellow(2).png',
          'Accessories/Arai MX-V EVO Battle Motocross Helmet - Yellow(3).png'
        ],
        stock: 8,
        dateAdded: Date.now() - (10 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'Arai',
          model: 'MX-V EVO Battle',
          material: 'Composite Fiber',
          color: 'Yellow/Black',
          weight: '3.1 lbs',
          safety: 'SNELL & ECE Certified',
          features: ['Advanced ventilation', 'Emergency release system', 'Anti-fog visor']
        }
      },
      {
        id: this.storageService.generateId(),
        name: 'New Alpinestars Tech 7 Motocross Boots - Flo Yellow',
        category: 'accessory',
        price: 449,
        description: 'Latest generation Alpinestars Tech 7 boots with vibrant Flo Yellow design and enhanced protection.',
        images: [
          'Accessories/New Alpinestars Tech 7 Motocross Boots - Flo Yellow.png',
          'Accessories/New Alpinestars Tech 7 Motocross Boots - Flo Yellow(2).png'
        ],
        stock: 10,
        dateAdded: Date.now() - (8 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'Alpinestars',
          model: 'Tech 7',
          material: 'Microfiber & TPU',
          color: 'Flo Yellow/Black',
          weight: '4.3 lbs per pair',
          features: ['Ankle protection', 'Buckle system', 'Breathable lining', 'Enhanced grip']
        }
      },
      {
        id: this.storageService.generateId(),
        name: 'OUR-Bikes × Pro Circuit Collaboration Helmet - Limited Edition',
        category: 'accessory',
        price: 899,
        description: 'Ultra-premium collaboration helmet featuring Glassmorphism shell with custom deep green and OUR-Bikes Orange (#fb8c00) graphics. Laser-etched OUR-Bikes signature on brushed metal rear plate. Includes complete motocross gear package: custom gloves, insulated moto-bottle, Pro Circuit suspension components, carbon fiber chest protector, goggles, maintenance toolkit, spare levers, filters, and fueling lines.',
        images: [
          'Accessories/Gemini_Generated_Image_e1q4fde1q4fde1q4.png'
        ],
        stock: 3,
        dateAdded: Date.now() - (2 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'OUR-Bikes × Pro Circuit',
          model: 'Collaboration Limited Edition',
          material: 'Glassmorphism Composite + Carbon Fiber',
          color: 'Deep Green & OUR-Bikes Orange (#fb8c00)',
          weight: '3.0 lbs',
          safety: 'DOT & ECE & SNELL Certified',
          features: [
            'Glassmorphism shell technology',
            'Laser-etched metal signature plate',
            'Pro Circuit logos',
            'Custom OUR-Bikes graphics',
            'Complete gear package included',
            'Limited edition - only 50 units worldwide'
          ],
          includes: [
            'Custom matching gloves',
            'Insulated moto-bottle with laser engraving',
            'Pro Circuit suspension components',
            'Carbon fiber chest protector',
            'Premium goggles',
            'Full maintenance toolkit',
            'Spare levers and filters',
            'Fueling lines and accessories'
          ]
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
          'Tools/Motocross Tool Kit.png'
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
          'Tools/Tire Changing Stand.png'
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
          'Accessories/OUR-Bikes T-Shirt.png'
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
          'Souvenirs/Motocross Cap.png'
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
            image: 'Accessories/Gemini_Generated_Image_e1q4fde1q4fde1q4.png'
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
            image: 'assets/Bikes/Fox Racing Jersey.png'
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
