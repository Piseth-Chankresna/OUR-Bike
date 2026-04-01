import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface SouvenirProduct {
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
    sizes?: string[];
    features?: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class SouvenirsDataService {
  
  constructor(private storageService: StorageService) {}

  // Get all souvenirs
  getSouvenirs(): SouvenirProduct[] {
    const products = this.storageService.getProducts() as any[];
    return products.filter(product => product.category === 'souvenir').map(this.transformToSouvenirProduct);
  }

  // Get souvenir by ID
  getSouvenirById(id: string): SouvenirProduct | null {
    const souvenirs = this.getSouvenirs();
    return souvenirs.find(souvenir => souvenir.id === id) || null;
  }

  // Transform generic product to souvenir product
  private transformToSouvenirProduct(product: any): SouvenirProduct {
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

  // Seed souvenirs data
  seedSouvenirs(): void {
    const souvenirs: SouvenirProduct[] = [
      {
        id: this.storageService.generateId(),
        name: 'OUR-Bikes T-Shirt',
        price: 29,
        description: 'Premium quality OUR-Bikes store t-shirt with exclusive design.',
        frontImage: 'assets/Bikes/OUR-Bikes T-Shirt.png',
        detailImages: [
          'assets/Bikes/OUR-Bikes T-Shirt.png',
          'https://via.placeholder.com/800x600/cccccc/666666?text=T-Shirt+Back',
          'https://via.placeholder.com/800x600/cccccc/666666?text=T-Shirt+Detail'
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
        price: 19,
        description: 'Stylish motocross cap with OUR-Bikes logo.',
        frontImage: 'assets/Bikes/Motocross Cap.png',
        detailImages: [
          'assets/Bikes/Motocross Cap.png',
          'https://via.placeholder.com/800x600/cccccc/666666?text=Cap+Side',
          'https://via.placeholder.com/800x600/cccccc/666666?text=Cap+Detail'
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

    // Update existing products or add new ones
    this.updateSouvenirsInStorage(souvenirs);
  }

  // Update souvenirs in storage
  private updateSouvenirsInStorage(souvenirs: SouvenirProduct[]): void {
    const allProducts = this.storageService.getProducts() as any[];
    const nonSouvenirProducts = allProducts.filter(product => product.category !== 'souvenir');
    
    // Convert souvenirs back to generic product format
    const souvenirProducts = souvenirs.map(souvenir => ({
      id: souvenir.id,
      name: souvenir.name,
      category: 'souvenir',
      price: souvenir.price,
      description: souvenir.description,
      images: souvenir.detailImages,
      stock: souvenir.stock,
      dateAdded: souvenir.dateAdded,
      specifications: souvenir.specifications
    }));

    this.storageService.setProducts([...nonSouvenirProducts, ...souvenirProducts]);
  }

  // Update souvenir images
  updateSouvenirImages(souvenirId: string, frontImage: string, detailImages: string[]): void {
    const souvenirs = this.getSouvenirs();
    const souvenirIndex = souvenirs.findIndex(souvenir => souvenir.id === souvenirId);
    
    if (souvenirIndex !== -1) {
      souvenirs[souvenirIndex].frontImage = frontImage;
      souvenirs[souvenirIndex].detailImages = detailImages;
      this.updateSouvenirsInStorage(souvenirs);
    }
  }

  // Get souvenir statistics
  getSouvenirStats(): { total: number; inStock: number; totalValue: number } {
    const souvenirs = this.getSouvenirs();
    return {
      total: souvenirs.length,
      inStock: souvenirs.filter(souvenir => souvenir.stock > 0).length,
      totalValue: souvenirs.reduce((sum, souvenir) => sum + (souvenir.price * souvenir.stock), 0)
    };
  }
}
