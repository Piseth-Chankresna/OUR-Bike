import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService, Notification } from '../../../core/services/notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.scss']
})
export class NotificationPanelComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Signals for reactive state management
  public notifications = signal<Notification[]>([]);
  public unreadCount = signal<number>(0);
  public isLoading = signal<boolean>(false);
  public showNotifications = signal<boolean>(false);

  // Computed signals
  public hasNotifications = computed(() => this.notifications().length > 0);
  public hasUnreadNotifications = computed(() => this.unreadCount() > 0);

  // Filter options
  public activeFilter = signal<'all' | 'unread' | 'order' | 'review' | 'promotion' | 'system'>('all');
  public filterOptions: { value: 'all' | 'unread' | 'order' | 'review' | 'promotion' | 'system'; label: string; icon: string }[] = [
    { value: 'all', label: 'All', icon: 'bi-inbox' },
    { value: 'unread', label: 'Unread', icon: 'bi-envelope' },
    { value: 'order', label: 'Orders', icon: 'bi-bag-check' },
    { value: 'review', label: 'Reviews', icon: 'bi-star' },
    { value: 'promotion', label: 'Promotions', icon: 'bi-tag' },
    { value: 'system', label: 'System', icon: 'bi-gear' }
  ];

  // Computed filtered notifications
  public filteredNotifications = computed(() => {
    const notifications = this.notifications();
    const filter = this.activeFilter();

    if (filter === 'all') {
      return notifications;
    } else if (filter === 'unread') {
      return notifications.filter(n => !n.read);
    } else {
      return notifications.filter(n => n.type === filter);
    }
  });

  constructor(
    private notificationService: NotificationService,
    private authService: AuthService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.setupEventListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupEventListeners(): void {
    // Listen for auth changes
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.loadNotifications();
    });

    // Close notifications when clicking outside
    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  private loadNotifications(): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) {
      this.notifications.set([]);
      this.unreadCount.set(0);
      return;
    }

    this.isLoading.set(true);
    
    try {
      const userNotifications = this.notificationService.getNotifications(currentUser.userId);
      const unreadCount = this.notificationService.getUnreadCount(currentUser.userId);
      
      this.notifications.set(userNotifications);
      this.unreadCount.set(unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  public toggleNotifications(): void {
    this.showNotifications.set(!this.showNotifications());
  }

  public closeNotifications(): void {
    this.showNotifications.set(false);
  }

  public setFilter(filter: 'all' | 'unread' | 'order' | 'review' | 'promotion' | 'system'): void {
    this.activeFilter.set(filter);
  }

  public markAsRead(notificationId: string): void {
    this.notificationService.markAsRead(notificationId);
    this.loadNotifications();
  }

  public markAllAsRead(): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (currentUser) {
      this.notificationService.markAllAsRead(currentUser.userId);
      this.loadNotifications();
    }
  }

  public deleteNotification(notificationId: string, event: Event): void {
    event.stopPropagation();
    this.notificationService.deleteNotification(notificationId);
    this.loadNotifications();
  }

  public clearAllNotifications(): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (currentUser) {
      this.notificationService.clearAllNotifications(currentUser.userId);
      this.loadNotifications();
    }
  }

  public handleNotificationClick(notification: Notification): void {
    // Mark as read
    if (!notification.read) {
      this.markAsRead(notification.id);
    }

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
      this.closeNotifications();
    }
  }

  public getNotificationIcon(type: Notification['type']): string {
    const icons = {
      info: 'bi-info-circle',
      success: 'bi-check-circle',
      warning: 'bi-exclamation-triangle',
      error: 'bi-x-circle',
      order: 'bi-bag-check',
      review: 'bi-star',
      promotion: 'bi-tag',
      system: 'bi-gear'
    };
    return icons[type] || 'bi-bell';
  }

  public getNotificationColor(type: Notification['type']): string {
    const colors = {
      info: '#17a2b8',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      order: '#007bff',
      review: '#fd7e14',
      promotion: '#e83e8c',
      system: '#6c757d'
    };
    return colors[type] || '#6c757d';
  }

  public getPriorityClass(priority: Notification['priority']): string {
    switch (priority) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-medium';
    }
  }

  public formatTimestamp(timestamp: number): string {
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

  private handleOutsideClick(event: Event): void {
    const target = event.target as Element;
    const notificationElement = document.querySelector('.notification-panel-container');
    
    if (notificationElement && !notificationElement.contains(target)) {
      this.closeNotifications();
    }
  }

  // Keyboard navigation
  public handleKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        this.closeNotifications();
        break;
      case 'ArrowDown':
        this.navigateNotifications('down');
        break;
      case 'ArrowUp':
        this.navigateNotifications('up');
        break;
      case 'Enter':
        this.selectCurrentNotification();
        break;
    }
  }

  private navigateNotifications(direction: 'up' | 'down'): void {
    // Implementation for keyboard navigation
    // This would require tracking the currently selected notification
  }

  private selectCurrentNotification(): void {
    // Implementation for selecting current notification with keyboard
  }

  // Get notification statistics for display
  public getNotificationStats(): { total: number; unread: number; byType: Record<string, number> } {
    return this.notificationService.getNotificationStats(
      this.authService.getCurrentUserValue()?.userId || ''
    );
  }

  // Track by function for ngFor
  public trackByNotificationId(index: number, notification: Notification): string {
    return notification.id;
  }
}
