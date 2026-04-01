import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class ComparisonService {
  private readonly STORAGE_KEY = 'our_bikes_product_comparison';

  constructor(private storageService: StorageService) {}

  // Get comparison list for a user
  getComparisonList(userId: string): string[] {
    try {
      const comparisonData = this.storageService.get(`${this.STORAGE_KEY}_${userId}`) as any || {};
      return comparisonData.productIds || [];
    } catch (error) {
      console.error('Error getting comparison list:', error);
      return [];
    }
  }

  // Save comparison list for a user
  saveComparisonList(userId: string, productIds: string[]): boolean {
    try {
      const comparisonData = {
        userId,
        productIds,
        updatedAt: Date.now()
      };
      return this.storageService.set(`${this.STORAGE_KEY}_${userId}`, comparisonData);
    } catch (error) {
      console.error('Error saving comparison list:', error);
      return false;
    }
  }

  // Add product to comparison
  addToComparison(userId: string, productId: string): boolean {
    try {
      const currentList = this.getComparisonList(userId);
      
      // Check if product is already in comparison
      if (currentList.includes(productId)) {
        return false; // Already in comparison
      }
      
      // Limit comparison to 4 products
      if (currentList.length >= 4) {
        alert('You can compare up to 4 products at a time');
        return false;
      }
      
      // Add product to comparison
      const newList = [...currentList, productId];
      return this.saveComparisonList(userId, newList);
    } catch (error) {
      console.error('Error adding to comparison:', error);
      return false;
    }
  }

  // Remove product from comparison
  removeFromComparison(userId: string, productId: string): boolean {
    try {
      const currentList = this.getComparisonList(userId);
      const newList = currentList.filter(id => id !== productId);
      return this.saveComparisonList(userId, newList);
    } catch (error) {
      console.error('Error removing from comparison:', error);
      return false;
    }
  }

  // Clear comparison list
  clearComparison(userId: string): boolean {
    try {
      return this.storageService.remove(`${this.STORAGE_KEY}_${userId}`);
    } catch (error) {
      console.error('Error clearing comparison:', error);
      return false;
    }
  }

  // Check if product is in comparison
  isInComparison(userId: string, productId: string): boolean {
    const comparisonList = this.getComparisonList(userId);
    return comparisonList.includes(productId);
  }

  // Get comparison count
  getComparisonCount(userId: string): number {
    return this.getComparisonList(userId).length;
  }

  // Get comparison products with full details
  getComparisonProducts(userId: string): any[] {
    try {
      const productIds = this.getComparisonList(userId);
      const allProducts = this.storageService.getProducts() as any[] || [];
      
      return productIds
        .map(id => allProducts.find(p => p.id === id))
        .filter(product => product !== undefined);
    } catch (error) {
      console.error('Error getting comparison products:', error);
      return [];
    }
  }
}
