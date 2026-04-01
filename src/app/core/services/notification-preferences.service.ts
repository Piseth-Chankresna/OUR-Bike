import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable } from 'rxjs';

export interface NotificationPreferences {
  userId: string;
  emailNotifications: EmailNotificationSettings;
  pushNotifications: PushNotificationSettings;
  inAppNotifications: InAppNotificationSettings;
  categories: NotificationCategorySettings;
  frequency: NotificationFrequencySettings;
  quietHours: QuietHoursSettings;
  updatedAt: number;
}

export interface EmailNotificationSettings {
  enabled: boolean;
  emailAddress: string;
  orderUpdates: boolean;
  priceAlerts: boolean;
  promotionalOffers: boolean;
  newsletter: boolean;
  accountSecurity: boolean;
  wishlistUpdates: boolean;
  reviewRequests: boolean;
}

export interface PushNotificationSettings {
  enabled: boolean;
  orderUpdates: boolean;
  priceAlerts: boolean;
  promotionalOffers: boolean;
  accountSecurity: boolean;
  wishlistUpdates: boolean;
  deliveryUpdates: boolean;
}

export interface InAppNotificationSettings {
  enabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  desktopNotifications: boolean;
  autoMarkAsRead: boolean;
  showPreview: boolean;
  maxNotifications: number;
}

export interface NotificationCategorySettings {
  orders: boolean;
  favorites: boolean;
  cart: boolean;
  account: boolean;
  promotions: boolean;
  reviews: boolean;
  wishlist: boolean;
  system: boolean;
}

export interface NotificationFrequencySettings {
  immediate: boolean;
  hourly: boolean;
  daily: boolean;
  weekly: boolean;
  maxPerDay: number;
  maxPerHour: number;
}

export interface QuietHoursSettings {
  enabled: boolean;
  startTime: string; // HH:MM format
  endTime: string;   // HH:MM format
  timezone: string;
  weekendsOnly: boolean;
  emergencyOnly: boolean;
}

export interface NotificationTemplate {
  id: string;
  type: 'email' | 'push' | 'inapp';
  category: string;
  title: string;
  body: string;
  variables: string[];
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationPreferencesService {
  private readonly STORAGE_KEY = 'our_bikes_notification_preferences';
  private readonly TEMPLATES_KEY = 'our_bikes_notification_templates';
  
  private preferences$ = new BehaviorSubject<NotificationPreferences | null>(null);
  private templates$ = new BehaviorSubject<NotificationTemplate[]>([]);

  constructor(private storageService: StorageService) {}

  // Get preferences as observable
  getPreferences(): Observable<NotificationPreferences | null> {
    return this.preferences$.asObservable();
  }

  // Get templates as observable
  getTemplates(): Observable<NotificationTemplate[]> {
    return this.templates$.asObservable();
  }

  // Load user preferences
  loadPreferences(userId: string): void {
    try {
      const preferences = this.getUserPreferences(userId);
      this.preferences$.next(preferences);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
      this.preferences$.next(null);
    }
  }

  // Get user preferences from storage
  getUserPreferences(userId: string): NotificationPreferences {
    try {
      const stored = this.storageService.get(`${this.STORAGE_KEY}_${userId}`) as NotificationPreferences;
      
      if (stored) {
        return stored;
      }

      // Return default preferences if none exist
      return this.getDefaultPreferences(userId);
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return this.getDefaultPreferences(userId);
    }
  }

  // Get default preferences
  private getDefaultPreferences(userId: string): NotificationPreferences {
    const now = Date.now();
    return {
      userId,
      emailNotifications: {
        enabled: true,
        emailAddress: '',
        orderUpdates: true,
        priceAlerts: true,
        promotionalOffers: false,
        newsletter: false,
        accountSecurity: true,
        wishlistUpdates: true,
        reviewRequests: true
      },
      pushNotifications: {
        enabled: true,
        orderUpdates: true,
        priceAlerts: true,
        promotionalOffers: false,
        accountSecurity: true,
        wishlistUpdates: true,
        deliveryUpdates: true
      },
      inAppNotifications: {
        enabled: true,
        soundEnabled: true,
        vibrationEnabled: false,
        desktopNotifications: true,
        autoMarkAsRead: false,
        showPreview: true,
        maxNotifications: 50
      },
      categories: {
        orders: true,
        favorites: true,
        cart: true,
        account: true,
        promotions: false,
        reviews: true,
        wishlist: true,
        system: true
      },
      frequency: {
        immediate: true,
        hourly: false,
        daily: false,
        weekly: false,
        maxPerDay: 20,
        maxPerHour: 5
      },
      quietHours: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00',
        timezone: 'UTC',
        weekendsOnly: false,
        emergencyOnly: false
      },
      updatedAt: now
    };
  }

