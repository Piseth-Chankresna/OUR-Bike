import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface BikeProduct {
  id: string;
  name: string;
  price: number;
  description: string;
  frontImage: string; // Single image for grid/list display
  detailImages: string[]; // Multiple images for detail page gallery
  stock: number;
  dateAdded: number;
  specifications: {
    brand: string;
    model: string;
    engineSize: string;
    color: string;
    weight: string;
    fuelCapacity: string;
    suspension: string;
    brakes: string;
    year: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BikesDataService {
  
  constructor(private storageService: StorageService) {}

  // Get all bikes
  getBikes(): BikeProduct[] {
    const products = this.storageService.getProducts() as any[];
    return products.filter(product => product.category === 'bikes').map(this.transformToBikeProduct);
  }

  // Get bike by ID
  getBikeById(id: string): BikeProduct | null {
    const bikes = this.getBikes();
    return bikes.find(bike => bike.id === id) || null;
  }

  // Transform generic product to bike product
  private transformToBikeProduct(product: any): BikeProduct {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      description: product.description,
      frontImage: product.images[0] || 'https://via.placeholder.com/800x600/cccccc/666666?text=No+Image',
      detailImages: product.images || [],
      stock: product.stock || 0,
      dateAdded: product.dateAdded || Date.now(),
      specifications: product.specifications || {}
    };
  }

  // Seed bikes data
  seedBikes(): void {
    const bikes: BikeProduct[] = [
      {
        id: this.storageService.generateId(),
        name: 'Honda CRF450R 2024',
        price: 9999,
        description: 'The 2024 Honda CRF450R is a championship-winning motocross bike with enhanced electronics, updated suspension, and improved ergonomics. Features a 449cc liquid-cooled single-cylinder engine with exceptional power delivery.',
        frontImage: 'https://motocrossactionmag.com/wp-content/uploads/2022/05/2023-Honda-Intro-7282.jpg',
        detailImages: [
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
        price: 11999,
        description: 'The 2024 KTM 450 SX-F FACTORY edition features top-of-the-line components including WP XACT Pro suspension, Brembo brakes, and factory racing graphics. The ultimate racing machine for serious competitors.',
        frontImage: 'https://images.otf3.pixelmotiondemo.com/te9mB-20251015194222.png',
        detailImages: [
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
        price: 8499,
        description: 'The 2024 Yamaha YZ250F features an all-new engine with improved power delivery, updated KYB suspension, and enhanced ergonomics. A proven winner in the 250cc class.',
        frontImage: 'https://www.50grafx.com/products/2021-2023-mc-mxec-125-300-yamaha-yz250f.jpg',
        detailImages: [
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
        price: 9799,
        description: 'The 2024 Kawasaki KX450 features a powerful 449cc engine with dual fuel injection, Showa suspension, and Kawasaki\'s latest traction control system. Built for championship performance.',
        frontImage: 'https://www.dirtrider.com/wp-content/uploads/2024/03/kawasaki-kx450-2024-action-1.jpg',
        detailImages: [
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
        price: 9299,
        description: 'The 2024 Suzuki RM-Z450 features updated settings for improved handling, a refined fuel injection system, and Suzuki\'s Holeshot Assist Control. Ready to win out of the crate.',
        frontImage: 'https://www.dirtrider.com/wp-content/uploads/2024/03/suzuki-rm-z450-2024-action-1.jpg',
        detailImages: [
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
        price: 9499,
        description: 'The 2024 GasGas MC 450F offers Austrian engineering with WP suspension, Braktec brakes, and a user-friendly power delivery. Perfect for riders of all skill levels.',
        frontImage: 'https://motocrossactionmag.com/wp-content/uploads/2024/03/gasgas-mc-450f-2024-action-1.jpg',
        detailImages: [
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
        price: 8999,
        description: 'The 2024 Husqvarna FC 250 features advanced electronics including launch control and traction control, WP suspension, and Swedish engineering excellence.',
        frontImage: 'https://motocrossactionmag.com/wp-content/uploads/2024/03/husqvarna-fc-250-2024-action-1.jpg',
        detailImages: [
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
        price: 7999,
        description: 'The 2024 Honda CRF250R features updated chassis geometry, improved suspension settings, and enhanced power delivery. Perfect for emerging racers and experienced riders alike.',
        frontImage: 'https://i.ytimg.com/vi/R40YQozjF8w/sddefault.jpg',
        detailImages: [
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
        price: 8999,
        description: 'The 2024 KTM 250 SX-F features advanced electronics, WP suspension, and Austrian engineering excellence for championship performance.',
        frontImage: 'https://azwecdnepstoragewebsiteuploads.azureedge.net/PHO_BIKE_PERS_REVO_MY24-KTM-250-SX-F-Front-Rightt-Studio_%23SALL_%23AEPI_%23V1.png',
        detailImages: [
          'https://azwecdnepstoragewebsiteuploads.azureedge.net/PHO_BIKE_PERS_REVO_MY24-KTM-250-SX-F-Front-Rightt-Studio_%23SALL_%23AEPI_%23V1.png',
          'https://via.placeholder.com/800x600/FF6600/FFFFFF?text=KTM+250+SX-F+Side',
          'https://via.placeholder.com/800x600/FF6600/FFFFFF?text=KTM+250+SX-F+Detail'
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
      }
    ];

    // Update existing products or add new ones
    this.updateBikesInStorage(bikes);
  }

  // Update bikes in storage
  private updateBikesInStorage(bikes: BikeProduct[]): void {
    const allProducts = this.storageService.getProducts() as any[];
    const nonBikeProducts = allProducts.filter(product => product.category !== 'bikes');
    
    // Convert bikes back to generic product format
    const bikeProducts = bikes.map(bike => ({
      id: bike.id,
      name: bike.name,
      category: 'bikes',
      price: bike.price,
      description: bike.description,
      images: bike.detailImages,
      stock: bike.stock,
      dateAdded: bike.dateAdded,
      specifications: bike.specifications
    }));

    this.storageService.setProducts([...nonBikeProducts, ...bikeProducts]);
  }

  // Update bike images
  updateBikeImages(bikeId: string, frontImage: string, detailImages: string[]): void {
    const bikes = this.getBikes();
    const bikeIndex = bikes.findIndex(bike => bike.id === bikeId);
    
    if (bikeIndex !== -1) {
      bikes[bikeIndex].frontImage = frontImage;
      bikes[bikeIndex].detailImages = detailImages;
      this.updateBikesInStorage(bikes);
    }
  }

  // Get bike statistics
  getBikeStats(): { total: number; inStock: number; totalValue: number } {
    const bikes = this.getBikes();
    return {
      total: bikes.length,
      inStock: bikes.filter(bike => bike.stock > 0).length,
      totalValue: bikes.reduce((sum, bike) => sum + (bike.price * bike.stock), 0)
    };
  }
}
