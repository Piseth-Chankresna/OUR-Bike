import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastNotificationService {
  private toastSubject = new Subject<ToastMessage>();
  private toastRemoveSubject = new Subject<string>();

  // Observable for components to subscribe to
  get toasts$(): Observable<ToastMessage> {
    return this.toastSubject.asObservable();
  }

  get toastRemove$(): Observable<string> {
    return this.toastRemoveSubject.asObservable();
  }

  // Show toast notification
  showToast(toast: Omit<ToastMessage, 'id'>): string {
    const id = this.generateId();
    const fullToast: ToastMessage = {
      id,
      duration: 4000, // Default 4 seconds
      ...toast
    };

    this.toastSubject.next(fullToast);

    // Auto-remove if not persistent
    if (!fullToast.persistent && fullToast.duration && fullToast.duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, fullToast.duration);
    }

    return id;
  }

  // Remove toast manually
  removeToast(id: string): void {
    this.toastRemoveSubject.next(id);
  }

  // Convenience methods
  showSuccess(title: string, message: string, duration?: number): string {
    return this.showToast({
      type: 'success',
      title,
      message,
      duration
    });
  }

  showError(title: string, message: string, duration?: number): string {
    return this.showToast({
      type: 'error',
      title,
      message,
      duration: duration || 6000 // Errors stay longer
    });
  }

  showWarning(title: string, message: string, duration?: number): string {
    return this.showToast({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  showInfo(title: string, message: string, duration?: number): string {
    return this.showToast({
      type: 'info',
      title,
      message,
      duration
    });
  }

  // E-commerce specific methods
  showAddedToCart(productName: string): string {
    return this.showSuccess(
      'Added to Cart',
      `${productName} has been added to your cart`
    );
  }

  showAddedToFavorites(productName: string): string {
    return this.showSuccess(
      'Added to Favorites',
      `${productName} has been added to your favorites`
    );
  }

  showRemovedFromCart(productName: string): string {
    return this.showInfo(
      'Removed from Cart',
      `${productName} has been removed from your cart`
    );
  }

  showRemovedFromFavorites(productName: string): string {
    return this.showInfo(
      'Removed from Favorites',
      `${productName} has been removed from your favorites`
    );
  }

  showCartUpdated(): string {
    return this.showInfo(
      'Cart Updated',
      'Your cart has been updated successfully'
    );
  }

  showLoginRequired(action: string): string {
    return this.showWarning(
      'Login Required',
      `Please login to ${action}`
    );
  }

  private generateId(): string {
    return `toast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
