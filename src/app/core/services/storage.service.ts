import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ApiResponse } from '../models';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly KEYS = {
    USERS: 'our_bikes_users',
    PRODUCTS: 'our_bikes_products',
    ORDERS: 'our_bikes_orders',
    SESSION: 'our_bikes_session',
    SETTINGS: 'our_bikes_settings'
  } as const;

  private storageAvailable$ = new BehaviorSubject<boolean>(this.isStorageAvailable());

  constructor() {
    // Check storage availability periodically
    setInterval(() => {
      this.storageAvailable$.next(this.isStorageAvailable());
    }, 5000);
  }

  // Check if localStorage is available
  private isStorageAvailable(): boolean {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Get storage availability as observable
  getStorageAvailability(): Observable<boolean> {
    return this.storageAvailable$.asObservable();
  }

  // Generic get method
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from localStorage:`, error);
      return null;
    }
  }

  // Generic set method
  set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item in localStorage:`, error);
      return false;
    }
  }

  // Generic remove method
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item from localStorage:`, error);
      return false;
    }
  }

  // Clear all storage
  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error(`Error clearing localStorage:`, error);
      return false;
    }
  }

  // Get all keys
  getAllKeys(): string[] {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error(`Error getting localStorage keys:`, error);
      return [];
    }
  }

  // Get storage size (approximate)
  getStorageSize(): { used: number; available: number; percentage: number } {
    try {
      let used = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }
      // Typical localStorage limit is 5-10MB, using 5MB as baseline
      const available = 5 * 1024 * 1024; // 5MB in bytes
      const percentage = (used / available) * 100;
      
      return { used, available, percentage };
    } catch (error) {
      console.error(`Error calculating storage size:`, error);
      return { used: 0, available: 0, percentage: 0 };
    }
  }

  // Export data to JSON
  exportData(): Record<string, any> {
    const data: Record<string, any> = {};
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('our_bikes_')) {
          data[key] = this.get(key);
        }
      }
      return data;
    } catch (error) {
      console.error(`Error exporting data:`, error);
      return {};
    }
  }

  // Import data from JSON
  importData(data: Record<string, any>): ApiResponse<boolean> {
    try {
      for (const key in data) {
        if (key.startsWith('our_bikes_')) {
          this.set(key, data[key]);
        }
      }
      return { success: true, data: true, message: 'Data imported successfully' };
    } catch (error) {
      return { 
        success: false, 
        error: 'Failed to import data', 
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Specific methods for our collections
  getUsers() {
    return this.get(this.KEYS.USERS) || [];
  }

  setUsers(users: any[]): boolean {
    return this.set(this.KEYS.USERS, users);
  }

  getProducts() {
    return this.get(this.KEYS.PRODUCTS) || [];
  }

  setProducts(products: any[]): boolean {
    return this.set(this.KEYS.PRODUCTS, products);
  }

  getOrders() {
    return this.get(this.KEYS.ORDERS) || [];
  }

  setOrders(orders: any[]): boolean {
    return this.set(this.KEYS.ORDERS, orders);
  }

  getSession() {
    return this.get(this.KEYS.SESSION);
  }

  setSession(session: any): boolean {
    return this.set(this.KEYS.SESSION, session);
  }

  removeSession(): boolean {
    return this.remove(this.KEYS.SESSION);
  }

  getSettings() {
    return this.get(this.KEYS.SETTINGS) || {
      theme: { isDarkMode: true, primaryColor: '#ff6b35', secondaryColor: '#f7931e' },
      language: 'en',
      currency: 'USD',
      notifications: true
    };
  }

  setSettings(settings: any): boolean {
    return this.set(this.KEYS.SETTINGS, settings);
  }

  // Get user-specific data
  getUserCart(userId: string): any {
    return this.get(`our_bikes_cart_${userId}`) || { userId, items: [], updatedAt: Date.now() };
  }

  setUserCart(userId: string, cart: any): boolean {
    return this.set(`our_bikes_cart_${userId}`, cart);
  }

  removeUserCart(userId: string): boolean {
    return this.remove(`our_bikes_cart_${userId}`);
  }

  getUserFavorites(userId: string): any {
    return this.get(`our_bikes_favorites_${userId}`) || { userId, productIds: [], updatedAt: Date.now() };
  }

  setUserFavorites(userId: string, favorites: any): boolean {
    return this.set(`our_bikes_favorites_${userId}`, favorites);
  }

  removeUserFavorites(userId: string): boolean {
    return this.remove(`our_bikes_favorites_${userId}`);
  }

  // Cart Management Methods
  addToCart(userId: string, productId: string, quantity = 1): boolean {
    try {
      const cart = this.getUserCart(userId);
      const existingItem = cart.items.find((item: any) => item.productId === productId);
      
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({
          productId,
          quantity,
          dateAdded: Date.now()
        });
      }
      
      cart.updatedAt = Date.now();
      return this.setUserCart(userId, cart);
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }

  removeFromCart(userId: string, productId: string): boolean {
    try {
      const cart = this.getUserCart(userId);
      cart.items = cart.items.filter((item: any) => item.productId !== productId);
      cart.updatedAt = Date.now();
      return this.setUserCart(userId, cart);
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }

  // Favorites Management Methods
  addToFavorites(userId: string, productId: string): boolean {
    try {
      const favorites = this.getUserFavorites(userId);
      
      if (!favorites.productIds.includes(productId)) {
        favorites.productIds.push(productId);
        favorites.updatedAt = Date.now();
        return this.setUserFavorites(userId, favorites);
      }
      
      return true; // Already in favorites
    } catch (error) {
      console.error('Error adding to favorites:', error);
      return false;
    }
  }

  removeFromFavorites(userId: string, productId: string): boolean {
    try {
      const favorites = this.getUserFavorites(userId);
      favorites.productIds = favorites.productIds.filter((id: string) => id !== productId);
      favorites.updatedAt = Date.now();
      return this.setUserFavorites(userId, favorites);
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  clearUserFavorites(userId: string): boolean {
    try {
      const favorites = {
        userId,
        productIds: [],
        updatedAt: Date.now()
      };
      return this.setUserFavorites(userId, favorites);
    } catch (error) {
      console.error('Error clearing favorites:', error);
      return false;
    }
  }

  // Address Management Methods
  getUserAddresses(userId: string): any[] {
    return this.get(`our_bikes_addresses_${userId}`) || [];
  }

  setUserAddresses(userId: string, addresses: any[]): boolean {
    try {
      const addressData = {
        userId,
        addresses,
        updatedAt: Date.now()
      };
      return this.set(`our_bikes_addresses_${userId}`, addressData);
    } catch (error) {
      console.error('Error saving addresses:', error);
      return false;
    }
  }

  removeUserAddresses(userId: string): boolean {
    return this.remove(`our_bikes_addresses_${userId}`);
  }

  getComments() {
    return this.get('our_bikes_comments') || [];
  }

  setComments(comments: any[]): boolean {
    return this.set('our_bikes_comments', comments);
  }

  // Utility method to generate unique IDs
  generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Backup and restore functionality
  createBackup(): string {
    return JSON.stringify(this.exportData());
  }

  restoreFromBackup(backupString: string): ApiResponse<boolean> {
    try {
      const data = JSON.parse(backupString);
      return this.importData(data);
    } catch (error) {
      return { 
        success: false, 
        error: 'Invalid backup format', 
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