  // Save user preferences
  savePreferences(preferences: NotificationPreferences): boolean {
    try {
      const updatedPreferences = {
        ...preferences,
        updatedAt: Date.now()
      };

      const success = this.storageService.set(
        `${this.STORAGE_KEY}_${preferences.userId}`,
        updatedPreferences
      );

      if (success) {
        this.preferences$.next(updatedPreferences);
      }

      return success;
    } catch (error) {
      console.error('Error saving notification preferences:', error);
      return false;
    }
  }

  // Update specific preference section
  updatePreferences(userId: string, section: keyof NotificationPreferences, updates: any): boolean {
    try {
      const current = this.getUserPreferences(userId);
      const updated = {
        ...current,
        [section]: { ...(current as any)[section], ...updates },
        updatedAt: Date.now()
      };

      return this.savePreferences(updated);
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      return false;
    }
  }

  // Check if notification type is enabled
  isNotificationEnabled(userId: string, category: keyof NotificationCategorySettings, type: 'email' | 'push' | 'inapp'): boolean {
    try {
      const preferences = this.getUserPreferences(userId);
      
      // Check category is enabled
      if (!preferences.categories[category]) {
        return false;
      }

      // Check specific type is enabled
      switch (type) {
        case 'email':
          return preferences.emailNotifications.enabled;
        case 'push':
          return preferences.pushNotifications.enabled;
        case 'inapp':
          return preferences.inAppNotifications.enabled;
        default:
          return false;
      }
    } catch (error) {
      console.error('Error checking notification enabled:', error);
      return false;
    }
  }

  // Check if current time is within quiet hours
  isInQuietHours(userId: string): boolean {
    try {
      const preferences = this.getUserPreferences(userId);
      
      if (!preferences.quietHours.enabled) {
        return false;
      }

      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      
      const [startHour, startMin] = preferences.quietHours.startTime.split(':').map(Number);
      const [endHour, endMin] = preferences.quietHours.endTime.split(':').map(Number);
      
      const startTime = startHour * 60 + startMin;
      const endTime = endHour * 60 + endMin;

      // Handle overnight quiet hours (e.g., 22:00 to 08:00)
      if (startTime > endTime) {
        return currentTime >= startTime || currentTime <= endTime;
      } else {
        return currentTime >= startTime && currentTime <= endTime;
      }
    } catch (error) {
      console.error('Error checking quiet hours:', error);
      return false;
    }
  }

  // Check if notification frequency limit reached
  isFrequencyLimitReached(userId: string): boolean {
    try {
      const preferences = this.getUserPreferences(userId);
      
      if (preferences.frequency.immediate) {
        return false;
      }

      // This would typically check against a notification log
      // For now, return false to allow notifications
      return false;
    } catch (error) {
      console.error('Error checking frequency limit:', error);
      return false;
    }
  }

  // Load notification templates
  loadTemplates(): void {
    try {
      const templates = this.getNotificationTemplates();
      this.templates$.next(templates);
    } catch (error) {
      console.error('Error loading notification templates:', error);
      this.templates$.next([]);
    }
  }

  // Get notification templates
  getNotificationTemplates(): NotificationTemplate[] {
    try {
      const stored = this.storageService.get(this.TEMPLATES_KEY) as NotificationTemplate[];
      
      if (stored && stored.length > 0) {
        return stored;
      }

      // Return default templates
      return this.getDefaultTemplates();
    } catch (error) {
      console.error('Error getting notification templates:', error);
      return this.getDefaultTemplates();
    }
  }

