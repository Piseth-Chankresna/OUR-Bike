import { Injectable } from '@angular/core';
import { BikesDataService, BikeProduct } from './bikes-data.service';
import { AccessoriesDataService, AccessoryProduct } from './accessories-data.service';
import { ToolsDataService, ToolProduct } from './tools-data.service';
import { SouvenirsDataService, SouvenirProduct } from './souvenirs-data.service';

export type ProductType = 'bike' | 'accessory' | 'tool' | 'souvenir';

export interface ProductData {
  id: string;
  name: string;
  category: ProductType;
  price: number;
  description: string;
  frontImage: string; // Single image for grid/list display
  detailImages: string[]; // Multiple images for detail page gallery
  stock: number;
  dateAdded: number;
  specifications: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProductDataCoordinatorService {
  
  constructor(
    private bikesService: BikesDataService,
    private accessoriesService: AccessoriesDataService,
    private toolsService: ToolsDataService,
    private souvenirsService: SouvenirsDataService
  ) {}

  // Get all products from all categories
  getAllProducts(): ProductData[] {
    const bikes = this.bikesService.getBikes().map(this.transformToGenericProduct);
    const accessories = this.accessoriesService.getAccessories().map(this.transformToGenericProduct);
    const tools = this.toolsService.getTools().map(this.transformToGenericProduct);
    const souvenirs = this.souvenirsService.getSouvenirs().map(this.transformToGenericProduct);

    return [...bikes, ...accessories, ...tools, ...souvenirs];
  }

  // Get products by category
  getProductsByCategory(category: ProductType): ProductData[] {
    switch (category) {
      case 'bike':
        return this.bikesService.getBikes().map(this.transformToGenericProduct);
      case 'accessory':
        return this.accessoriesService.getAccessories().map(this.transformToGenericProduct);
      case 'tool':
        return this.toolsService.getTools().map(this.transformToGenericProduct);
      case 'souvenir':
        return this.souvenirsService.getSouvenirs().map(this.transformToGenericProduct);
      default:
        return [];
    }
  }

  // Get product by ID
  getProductById(id: string): ProductData | null {
    const allProducts = this.getAllProducts();
    return allProducts.find(product => product.id === id) || null;
  }

  // Seed all product data
  seedAllProducts(): void {
    console.log('🌱 Seeding all product data...');
    
    this.bikesService.seedBikes();
    this.accessoriesService.seedAccessories();
    this.toolsService.seedTools();
    this.souvenirsService.seedSouvenirs();
    
    console.log('✅ All product data seeded successfully!');
  }

  // Update product images by category
  updateProductImages(category: ProductType, productId: string, frontImage: string, detailImages: string[]): void {
    switch (category) {
      case 'bike':
        this.bikesService.updateBikeImages(productId, frontImage, detailImages);
        break;
      case 'accessory':
        this.accessoriesService.updateAccessoryImages(productId, frontImage, detailImages);
        break;
      case 'tool':
        this.toolsService.updateToolImages(productId, frontImage, detailImages);
        break;
      case 'souvenir':
        this.souvenirsService.updateSouvenirImages(productId, frontImage, detailImages);
        break;
    }
  }

  // Get overall statistics
  getOverallStats(): {
    totalProducts: number;
    totalInStock: number;
    totalValue: number;
    categoryStats: {
      bikes: { total: number; inStock: number; totalValue: number };
      accessories: { total: number; inStock: number; totalValue: number };
      tools: { total: number; inStock: number; totalValue: number };
      souvenirs: { total: number; inStock: number; totalValue: number };
    };
  } {
    const bikeStats = this.bikesService.getBikeStats();
    const accessoryStats = this.accessoriesService.getAccessoryStats();
    const toolStats = this.toolsService.getToolStats();
    const souvenirStats = this.souvenirsService.getSouvenirStats();

    return {
      totalProducts: bikeStats.total + accessoryStats.total + toolStats.total + souvenirStats.total,
      totalInStock: bikeStats.inStock + accessoryStats.inStock + toolStats.inStock + souvenirStats.inStock,
      totalValue: bikeStats.totalValue + accessoryStats.totalValue + toolStats.totalValue + souvenirStats.totalValue,
      categoryStats: {
        bikes: bikeStats,
        accessories: accessoryStats,
        tools: toolStats,
        souvenirs: souvenirStats
      }
    };
  }

  // Transform specific product to generic product
  private transformToGenericProduct(product: BikeProduct | AccessoryProduct | ToolProduct | SouvenirProduct): ProductData {
    return {
      id: product.id,
      name: product.name,
      category: this.getProductCategory(product),
      price: product.price,
      description: product.description,
      frontImage: product.frontImage,
      detailImages: product.detailImages,
      stock: product.stock,
      dateAdded: product.dateAdded,
      specifications: product.specifications
    };
  }

  // Determine product category from product type
  private getProductCategory(product: BikeProduct | AccessoryProduct | ToolProduct | SouvenirProduct): ProductType {
    if ('engineSize' in product.specifications) {
      return 'bike';
    } else if ('material' in product.specifications && !('includes' in product.specifications)) {
      return 'accessory';
    } else if ('includes' in product.specifications) {
      return 'tool';
    } else {
      return 'souvenir';
    }
  }

  // Helper method to get category display name
  getCategoryDisplayName(category: ProductType): string {
    const displayNames = {
      bike: 'Bikes',
      accessory: 'Accessories',
      tool: 'Tools',
      souvenir: 'Souvenirs'
    };
    return displayNames[category];
  }

  // Get all categories
  getAllCategories(): { id: ProductType; name: string }[] {
    return [
      { id: 'bike', name: 'Bikes' },
      { id: 'accessory', name: 'Accessories' },
      { id: 'tool', name: 'Tools' },
      { id: 'souvenir', name: 'Souvenirs' }
    ];
  }
}
