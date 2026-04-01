import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Product } from '../models';

export interface RecentlyViewedItem {
  productId: string;
  product: Product;
  viewedAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class RecentlyViewedService {
  private readonly STORAGE_KEY = 'our_bikes_recently_viewed';
  private readonly MAX_ITEMS = 20;
  private readonly EXPIRY_HOURS = 24; // Items expire after 24 hours

  constructor(private storageService: StorageService) {}

  // Add product to recently viewed
  addToRecentlyViewed(productId: string, product: Product): void {
    try {
      const recentlyViewed = this.getRecentlyViewed();
      
      // Remove existing entry for this product if it exists
      const filteredItems = recentlyViewed.filter(item => item.productId !== productId);
      
      // Add new entry at the beginning
      const newItem: RecentlyViewedItem = {
        productId,
        product,
        viewedAt: Date.now()
      };
      
      filteredItems.unshift(newItem);
      
      // Keep only the most recent items and remove expired items
      const validItems = this.filterAndLimitItems(filteredItems);
      
      this.storageService.set(this.STORAGE_KEY, validItems);
    } catch (error) {
      console.error('Error adding to recently viewed:', error);
    }
  }

  // Get recently viewed items
  getRecentlyViewed(): RecentlyViewedItem[] {
    try {
      const items = this.storageService.get(this.STORAGE_KEY) as RecentlyViewedItem[] || [];
      return this.filterAndLimitItems(items);
    } catch (error) {
      console.error('Error getting recently viewed:', error);
      return [];
    }
  }

  // Clear recently viewed items
  clearRecentlyViewed(): void {
    try {
      this.storageService.remove(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing recently viewed:', error);
    }
  }

  // Remove specific item from recently viewed
  removeFromRecentlyViewed(productId: string): void {
    try {
      const items = this.getRecentlyViewed();
      const filteredItems = items.filter(item => item.productId !== productId);
      this.storageService.set(this.STORAGE_KEY, filteredItems);
    } catch (error) {
      console.error('Error removing from recently viewed:', error);
    }
  }

  // Get recently viewed products (full product objects)
  getRecentlyViewedProducts(): Product[] {
    try {
      const items = this.getRecentlyViewed();
      const allProducts = this.storageService.get('PRODUCTS') as Product[] || [];
      
      return items
        .map(item => {
          const product = allProducts.find(p => p.id === item.productId);
          return product ? {
            ...product,
            viewedAt: item.viewedAt
          } : null;
        })
        .filter(product => product !== null) as Product[];
    } catch (error) {
      console.error('Error getting recently viewed products:', error);
      return [];
    }
  }

  // Filter expired items and limit to max items
  private filterAndLimitItems(items: RecentlyViewedItem[]): RecentlyViewedItem[] {
    const now = Date.now();
    const expiryTime = this.EXPIRY_HOURS * 60 * 60 * 1000; // Convert to milliseconds
    
    // Remove expired items
    const validItems = items.filter(item => (now - item.viewedAt) < expiryTime);
    
    // Limit to max items
    return validItems.slice(0, this.MAX_ITEMS);
  }

  // Get recently viewed items for a specific user (if user-specific tracking is needed)
  getUserRecentlyViewed(userId?: string): RecentlyViewedItem[] {
    if (!userId) {
      return this.getRecentlyViewed();
    }

    try {
      const userKey = `${this.STORAGE_KEY}_${userId}`;
      const items = this.storageService.get(userKey) as RecentlyViewedItem[] || [];
      return this.filterAndLimitItems(items);
    } catch (error) {
      console.error('Error getting user recently viewed:', error);
      return [];
    }
  }

  // Add product to user-specific recently viewed
  addUserRecentlyViewed(userId: string, productId: string, product: Product): void {
    if (!userId) return;

    try {
      const userKey = `${this.STORAGE_KEY}_${userId}`;
      const recentlyViewed = this.getUserRecentlyViewed(userId);
      
      // Remove existing entry for this product if it exists
      const filteredItems = recentlyViewed.filter(item => item.productId !== productId);
      
      // Add new entry at the beginning
      const newItem: RecentlyViewedItem = {
        productId,
        product,
        viewedAt: Date.now()
      };
      
      filteredItems.unshift(newItem);
      
      // Keep only the most recent items and remove expired items
      const validItems = this.filterAndLimitItems(filteredItems);
      
      this.storageService.set(userKey, validItems);
    } catch (error) {
      console.error('Error adding to user recently viewed:', error);
    }
  }

  // Get statistics about recently viewed items
  getRecentlyViewedStats(userId?: string): {
    totalItems: number;
    uniqueProducts: number;
    averageViewingInterval: number;
    mostViewedCategory: string;
  } {
    const items = userId ? this.getUserRecentlyViewed(userId) : this.getRecentlyViewed();
    
    if (items.length === 0) {
      return {
        totalItems: 0,
        uniqueProducts: 0,
        averageViewingInterval: 0,
        mostViewedCategory: 'N/A'
      };
    }

    const uniqueProductIds = [...new Set(items.map(item => item.productId))];
    
    // Calculate average viewing interval
    let totalInterval = 0;
    let intervalCount = 0;
    
    for (let i = 0; i < items.length - 1; i++) {
      const interval = items[i].viewedAt - items[i + 1].viewedAt;
      totalInterval += Math.abs(interval);
      intervalCount++;
    }
    
    const averageInterval = intervalCount > 0 ? totalInterval / intervalCount : 0;
    
    // Find most viewed category
    const products = this.getRecentlyViewedProducts();
    const categoryCount: Record<string, number> = {};
    
    products.forEach(product => {
      if (product) {
        categoryCount[product.category] = (categoryCount[product.category] || 0) + 1;
      }
    });
    
    const mostViewedCategory = Object.keys(categoryCount).reduce((a, b) => 
      categoryCount[a] > (categoryCount[b] || 0) ? a : b, 'N/A'
    );

    return {
      totalItems: items.length,
      uniqueProducts: uniqueProductIds.length,
      averageViewingInterval: averageInterval,
      mostViewedCategory
    };
  }

  // Export recently viewed data
  exportRecentlyViewed(userId?: string): void {
    const items = userId ? this.getUserRecentlyViewed(userId) : this.getRecentlyViewed();
    
    if (items.length === 0) {
      console.log('No recently viewed items to export');
      return;
    }

    const exportData = {
      items: items.map(item => ({
        productId: item.productId,
        productName: item.product.name,
        category: item.product.category,
        price: item.product.price,
        viewedAt: new Date(item.viewedAt).toISOString()
      })),
      exportDate: new Date().toISOString(),
      statistics: this.getRecentlyViewedStats(userId)
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recently-viewed-${userId || 'global'}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Clean up expired items
  cleanupExpiredItems(): void {
    try {
      const items = this.getRecentlyViewed();
      const validItems = this.filterAndLimitItems(items);
      
      if (validItems.length !== items.length) {
        this.storageService.set(this.STORAGE_KEY, validItems);
        console.log(`Cleaned up ${items.length - validItems.length} expired recently viewed items`);
      }
    } catch (error) {
      console.error('Error cleaning up expired items:', error);
    }
  }
}
