import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NotificationService, Notification, NotificationSettings } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-notification-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.scss']
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  @Output() notificationClick = new EventEmitter<void>();

  notifications: Notification[] = [];
  unreadCount = 0;
  isLoading = true;
  showDropdown = false;
  currentUser: any = null;
  
  // Settings
  notificationSettings: NotificationSettings | null = null;
  showSettings = false;

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private initializeComponent(): void {
    // Check authentication
    this.currentUser = this.authService.getCurrentUserValue();
    
    if (!this.currentUser) {
      this.isLoading = false;
      return;
    }

    // Load notifications and settings
    this.loadNotifications();
    this.loadSettings();
  }

  private loadNotifications(): void {
    try {
      this.notifications = this.notificationService.getNotifications(this.currentUser.userId);
      this.unreadCount = this.notificationService.getUnreadCount(this.currentUser.userId);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private loadSettings(): void {
    try {
      this.notificationSettings = this.notificationService.getNotificationSettings(this.currentUser.userId);
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  }

  // Dropdown management
  toggleDropdown(): void {
    this.showDropdown = !this.showDropdown;
    if (this.showDropdown) {
      this.loadNotifications();
    }
  }

  closeDropdown(): void {
    this.showDropdown = false;
    this.showSettings = false;
  }

  // Notification actions
  markAsRead(notificationId: string): void {
    if (this.notificationService.markAsRead(notificationId)) {
      this.loadNotifications();
    }
  }

  markAllAsRead(): void {
    if (this.notificationService.markAllAsRead(this.currentUser.userId)) {
      this.loadNotifications();
    }
  }

  deleteNotification(notificationId: string): void {
    if (confirm('Are you sure you want to delete this notification?')) {
      if (this.notificationService.deleteNotification(notificationId)) {
        this.loadNotifications();
      }
    }
  }

  clearAllNotifications(): void {
    if (confirm('Are you sure you want to clear all notifications?')) {
      if (this.notificationService.clearAllNotifications(this.currentUser.userId)) {
        this.loadNotifications();
      }
    }
  }

  handleNotificationClick(notification: Notification): void {
    // Mark as read
    this.markAsRead(notification.id);
    
    // Close dropdown
    this.closeDropdown();
    
    // Emit event
    this.notificationClick.emit();
    
    // Navigate if action URL exists
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  }

  // Settings management
  toggleSettings(): void {
    this.showSettings = !this.showSettings;
  }

  updateSettings(): void {
    if (this.notificationSettings) {
      this.notificationService.updateNotificationSettings(
        this.currentUser.userId,
        this.notificationSettings
      );
      alert('Notification settings updated successfully!');
    }
  }

  // Utility methods
  getNotificationIcon(type: Notification['type']): string {
    const icons = {
      info: 'bi-info-circle',
      success: 'bi-check-circle',
      warning: 'bi-exclamation-triangle',
      error: 'bi-x-circle',
      order: 'bi-box-seam',
      review: 'bi-star',
      promotion: 'bi-tag',
      system: 'bi-gear'
    };
    return icons[type] || 'bi-bell';
  }

  trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }

  getNotificationColor(type: Notification['type']): string {
    const colors = {
      info: 'text-info',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-danger',
      order: 'text-primary',
      review: 'text-warning',
      promotion: 'text-success',
      system: 'text-secondary'
    };
    return colors[type] || 'text-secondary';
  }

  getPriorityBadge(priority: Notification['priority']): string {
    const badges = {
      low: 'bg-secondary',
      medium: 'bg-warning',
      high: 'bg-danger'
    };
    return badges[priority] || 'bg-secondary';
  }

  formatTime(date: number): string {
    const now = Date.now();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  }

  getNotificationMessage(notification: Notification): string {
    // Truncate long messages
    const maxLength = 100;
    if (notification.message.length <= maxLength) {
      return notification.message;
    }
    return notification.message.substring(0, maxLength) + '...';
  }

  // Click outside detection
  onClickOutside(event: any): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-dropdown')) {
      this.closeDropdown();
    }
  }
}
