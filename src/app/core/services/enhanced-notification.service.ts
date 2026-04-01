import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { NotificationPreferencesService } from './notification-preferences.service';
import { BehaviorSubject, Observable, interval, Subject } from 'rxjs';
import { switchMap, takeWhile, filter, map } from 'rxjs/operators';

export interface EnhancedNotification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion';
  category: 'orders' | 'favorites' | 'cart' | 'account' | 'promotions' | 'reviews' | 'wishlist' | 'system';
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  actionUrl?: string;
  actionText?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
  expiresAt?: number;
  dismissible: boolean;
  source: 'system' | 'user' | 'admin';
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
  recentCount: number;
}

export interface NotificationRule {
  id: string;
  name: string;
  enabled: boolean;
  conditions: NotificationCondition[];
  actions: NotificationAction[];
  createdAt: number;
  lastTriggered?: number;
}

export interface NotificationCondition {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'exists';
  value: any;
}

export interface NotificationAction {
  type: 'send_notification' | 'send_email' | 'send_push' | 'update_preference' | 'trigger_webhook';
  config: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class EnhancedNotificationService {
  private readonly STORAGE_KEY = 'our_bikes_enhanced_notifications';
  private readonly RULES_KEY = 'our_bikes_notification_rules';
  
  private notifications$ = new BehaviorSubject<EnhancedNotification[]>([]);
  private unreadCount$ = new BehaviorSubject<number>(0);
  private newNotification$ = new Subject<EnhancedNotification>();
  private notificationStats$ = new BehaviorSubject<NotificationStats>({
    total: 0,
    unread: 0,
    byType: {},
    byCategory: {},
    byPriority: {},
    recentCount: 0
  });

  private pollingInterval: any;
  private readonly POLLING_INTERVAL = 30000; // 30 seconds

  constructor(
    private storageService: StorageService,
    private preferencesService: NotificationPreferencesService
  ) {
    this.startRealTimeUpdates();
  }

  // Get notifications as observable
  getNotifications(): Observable<EnhancedNotification[]> {
    return this.notifications$.asObservable();
  }

  // Get unread count as observable
  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  // Get new notification stream
  getNewNotifications(): Observable<EnhancedNotification> {
    return this.newNotification$.asObservable();
  }

  // Get notification stats
  getNotificationStats(): Observable<NotificationStats> {
    return this.notificationStats$.asObservable();
  }

  // Load user notifications
  loadNotifications(userId: string): void {
    try {
      const notifications = this.getUserNotifications(userId);
      this.notifications$.next(notifications);
      this.updateStats(notifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.notifications$.next([]);
    }
  }

  // Get user notifications
  getUserNotifications(userId: string): EnhancedNotification[] {
    try {
      const allNotifications = this.storageService.get(this.STORAGE_KEY) as EnhancedNotification[] || [];
      const userNotifications = allNotifications.filter(n => n.userId === userId);
      
      // Sort by timestamp (newest first)
      return userNotifications.sort((a, b) => b.timestamp - a.timestamp);
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  // Create notification
  createNotification(notification: Omit<EnhancedNotification, 'id' | 'timestamp' | 'read'>): string {
    try {
      const id = this.generateNotificationId();
      const timestamp = Date.now();
      
      const fullNotification: EnhancedNotification = {
        ...notification,
        id,
        timestamp,
        read: false
      };

      // Check if notification should be sent based on preferences
      if (!this.shouldSendNotification(notification.userId, notification)) {
        return id; // Don't send but return ID for tracking
      }

      // Save notification
      this.saveNotification(fullNotification);

      // Emit new notification
      this.newNotification$.next(fullNotification);

      // Update current list
      const current = this.notifications$.value;
      this.notifications$.next([fullNotification, ...current]);

      // Update stats
      this.updateStats([fullNotification, ...current]);

      return id;
    } catch (error) {
      console.error('Error creating notification:', error);
      return '';
    }
  }

  // Check if notification should be sent
  private shouldSendNotification(userId: string, notification: Omit<EnhancedNotification, 'id' | 'timestamp' | 'read'>): boolean {
    try {
      // Check category preferences
      if (!this.preferencesService.isNotificationEnabled(userId, notification.category, 'inapp')) {
        return false;
      }

      // Check quiet hours
      if (this.preferencesService.isInQuietHours(userId)) {
        // Only allow urgent notifications during quiet hours
        return notification.priority === 'urgent';
      }

      // Check frequency limits
      if (this.preferencesService.isFrequencyLimitReached(userId)) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error checking notification rules:', error);
      return true; // Default to sending if there's an error
    }
  }

  // Save notification
  private saveNotification(notification: EnhancedNotification): void {
    try {
      const allNotifications = this.storageService.get(this.STORAGE_KEY) as EnhancedNotification[] || [];
      allNotifications.push(notification);
      this.storageService.set(this.STORAGE_KEY, allNotifications);
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  }

  // Mark notification as read
  markAsRead(notificationId: string): boolean {
    try {
      const allNotifications = this.storageService.get(this.STORAGE_KEY) as EnhancedNotification[] || [];
      const index = allNotifications.findIndex(n => n.id === notificationId);
      
      if (index === -1) {
        return false;
      }

      allNotifications[index].read = true;
      this.storageService.set(this.STORAGE_KEY, allNotifications);

      // Update current list
      const current = this.notifications$.value;
      const updated = current.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      this.notifications$.next(updated);

      // Update stats
      this.updateStats(updated);

      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Mark all notifications as read
  markAllAsRead(userId: string): boolean {
    try {
      const allNotifications = this.storageService.get(this.STORAGE_KEY) as EnhancedNotification[] || [];
      
      allNotifications.forEach(notification => {
        if (notification.userId === userId) {
          notification.read = true;
        }
      });

      this.storageService.set(this.STORAGE_KEY, allNotifications);

      // Update current list
      const current = this.notifications$.value;
      const updated = current.map(n => 
        n.userId === userId ? { ...n, read: true } : n
      );
      this.notifications$.next(updated);

      // Update stats
      this.updateStats(updated);

      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }

  // Delete notification
  deleteNotification(notificationId: string): boolean {
    try {
      const allNotifications = this.storageService.get(this.STORAGE_KEY) as EnhancedNotification[] || [];
      const filtered = allNotifications.filter(n => n.id !== notificationId);
      
      if (filtered.length === allNotifications.length) {
        return false; // No notification was removed
      }

      this.storageService.set(this.STORAGE_KEY, filtered);

      // Update current list
      const current = this.notifications$.value;
      const updated = current.filter(n => n.id !== notificationId);
      this.notifications$.next(updated);

      // Update stats
      this.updateStats(updated);

      return true;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  }

  // Clear all notifications for user
  clearAllNotifications(userId: string): boolean {
    try {
      const allNotifications = this.storageService.get(this.STORAGE_KEY) as EnhancedNotification[] || [];
      const filtered = allNotifications.filter(n => n.userId !== userId);
      
      this.storageService.set(this.STORAGE_KEY, filtered);
      this.notifications$.next([]);
      this.updateStats([]);

      return true;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      return false;
    }
  }

  // Update notification stats
  private updateStats(notifications: EnhancedNotification[]): void {
    const stats: NotificationStats = {
      total: notifications.length,
      unread: notifications.filter(n => !n.read).length,
      byType: {},
      byCategory: {},
      byPriority: {},
      recentCount: notifications.filter(n => Date.now() - n.timestamp < 86400000).length // Last 24 hours
    };

    // Calculate by type
    notifications.forEach(n => {
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
      stats.byCategory[n.category] = (stats.byCategory[n.category] || 0) + 1;
      stats.byPriority[n.priority] = (stats.byPriority[n.priority] || 0) + 1;
    });

    this.notificationStats$.next(stats);
    this.unreadCount$.next(stats.unread);
  }

  // Start real-time updates
  private startRealTimeUpdates(): void {
    this.pollingInterval = interval(this.POLLING_INTERVAL).pipe(
      switchMap(() => this.checkForNewNotifications()),
      takeWhile(() => true)
    ).subscribe();
  }

  // Check for new notifications (simulated)
  private checkForNewNotifications(): Observable<EnhancedNotification[]> {
    return new Observable(observer => {
      // This would typically make an API call
      // For now, simulate checking for new notifications
      const newNotifications: EnhancedNotification[] = [];
      
      // Simulate occasional new notifications
      if (Math.random() < 0.1) { // 10% chance
        const sampleNotification: EnhancedNotification = {
          id: this.generateNotificationId(),
          userId: 'current_user', // This would be dynamic
          type: 'info',
          category: 'promotions',
          title: 'New Promotion Available!',
          message: 'Check out our latest deals on motocross gear.',
          timestamp: Date.now(),
          read: false,
          priority: 'medium',
          dismissible: true,
          source: 'system'
        };
        
        newNotifications.push(sampleNotification);
      }

      observer.next(newNotifications);
      observer.complete();
    });
  }

  // Generate notification ID
  private generateNotificationId(): string {
    return 'notif_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Cleanup expired notifications
  cleanupExpiredNotifications(): number {
    try {
      const allNotifications = this.storageService.get(this.STORAGE_KEY) as EnhancedNotification[] || [];
      const now = Date.now();
      
      const validNotifications = allNotifications.filter(n => {
        // Remove expired notifications
        if (n.expiresAt && n.expiresAt < now) {
          return false;
        }
        
        // Remove notifications older than 30 days
        const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
        return n.timestamp > thirtyDaysAgo;
      });

      const removedCount = allNotifications.length - validNotifications.length;
      
      if (removedCount > 0) {
        this.storageService.set(this.STORAGE_KEY, validNotifications);
        
        // Update current list
        const current = this.notifications$.value;
        const updated = current.filter(n => 
          validNotifications.some(vn => vn.id === n.id)
        );
        this.notifications$.next(updated);
        this.updateStats(updated);
      }

      return removedCount;
    } catch (error) {
      console.error('Error cleaning up expired notifications:', error);
      return 0;
    }
  }

  // Get notification rules
  getNotificationRules(): NotificationRule[] {
    try {
      return this.storageService.get(this.RULES_KEY) as NotificationRule[] || [];
    } catch (error) {
      console.error('Error getting notification rules:', error);
      return [];
    }
  }

  // Save notification rule
  saveNotificationRule(rule: NotificationRule): boolean {
    try {
      const rules = this.getNotificationRules();
      const existingIndex = rules.findIndex(r => r.id === rule.id);
      
      if (existingIndex >= 0) {
        rules[existingIndex] = rule;
      } else {
        rules.push(rule);
      }

      return this.storageService.set(this.RULES_KEY, rules);
    } catch (error) {
      console.error('Error saving notification rule:', error);
      return false;
    }
  }

  // Delete notification rule
  deleteNotificationRule(ruleId: string): boolean {
    try {
      const rules = this.getNotificationRules();
      const filtered = rules.filter(r => r.id !== ruleId);
      
      return this.storageService.set(this.RULES_KEY, filtered);
    } catch (error) {
      console.error('Error deleting notification rule:', error);
      return false;
    }
  }

  // Trigger notification based on rule
  triggerRule(ruleId: string, context: Record<string, any>): boolean {
    try {
      const rules = this.getNotificationRules();
      const rule = rules.find(r => r.id === ruleId);
      
      if (!rule || !rule.enabled) {
        return false;
      }

      // Check conditions
      const conditionsMet = rule.conditions.every(condition => {
        const value = context[condition.field];
        
        switch (condition.operator) {
          case 'equals':
            return value === condition.value;
          case 'contains':
            return typeof value === 'string' && value.includes(condition.value);
          case 'greater_than':
            return Number(value) > Number(condition.value);
          case 'less_than':
            return Number(value) < Number(condition.value);
          case 'exists':
            return value !== undefined && value !== null;
          default:
            return false;
        }
      });

      if (!conditionsMet) {
        return false;
      }

      // Execute actions
      rule.actions.forEach(action => {
        this.executeAction(action, context);
      });

      // Update last triggered time
      rule.lastTriggered = Date.now();
      this.saveNotificationRule(rule);

      return true;
    } catch (error) {
      console.error('Error triggering notification rule:', error);
      return false;
    }
  }

  // Execute notification action
  private executeAction(action: NotificationAction, context: Record<string, any>): void {
    try {
      switch (action.type) {
        case 'send_notification':
          const notificationConfig = action.config as Omit<EnhancedNotification, 'id' | 'timestamp' | 'read'>;
          this.createNotification(notificationConfig);
          break;
        case 'send_email':
          // This would integrate with an email service
          console.log('Send email:', action.config);
          break;
        case 'send_push':
          // This would integrate with a push notification service
          console.log('Send push notification:', action.config);
          break;
        case 'update_preference':
          // Update user preferences
          console.log('Update preference:', action.config);
          break;
        case 'trigger_webhook':
          // Call external webhook
          console.log('Trigger webhook:', action.config);
          break;
      }
    } catch (error) {
      console.error('Error executing notification action:', error);
    }
  }

  // Stop real-time updates
  stopRealTimeUpdates(): void {
    if (this.pollingInterval) {
      this.pollingInterval.unsubscribe();
      this.pollingInterval = null;
    }
  }

  // Get notification by ID
  getNotificationById(notificationId: string): EnhancedNotification | null {
    try {
      const allNotifications = this.storageService.get(this.STORAGE_KEY) as EnhancedNotification[] || [];
      return allNotifications.find(n => n.id === notificationId) || null;
    } catch (error) {
      console.error('Error getting notification by ID:', error);
      return null;
    }
  }

  // Update notification
  updateNotification(notificationId: string, updates: Partial<EnhancedNotification>): boolean {
    try {
      const allNotifications = this.storageService.get(this.STORAGE_KEY) as EnhancedNotification[] || [];
      const index = allNotifications.findIndex(n => n.id === notificationId);
      
      if (index === -1) {
        return false;
      }

      allNotifications[index] = { ...allNotifications[index], ...updates };
      this.storageService.set(this.STORAGE_KEY, allNotifications);

      // Update current list
      const current = this.notifications$.value;
      const updated = current.map(n => 
        n.id === notificationId ? { ...n, ...updates } : n
      );
      this.notifications$.next(updated);
      this.updateStats(updated);

      return true;
    } catch (error) {
      console.error('Error updating notification:', error);
      return false;
    }
  }

  // Search notifications
  searchNotifications(userId: string, query: string, filters?: {
    type?: string;
    category?: string;
    priority?: string;
    read?: boolean;
    dateRange?: { start: number; end: number };
  }): EnhancedNotification[] {
    try {
      const notifications = this.getUserNotifications(userId);
      
      return notifications.filter(notification => {
        // Text search
        if (query && !notification.title.toLowerCase().includes(query.toLowerCase()) && 
            !notification.message.toLowerCase().includes(query.toLowerCase())) {
          return false;
        }

        // Type filter
        if (filters?.type && notification.type !== filters.type) {
          return false;
        }

        // Category filter
        if (filters?.category && notification.category !== filters.category) {
          return false;
        }

        // Priority filter
        if (filters?.priority && notification.priority !== filters.priority) {
          return false;
        }

        // Read status filter
        if (filters?.read !== undefined && notification.read !== filters.read) {
          return false;
        }

        // Date range filter
        if (filters?.dateRange) {
          if (notification.timestamp < filters.dateRange.start || 
              notification.timestamp > filters.dateRange.end) {
            return false;
          }
        }

        return true;
      });
    } catch (error) {
      console.error('Error searching notifications:', error);
      return [];
    }
  }

  // Export notifications
  exportNotifications(userId: string, format: 'json' | 'csv'): string | null {
    try {
      const notifications = this.getUserNotifications(userId);
      
      if (format === 'json') {
        return JSON.stringify(notifications, null, 2);
      } else if (format === 'csv') {
        const headers = ['ID', 'Type', 'Category', 'Title', 'Message', 'Timestamp', 'Read', 'Priority'];
        const csvData = notifications.map(n => [
          n.id,
          n.type,
          n.category,
          n.title,
          n.message,
          new Date(n.timestamp).toISOString(),
          n.read.toString(),
          n.priority
        ]);
        
        return [headers, ...csvData].map(row => row.join(',')).join('\n');
      }

      return null;
    } catch (error) {
      console.error('Error exporting notifications:', error);
      return null;
    }
  }
}
