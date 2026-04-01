import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface ToolProduct {
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
    includes?: string[];
    features?: string[];
    material?: string;
    weight?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ToolsDataService {
  
  constructor(private storageService: StorageService) {}

  // Get all tools
  getTools(): ToolProduct[] {
    const products = this.storageService.getProducts() as any[];
    return products.filter(product => product.category === 'tool').map(this.transformToToolProduct);
  }

  // Get tool by ID
  getToolById(id: string): ToolProduct | null {
    const tools = this.getTools();
    return tools.find(tool => tool.id === id) || null;
  }

  // Transform generic product to tool product
  private transformToToolProduct(product: any): ToolProduct {
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

  // Seed tools data
  seedTools(): void {
    const tools: ToolProduct[] = [
      {
        id: this.storageService.generateId(),
        name: 'Motocross Tool Kit',
        price: 199,
        description: 'Complete tool kit for motocross bike maintenance and repairs.',
        frontImage: 'assets/Bikes/Motocross Tool Kit.png',
        detailImages: [
          'assets/Bikes/Motocross Tool Kit.png',
          'https://via.placeholder.com/800x600/cccccc/666666?text=Tool+Kit+Opened',
          'https://via.placeholder.com/800x600/cccccc/666666?text=Tool+Kit+Detail'
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
        price: 149,
        description: 'Heavy-duty tire changing stand for motocross bikes.',
        frontImage: 'assets/Bikes/Tire Changing Stand.png',
        detailImages: [
          'assets/Bikes/Tire Changing Stand.png',
          'https://via.placeholder.com/800x600/cccccc/666666?text=Tire+Stand+Side',
          'https://via.placeholder.com/800x600/cccccc/666666?text=Tire+Stand+Detail'
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
      }
    ];

    // Update existing products or add new ones
    this.updateToolsInStorage(tools);
  }

  // Update tools in storage
  private updateToolsInStorage(tools: ToolProduct[]): void {
    const allProducts = this.storageService.getProducts() as any[];
    const nonToolProducts = allProducts.filter(product => product.category !== 'tool');
    
    // Convert tools back to generic product format
    const toolProducts = tools.map(tool => ({
      id: tool.id,
      name: tool.name,
      category: 'tool',
      price: tool.price,
      description: tool.description,
      images: tool.detailImages,
      stock: tool.stock,
      dateAdded: tool.dateAdded,
      specifications: tool.specifications
    }));

    this.storageService.setProducts([...nonToolProducts, ...toolProducts]);
  }

  // Update tool images
  updateToolImages(toolId: string, frontImage: string, detailImages: string[]): void {
    const tools = this.getTools();
    const toolIndex = tools.findIndex(tool => tool.id === toolId);
    
    if (toolIndex !== -1) {
      tools[toolIndex].frontImage = frontImage;
      tools[toolIndex].detailImages = detailImages;
      this.updateToolsInStorage(tools);
    }
  }

  // Get tool statistics
  getToolStats(): { total: number; inStock: number; totalValue: number } {
    const tools = this.getTools();
    return {
      total: tools.length,
      inStock: tools.filter(tool => tool.stock > 0).length,
      totalValue: tools.reduce((sum, tool) => sum + (tool.price * tool.stock), 0)
    };
  }
}
