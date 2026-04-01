import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService, Notification, NotificationSettings } from '../../../core/services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  unreadCount = 0;
  settings: NotificationSettings;
  isDropdownOpen = false;
  isLoading = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router
  ) {
    this.settings = this.getDefaultSettings();
  }

  ngOnInit(): void {
    this.initializeNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Initialize notifications
  private initializeNotifications(): void {
    this.authService.getCurrentUser().pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.loadNotifications(user.userId);
        this.loadSettings(user.userId);
      } else {
        this.notifications = [];
        this.unreadCount = 0;
      }
    });
  }

  // Load notifications for current user
  private loadNotifications(userId: string): void {
    this.isLoading = true;
    try {
      this.notifications = this.notificationService.getNotifications(userId);
      this.unreadCount = this.notificationService.getUnreadCount(userId);
    } catch (error) {
      console.error('Error loading notifications:', error);
      this.notifications = [];
      this.unreadCount = 0;
    } finally {
      this.isLoading = false;
    }
  }

  // Load notification settings
  private loadSettings(userId: string): void {
    this.settings = this.notificationService.getNotificationSettings(userId);
  }

  // Toggle dropdown
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Close dropdown
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  // Handle notification click
  onNotificationClick(notification: Notification): void {
    if (!notification.read) {
      this.markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
      this.closeDropdown();
    }
  }

  // Mark notification as read
  markAsRead(notificationId: string): void {
    const success = this.notificationService.markAsRead(notificationId);
    if (success) {
      this.updateNotification(notificationId, { read: true });
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    }
  }

  // Mark all as read
  markAllAsRead(): void {
    const currentUser = this.authService.getCurrentUserSignal()();
    if (currentUser) {
      const success = this.notificationService.markAllAsRead(currentUser.userId);
      if (success) {
        this.notifications.forEach(n => n.read = true);
        this.unreadCount = 0;
      }
    }
  }

  // Delete notification
  deleteNotification(notificationId: string, event: Event): void {
    event.stopPropagation();
    
    const success = this.notificationService.deleteNotification(notificationId);
    if (success) {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
      this.notifications = this.notifications.filter(n => n.id !== notificationId);
    }
  }

  // Clear all notifications
  clearAllNotifications(): void {
    const currentUser = this.authService.getCurrentUserSignal()();
    if (currentUser) {
      const success = this.notificationService.clearAllNotifications(currentUser.userId);
      if (success) {
        this.notifications = [];
        this.unreadCount = 0;
      }
    }
  }

  // Update notification locally
  private updateNotification(notificationId: string, updates: Partial<Notification>): void {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index !== -1) {
      this.notifications[index] = { ...this.notifications[index], ...updates };
    }
  }

  // Get notification icon based on type
  getNotificationIcon(type: string): string {
    const iconMap: Record<string, string> = {
      info: 'bi-info-circle',
      success: 'bi-check-circle',
      warning: 'bi-exclamation-triangle',
      error: 'bi-x-circle',
      order: 'bi-box-seam',
      review: 'bi-star',
      promotion: 'bi-tag',
      system: 'bi-gear'
    };
    return iconMap[type] || 'bi-bell';
  }

  // Get notification color based on type
  getNotificationColor(type: string): string {
    const colorMap: Record<string, string> = {
      info: '#00d2ff',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      order: '#6f42c1',
      review: '#fd7e14',
      promotion: '#e83e8c',
      system: '#6c757d'
    };
    return colorMap[type] || '#6c757d';
  }

  // Get priority badge color
  getPriorityColor(priority: string): string {
    const colorMap: Record<string, string> = {
      low: '#6c757d',
      medium: '#ffc107',
      high: '#dc3545'
    };
    return colorMap[priority] || '#6c757d';
  }

  // Format timestamp
  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  // Get default settings
  private getDefaultSettings(): NotificationSettings {
    return {
      email: true,
      push: true,
      orders: true,
      reviews: true,
      promotions: true,
      system: true
    };
  }

  // Handle click outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const notificationContainer = target.closest('.notifications-container');
    
    if (!notificationContainer && this.isDropdownOpen) {
      this.closeDropdown();
    }
  }

  // Navigate to settings
  goToSettings(): void {
    this.router.navigate(['/profile'], { queryParams: { tab: 'settings' } });
    this.closeDropdown();
  }

  // Check if notification is unread
  isUnread(notification: Notification): boolean {
    return !notification.read;
  }

  // Get notification count display
  getNotificationCountDisplay(): string {
    if (this.unreadCount === 0) {
      return '';
    } else if (this.unreadCount > 99) {
      return '99+';
    }
    return this.unreadCount.toString();
  }

  // Check if there are any notifications
  hasNotifications(): boolean {
    return this.notifications.length > 0;
  }

  // Check if there are unread notifications
  hasUnreadNotifications(): boolean {
    return this.unreadCount > 0;
  }
}