  // Get default templates
  private getDefaultTemplates(): NotificationTemplate[] {
    return [
      {
        id: 'order_placed',
        type: 'email',
        category: 'orders',
        title: 'Order Placed Successfully',
        body: 'Your order {{orderNumber}} has been placed successfully. Total amount: {{orderAmount}}.',
        variables: ['orderNumber', 'orderAmount'],
        enabled: true
      },
      {
        id: 'order_shipped',
        type: 'email',
        category: 'orders',
        title: 'Order Shipped',
        body: 'Your order {{orderNumber}} has been shipped. Tracking number: {{trackingNumber}}.',
        variables: ['orderNumber', 'trackingNumber'],
        enabled: true
      },
      {
        id: 'price_alert',
        type: 'email',
        category: 'promotions',
        title: 'Price Drop Alert',
        body: 'The price of {{productName}} has dropped to {{newPrice}} from {{oldPrice}}.',
        variables: ['productName', 'newPrice', 'oldPrice'],
        enabled: true
      },
      {
        id: 'wishlist_shared',
        type: 'inapp',
        category: 'wishlist',
        title: 'Wishlist Shared',
        body: '{{userName}} shared their wishlist with {{productCount}} products.',
        variables: ['userName', 'productCount'],
        enabled: true
      },
      {
        id: 'review_request',
        type: 'email',
        category: 'reviews',
        title: 'Review Your Purchase',
        body: 'How was your experience with {{productName}}? Share your review!',
        variables: ['productName'],
        enabled: true
      }
    ];
  }

  // Save notification templates
  saveTemplates(templates: NotificationTemplate[]): boolean {
    try {
      return this.storageService.set(this.TEMPLATES_KEY, templates);
    } catch (error) {
      console.error('Error saving notification templates:', error);
      return false;
    }
  }

  // Update template
  updateTemplate(templateId: string, updates: Partial<NotificationTemplate>): boolean {
    try {
      const templates = this.getNotificationTemplates();
      const index = templates.findIndex(t => t.id === templateId);
      
      if (index === -1) {
        return false;
      }

      templates[index] = { ...templates[index], ...updates };
      return this.saveTemplates(templates);
    } catch (error) {
      console.error('Error updating notification template:', error);
      return false;
    }
  }

  // Get notification statistics
  getNotificationStats(userId: string): {
    totalEnabled: number;
    emailEnabled: number;
    pushEnabled: number;
    inAppEnabled: number;
    categoriesEnabled: number;
    quietHoursActive: boolean;
  } {
    try {
      const preferences = this.getUserPreferences(userId);
      
      const emailEnabled = Object.values(preferences.emailNotifications).filter(v => typeof v === 'boolean' && v).length;
      const pushEnabled = Object.values(preferences.pushNotifications).filter(v => typeof v === 'boolean' && v).length;
      const inAppEnabled = Object.values(preferences.inAppNotifications).filter(v => typeof v === 'boolean' && v).length;
      const categoriesEnabled = Object.values(preferences.categories).filter(v => v).length;
      
      const totalEnabled = emailEnabled + pushEnabled + inAppEnabled + categoriesEnabled;

      return {
        totalEnabled,
        emailEnabled,
        pushEnabled,
        inAppEnabled,
        categoriesEnabled,
        quietHoursActive: preferences.quietHours.enabled
      };
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return {
        totalEnabled: 0,
        emailEnabled: 0,
        pushEnabled: 0,
        inAppEnabled: 0,
        categoriesEnabled: 0,
        quietHoursActive: false
      };
    }
  }

  // Reset preferences to default
  resetToDefault(userId: string): boolean {
    try {
      const defaultPreferences = this.getDefaultPreferences(userId);
      return this.savePreferences(defaultPreferences);
    } catch (error) {
      console.error('Error resetting notification preferences:', error);
      return false;
    }
  }

  // Export preferences
  exportPreferences(userId: string): string | null {
    try {
      const preferences = this.getUserPreferences(userId);
      return JSON.stringify(preferences, null, 2);
    } catch (error) {
      console.error('Error exporting notification preferences:', error);
      return null;
    }
  }

  // Import preferences
  importPreferences(userId: string, preferencesJson: string): boolean {
    try {
      const preferences = JSON.parse(preferencesJson) as NotificationPreferences;
      
      // Validate required fields
      if (!preferences.userId || !preferences.emailNotifications || !preferences.pushNotifications) {
        throw new Error('Invalid preferences format');
      }

      // Set the correct userId
      preferences.userId = userId;
      preferences.updatedAt = Date.now();

      return this.savePreferences(preferences);
    } catch (error) {
      console.error('Error importing notification preferences:', error);
      return false;
    }
  }
}
