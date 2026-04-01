import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { AuthService } from './auth.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface DataSyncEvent {
  type: 'cart' | 'favorites' | 'profile' | 'settings';
  action: 'add' | 'remove' | 'update' | 'clear';
  userId: string;
  data?: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class DataSyncService {
  private syncSubject = new Subject<DataSyncEvent>();
  private cartCountSubject = new BehaviorSubject<number>(0);
  private favoritesCountSubject = new BehaviorSubject<number>(0);

  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) {
    this.initializeSync();
  }

  // Observable streams for components to subscribe to
  get cartCount$(): Observable<number> {
    return this.cartCountSubject.asObservable();
  }

  get favoritesCount$(): Observable<number> {
    return this.favoritesCountSubject.asObservable();
  }

  get syncEvents$(): Observable<DataSyncEvent> {
    return this.syncSubject.asObservable();
  }

  private initializeSync(): void {
    // Listen for authentication changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.loadUserCounts(user.userId);
        this.setupStorageListener(user.userId);
      } else {
        this.resetCounts();
      }
    });

    // Listen for cross-tab storage events
    this.setupCrossTabSync();
  }

  private setupStorageListener(userId: string): void {
    // Listen for storage changes in current tab
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;

    localStorage.setItem = (key: string, value: string) => {
      const result = originalSetItem.call(localStorage, key, value);
      
      if (key.includes(`cart_${userId}`)) {
        this.updateCartCount(userId);
        this.syncSubject.next({
          type: 'cart',
          action: 'update',
          userId,
          timestamp: Date.now()
        });
      } else if (key.includes(`favorites_${userId}`)) {
        this.updateFavoritesCount(userId);
        this.syncSubject.next({
          type: 'favorites',
          action: 'update',
          userId,
          timestamp: Date.now()
        });
      }
      
      return result;
    };

    localStorage.removeItem = (key: string) => {
      const result = originalRemoveItem.call(localStorage, key);
      
      if (key.includes(`cart_${userId}`)) {
        this.updateCartCount(userId);
        this.syncSubject.next({
          type: 'cart',
          action: 'clear',
          userId,
          timestamp: Date.now()
        });
      } else if (key.includes(`favorites_${userId}`)) {
        this.updateFavoritesCount(userId);
        this.syncSubject.next({
          type: 'favorites',
          action: 'clear',
          userId,
          timestamp: Date.now()
        });
      }
      
      return result;
    };
  }

  private setupCrossTabSync(): void {
    window.addEventListener('storage', (event) => {
      const currentUser = this.authService.getCurrentUserValue();
      if (!currentUser || !event.key) return;

      if (event.key.includes(`cart_${currentUser.userId}`)) {
        this.updateCartCount(currentUser.userId);
        this.syncSubject.next({
          type: 'cart',
          action: 'update',
          userId: currentUser.userId,
          timestamp: Date.now()
        });
      } else if (event.key.includes(`favorites_${currentUser.userId}`)) {
        this.updateFavoritesCount(currentUser.userId);
        this.syncSubject.next({
          type: 'favorites',
          action: 'update',
          userId: currentUser.userId,
          timestamp: Date.now()
        });
      }
    });
  }

  private loadUserCounts(userId: string): void {
    this.updateCartCount(userId);
    this.updateFavoritesCount(userId);
  }

  private updateCartCount(userId: string): void {
    try {
      const cart = this.storageService.getUserCart(userId);
      const count = cart.items?.length || 0;
      this.cartCountSubject.next(count);
    } catch (error) {
      console.error('Error updating cart count:', error);
      this.cartCountSubject.next(0);
    }
  }

  private updateFavoritesCount(userId: string): void {
    try {
      const favorites = this.storageService.getUserFavorites(userId);
      const count = favorites.productIds?.length || 0;
      this.favoritesCountSubject.next(count);
    } catch (error) {
      console.error('Error updating favorites count:', error);
      this.favoritesCountSubject.next(0);
    }
  }

  private resetCounts(): void {
    this.cartCountSubject.next(0);
    this.favoritesCountSubject.next(0);
  }

  // Public methods for manual updates
  refreshCartCount(userId?: string): void {
    const user = userId ? { userId } : this.authService.getCurrentUserValue();
    if (user) {
      this.updateCartCount(user.userId);
    }
  }

  refreshFavoritesCount(userId?: string): void {
    const user = userId ? { userId } : this.authService.getCurrentUserValue();
    if (user) {
      this.updateFavoritesCount(user.userId);
    }
  }

  // Get current counts
  getCurrentCartCount(): number {
    return this.cartCountSubject.value;
  }

  getCurrentFavoritesCount(): number {
    return this.favoritesCountSubject.value;
  }

  // Manual sync event trigger
  triggerSyncEvent(event: DataSyncEvent): void {
    this.syncSubject.next(event);
    
    // Update counts based on event
    if (event.type === 'cart') {
      this.refreshCartCount(event.userId);
    } else if (event.type === 'favorites') {
      this.refreshFavoritesCount(event.userId);
    }
  }
}
