import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'order' | 'review' | 'promotion' | 'system';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: number;
  timestamp: number;
  expiresAt?: number;
  actionUrl?: string;
  actionText?: string;
  priority: 'low' | 'medium' | 'high';
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  orders: boolean;
  reviews: boolean;
  promotions: boolean;
  system: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly STORAGE_KEY = 'our_bikes_notifications';
  private readonly SETTINGS_KEY = 'our_bikes_notification_settings';

  constructor(private storageService: StorageService) {}

  // Get all notifications for a user
  getNotifications(userId: string): Notification[] {
    try {
      const allNotifications = this.storageService.get(this.STORAGE_KEY) as Notification[] || [];
      const userNotifications = allNotifications.filter(n => n.userId === userId);
      
      // Remove expired notifications
      const now = Date.now();
      const validNotifications = userNotifications.filter(n => !n.expiresAt || n.expiresAt > now);
      
      // Update storage with filtered notifications
      this.storageService.set(this.STORAGE_KEY, validNotifications);
      
      return validNotifications.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('Error getting notifications:', error);
      return [];
    }
  }

  // Get unread notifications count
  getUnreadCount(userId: string): number {
    try {
      const notifications = this.getNotifications(userId);
      return notifications.filter(n => !n.read).length;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Add a new notification
  addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read' | 'timestamp'>): string {
    try {
      const allNotifications = this.storageService.get(this.STORAGE_KEY) as Notification[] || [];
      const now = Date.now();
      
      const newNotification: Notification = {
        ...notification,
        id: this.storageService.generateId(),
        createdAt: now,
        timestamp: now,
        read: false
      };

      allNotifications.push(newNotification);
      this.storageService.set(this.STORAGE_KEY, allNotifications);
      
      return newNotification.id;
    } catch (error) {
      console.error('Error adding notification:', error);
      return '';
    }
  }

  // Mark notification as read
  markAsRead(notificationId: string): boolean {
    try {
      const allNotifications = this.storageService.get(this.STORAGE_KEY) as Notification[] || [];
      const notificationIndex = allNotifications.findIndex(n => n.id === notificationId);
      
      if (notificationIndex === -1) {
        return false;
      }

      allNotifications[notificationIndex].read = true;
      return this.storageService.set(this.STORAGE_KEY, allNotifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read for a user
  markAllAsRead(userId: string): boolean {
    try {
      const allNotifications = this.storageService.get(this.STORAGE_KEY) as Notification[] || [];
      const updatedNotifications = allNotifications.map(n => 
        n.userId === userId ? { ...n, read: true } : n
      );
      
      return this.storageService.set(this.STORAGE_KEY, updatedNotifications);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Delete a notification
  deleteNotification(notificationId: string): boolean {
    try {
      const allNotifications = this.storageService.get(this.STORAGE_KEY) as Notification[] || [];
      const filteredNotifications = allNotifications.filter(n => n.id !== notificationId);
      return this.storageService.set(this.STORAGE_KEY, filteredNotifications);
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Clear all notifications for a user
  clearAllNotifications(userId: string): boolean {
    try {
      const allNotifications = this.storageService.get(this.STORAGE_KEY) as Notification[] || [];
      const filteredNotifications = allNotifications.filter(n => n.userId !== userId);
      return this.storageService.set(this.STORAGE_KEY, filteredNotifications);
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      return false;
    }
  }

  // Get notification settings for a user
  getNotificationSettings(userId: string): NotificationSettings {
    try {
      const settings = this.storageService.get(`${this.SETTINGS_KEY}_${userId}`) as NotificationSettings;
      return settings || {
        email: true,
        push: true,
        orders: true,
        reviews: true,
        promotions: true,
        system: true
      };
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return {
        email: true,
        push: true,
        orders: true,
        reviews: true,
        promotions: true,
        system: true
      };
    }
  }

  // Update notification settings
  updateNotificationSettings(userId: string, settings: Partial<NotificationSettings>): boolean {
    try {
      const currentSettings = this.getNotificationSettings(userId);
      const updatedSettings = { ...currentSettings, ...settings };
      return this.storageService.set(`${this.SETTINGS_KEY}_${userId}`, updatedSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
      return false;
    }
  }

  // Convenience methods for common notification types
  notifyOrderStatus(userId: string, orderId: string, status: string, message: string): string {
    return this.addNotification({
      userId,
      type: 'order',
      title: `Order Status Update`,
      message,
      data: { orderId, status },
      actionUrl: `/profile?tab=orders`,
      actionText: 'View Order',
      priority: 'high'
    });
  }

  notifyNewReview(userId: string, productId: string, productName: string, reviewerName: string): string {
    return this.addNotification({
      userId,
      type: 'review',
      title: 'New Product Review',
      message: `${reviewerName} reviewed your product "${productName}"`,
      data: { productId, productName, reviewerName },
      actionUrl: `/product/${productId}`,
      actionText: 'View Review',
      priority: 'medium'
    });
  }

  notifyPromotion(userId: string, title: string, message: string, discount?: string): string {
    return this.addNotification({
      userId,
      type: 'promotion',
      title,
      message,
      data: { discount },
      actionUrl: '/products',
      actionText: 'Shop Now',
      priority: 'medium',
      expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    });
  }

  notifySystemUpdate(userId: string, message: string): string {
    return this.addNotification({
      userId,
      type: 'system',
      title: 'System Update',
      message,
      priority: 'low'
    });
  }

  notifyWelcome(userId: string, userName: string): string {
    return this.addNotification({
      userId,
      type: 'success',
      title: 'Welcome to Our-Bikes!',
      message: `Welcome ${userName}! Thank you for joining our community.`,
      priority: 'high'
    });
  }

  // Admin notification for new order
  notifyAdminNewOrder(adminUserId: string, orderId: string, customerName: string, totalAmount: number): string {
    return this.addNotification({
      userId: adminUserId,
      type: 'order',
      title: 'New Order Received',
      message: `New order #${orderId} from ${customerName} for $${totalAmount}`,
      data: { orderId, customerName, totalAmount },
      actionUrl: `/admin/orders`,
      actionText: 'View Order',
      priority: 'high'
    });
  }

  // Get notifications by type
  getNotificationsByType(userId: string, type: Notification['type']): Notification[] {
    try {
      const notifications = this.getNotifications(userId);
      return notifications.filter(n => n.type === type);
    } catch (error) {
      console.error('Error getting notifications by type:', error);
      return [];
    }
  }

  // Get notifications by priority
  getNotificationsByPriority(userId: string, priority: Notification['priority']): Notification[] {
    try {
      const notifications = this.getNotifications(userId);
      return notifications.filter(n => n.priority === priority);
    } catch (error) {
      console.error('Error getting notifications by priority:', error);
      return [];
    }
  }

  // Get notification statistics
  getNotificationStats(userId: string): {
    total: number;
    unread: number;
    byType: Record<string, number>;
    byPriority: Record<string, number>;
  } {
    try {
      const notifications = this.getNotifications(userId);
      const stats = {
        total: notifications.length,
        unread: notifications.filter(n => !n.read).length,
        byType: {} as Record<string, number>,
        byPriority: {} as Record<string, number>
      };

      notifications.forEach(n => {
        stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
        stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error('Error getting notification stats:', error);
      return {
        total: 0,
        unread: 0,
        byType: {},
        byPriority: {}
      };
    }
  }
}
