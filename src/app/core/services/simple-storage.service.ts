import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SimpleStorageService {
  
  // Direct localStorage methods with no complexity
  setCartData(userId: string, cartData: any): void {
    try {
      const key = `our_bikes_cart_${userId}`;
      localStorage.setItem(key, JSON.stringify(cartData));
      console.log('✅ Cart data saved to localStorage:', key, cartData);
    } catch (error) {
      console.error('❌ Error saving cart data:', error);
    }
  }

  getCartData(userId: string): any {
    try {
      const key = `our_bikes_cart_${userId}`;
      const data = localStorage.getItem(key);
      const result = data ? JSON.parse(data) : { userId, items: [], updatedAt: Date.now() };
      console.log('📦 Cart data loaded from localStorage:', key, result);
      return result;
    } catch (error) {
      console.error('❌ Error loading cart data:', error);
      return { userId, items: [], updatedAt: Date.now() };
    }
  }

  setFavoritesData(userId: string, favoritesData: any): void {
    try {
      const key = `our_bikes_favorites_${userId}`;
      localStorage.setItem(key, JSON.stringify(favoritesData));
      console.log('✅ Favorites data saved to localStorage:', key, favoritesData);
    } catch (error) {
      console.error('❌ Error saving favorites data:', error);
    }
  }

  getFavoritesData(userId: string): any {
    try {
      const key = `our_bikes_favorites_${userId}`;
      const data = localStorage.getItem(key);
      const result = data ? JSON.parse(data) : { userId, productIds: [], updatedAt: Date.now() };
      console.log('❤️ Favorites data loaded from localStorage:', key, result);
      return result;
    } catch (error) {
      console.error('❌ Error loading favorites data:', error);
      return { userId, productIds: [], updatedAt: Date.now() };
    }
  }

  // Add to cart with immediate save
  addToCart(userId: string, productId: string, quantity = 1): boolean {
    try {
      const cart = this.getCartData(userId);
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
      this.setCartData(userId, cart);
      console.log('➕ Product added to cart:', productId);
      return true;
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      return false;
    }
  }

  // Remove from cart with immediate save
  removeFromCart(userId: string, productId: string): boolean {
    try {
      const cart = this.getCartData(userId);
      cart.items = cart.items.filter((item: any) => item.productId !== productId);
      cart.updatedAt = Date.now();
      this.setCartData(userId, cart);
      console.log('➖ Product removed from cart:', productId);
      return true;
    } catch (error) {
      console.error('❌ Error removing from cart:', error);
      return false;
    }
  }

  // Add to favorites with immediate save
  addToFavorites(userId: string, productId: string): boolean {
    try {
      const favorites = this.getFavoritesData(userId);
      
      if (!favorites.productIds.includes(productId)) {
        favorites.productIds.push(productId);
        favorites.updatedAt = Date.now();
        this.setFavoritesData(userId, favorites);
        console.log('❤️ Product added to favorites:', productId);
        return true;
      }
      
      console.log('ℹ️ Product already in favorites:', productId);
      return true; // Already in favorites
    } catch (error) {
      console.error('❌ Error adding to favorites:', error);
      return false;
    }
  }

  // Remove from favorites with immediate save
  removeFromFavorites(userId: string, productId: string): boolean {
    try {
      const favorites = this.getFavoritesData(userId);
      favorites.productIds = favorites.productIds.filter((id: string) => id !== productId);
      favorites.updatedAt = Date.now();
      this.setFavoritesData(userId, favorites);
      console.log('💔 Product removed from favorites:', productId);
      return true;
    } catch (error) {
      console.error('❌ Error removing from favorites:', error);
      return false;
    }
  }

  // Get counts directly
  getCartCount(userId: string): number {
    const cart = this.getCartData(userId);
    return cart.items?.length || 0;
  }

  getFavoritesCount(userId: string): number {
    const favorites = this.getFavoritesData(userId);
    return favorites.productIds?.length || 0;
  }

  // Debug: Show all localStorage data
  debugStorage(): void {
    console.log('🔍 All localStorage data:');
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('our_bikes')) {
        const value = localStorage.getItem(key);
        console.log(`  ${key}:`, value ? JSON.parse(value) : 'null');
      }
    }
  }
}
