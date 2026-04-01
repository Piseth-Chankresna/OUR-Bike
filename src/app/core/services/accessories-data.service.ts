import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface AccessoryProduct {
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
    material?: string;
    color?: string;
    weight?: string;
    features?: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class AccessoriesDataService {
  
  constructor(private storageService: StorageService) {}

  // Get all accessories
  getAccessories(): AccessoryProduct[] {
    const products = this.storageService.getProducts() as any[];
    return products.filter(product => product.category === 'accessory').map(this.transformToAccessoryProduct);
  }

  // Get accessory by ID
  getAccessoryById(id: string): AccessoryProduct | null {
    const accessories = this.getAccessories();
    return accessories.find(accessory => accessory.id === id) || null;
  }

  // Transform generic product to accessory product
  private transformToAccessoryProduct(product: any): AccessoryProduct {
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

  // Seed accessories data
  seedAccessories(): void {
    const accessories: AccessoryProduct[] = [
      {
        id: this.storageService.generateId(),
        name: 'Pro Circuit Helmet',
        price: 299,
        description: 'Professional-grade motocross helmet with advanced safety features and ventilation system.',
        frontImage: 'assets/Bikes/Pro Circuit Helmet.png',
        detailImages: [
          'assets/Bikes/Pro Circuit Helmet.png',
          'https://via.placeholder.com/800x600/cccccc/666666?text=Pro+Circuit+Helmet+Side',
          'https://via.placeholder.com/800x600/cccccc/666666?text=Pro+Circuit+Helmet+Detail'
        ],
        stock: 15,
        dateAdded: Date.now() - (15 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'Pro Circuit',
          model: 'Racing Helmet',
          material: 'Carbon Fiber',
          color: 'Black/Red',
          weight: '3.2 lbs',
          features: ['Advanced ventilation', 'Quick-release visor', 'Emergency release system']
        }
      },
      {
        id: this.storageService.generateId(),
        name: 'New Alpinestars Tech 7 Motocross Boots - Flo Yellow',
        price: 449,
        description: 'Professional motocross boots with superior protection and comfort for long rides.',
        frontImage: 'https://files.ekmcdn.com/supermx/images/new-alpinestars-tech-7-motocross-boots-flo-yellow-33633-p.png',
        detailImages: [
          'https://files.ekmcdn.com/supermx/images/new-alpinestars-tech-7-motocross-boots-flo-yellow-33633-p.png',
          'https://via.placeholder.com/800x600/cccccc/666666?text=Alpinestars+Tech+7+Side',
          'https://via.placeholder.com/800x600/cccccc/666666?text=Alpinestars+Tech+7+Detail'
        ],
        stock: 12,
        dateAdded: Date.now() - (12 * 24 * 60 * 60 * 1000),
        specifications: {
          brand: 'Alpinestars',
          model: 'Tech 7',
          material: 'Microfiber & TPU',
          color: 'Yellow/Black',
          weight: '4.5 lbs per pair',
          features: ['Ankle protection', 'Buckle system', 'Breathable lining']
        }
      },
      {
        id: this.storageService.generateId(),
        name: 'Fox Racing Jersey',
        price: 79,
        description: 'Lightweight and breathable motocross jersey with moisture-wicking technology.',
        frontImage: 'https://i.ebayimg.com/images/g/2R4AAeSwgB9n2YEO/s-l1200.jpg',
        detailImages: [
          'https://i.ebayimg.com/images/g/2R4AAeSwgB9n2YEO/s-l1200.jpg',
          'https://via.placeholder.com/800x600/cccccc/666666?text=Fox+Racing+Jersey+Back',
          'https://via.placeholder.com/800x600/cccccc/666666?text=Fox+Racing+Jersey+Detail'
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
        price: 49,
        description: 'Professional racing gloves with enhanced grip and protection.',
        frontImage: 'assets/Bikes/Racing Gloves.png',
        detailImages: [
          'assets/Bikes/Racing Gloves.png',
          'https://via.placeholder.com/800x600/cccccc/666666?text=Racing+Gloves+Side',
          'https://via.placeholder.com/800x600/cccccc/666666?text=Racing+Gloves+Detail'
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
      }
    ];

    // Update existing products or add new ones
    this.updateAccessoriesInStorage(accessories);
  }

  // Update accessories in storage
  private updateAccessoriesInStorage(accessories: AccessoryProduct[]): void {
    const allProducts = this.storageService.getProducts() as any[];
    const nonAccessoryProducts = allProducts.filter(product => product.category !== 'accessory');
    
    // Convert accessories back to generic product format
    const accessoryProducts = accessories.map(accessory => ({
      id: accessory.id,
      name: accessory.name,
      category: 'accessory',
      price: accessory.price,
      description: accessory.description,
      images: accessory.detailImages,
      stock: accessory.stock,
      dateAdded: accessory.dateAdded,
      specifications: accessory.specifications
    }));

    this.storageService.setProducts([...nonAccessoryProducts, ...accessoryProducts]);
  }

  // Update accessory images
  updateAccessoryImages(accessoryId: string, frontImage: string, detailImages: string[]): void {
    const accessories = this.getAccessories();
    const accessoryIndex = accessories.findIndex(accessory => accessory.id === accessoryId);
    
    if (accessoryIndex !== -1) {
      accessories[accessoryIndex].frontImage = frontImage;
      accessories[accessoryIndex].detailImages = detailImages;
      this.updateAccessoriesInStorage(accessories);
    }
  }

  // Get accessory statistics
  getAccessoryStats(): { total: number; inStock: number; totalValue: number } {
    const accessories = this.getAccessories();
    return {
      total: accessories.length,
      inStock: accessories.filter(accessory => accessory.stock > 0).length,
      totalValue: accessories.reduce((sum, accessory) => sum + (accessory.price * accessory.stock), 0)
    };
  }
}
