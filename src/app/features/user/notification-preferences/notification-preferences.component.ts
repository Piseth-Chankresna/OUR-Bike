import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationPreferencesService, NotificationPreferences } from '../../../core/services/notification-preferences.service';
import { EnhancedNotificationService } from '../../../core/services/enhanced-notification.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-notification-preferences',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './notification-preferences.component.html',
  styleUrls: ['./notification-preferences.component.scss']
})
export class NotificationPreferencesComponent implements OnInit, OnDestroy {
  preferencesForm!: FormGroup;
  quietHoursForm!: FormGroup;
  frequencyForm!: FormGroup;
  
  currentPreferences: NotificationPreferences | null = null;
  isLoading = true;
  isSaving = false;
  saveSuccess = false;
  
  notificationStats: any = null;
  activeTab = 'general';
  
  // Time options for quiet hours
  timeOptions: string[] = [];
  
  // Notification options
  emailNotificationOptions = [
    { field: 'orderUpdates', label: 'Order Updates', icon: 'bi-box-seam' },
    { field: 'priceAlerts', label: 'Price Alerts', icon: 'bi-tag' },
    { field: 'promotionalOffers', label: 'Promotional Offers', icon: 'bi-gift' },
    { field: 'newsletter', label: 'Newsletter', icon: 'bi-newspaper' },
    { field: 'accountSecurity', label: 'Account Security', icon: 'bi-shield-check' },
    { field: 'wishlistUpdates', label: 'Wishlist Updates', icon: 'bi-heart' },
    { field: 'reviewRequests', label: 'Review Requests', icon: 'bi-star' }
  ];

  pushNotificationOptions = [
    { field: 'orderUpdates', label: 'Order Updates', icon: 'bi-box-seam' },
    { field: 'priceAlerts', label: 'Price Alerts', icon: 'bi-tag' },
    { field: 'promotionalOffers', label: 'Promotional Offers', icon: 'bi-gift' },
    { field: 'accountSecurity', label: 'Account Security', icon: 'bi-shield-check' },
    { field: 'wishlistUpdates', label: 'Wishlist Updates', icon: 'bi-heart' },
    { field: 'deliveryUpdates', label: 'Delivery Updates', icon: 'bi-truck' }
  ];

  inAppNotificationOptions = [
    { field: 'soundEnabled', label: 'Sound Effects', icon: 'bi-volume-up' },
    { field: 'vibrationEnabled', label: 'Vibration', icon: 'bi-phone-vibrate' },
    { field: 'desktopNotifications', label: 'Desktop Notifications', icon: 'bi-window' },
    { field: 'autoMarkAsRead', label: 'Auto Mark as Read', icon: 'bi-check2' },
    { field: 'showPreview', label: 'Show Preview', icon: 'bi-eye' }
  ];

  categoryOptions = [
    { field: 'orders', label: 'Order Updates', icon: 'bi-box-seam' },
    { field: 'favorites', label: 'Favorites', icon: 'bi-heart' },
    { field: 'cart', label: 'Shopping Cart', icon: 'bi-cart' },
    { field: 'account', label: 'Account', icon: 'bi-person' },
    { field: 'promotions', label: 'Promotions', icon: 'bi-tag' },
    { field: 'reviews', label: 'Reviews', icon: 'bi-star' },
    { field: 'wishlist', label: 'Wishlist', icon: 'bi-heart' },
    { field: 'system', label: 'System', icon: 'bi-gear' }
  ];
  
  constructor(
    private preferencesService: NotificationPreferencesService,
    private notificationService: EnhancedNotificationService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private initializeComponent(): void {
    this.currentUser = this.authService.getCurrentUserValue();
    
    if (!this.currentUser) {
      window.location.href = '/auth/login';
      return;
    }

    this.generateTimeOptions();
    this.initializeForms();
    this.loadPreferences();
    this.loadStats();
  }

  private generateTimeOptions(): void {
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        this.timeOptions.push(time);
      }
    }
  }

  private initializeForms(): void {
    // Main preferences form
    this.preferencesForm = this.fb.group({
      emailNotifications: this.fb.group({
        enabled: [true],
        emailAddress: ['', [Validators.email]],
        orderUpdates: [true],
        priceAlerts: [true],
        promotionalOffers: [false],
        newsletter: [false],
        accountSecurity: [true],
        wishlistUpdates: [true],
        reviewRequests: [true]
      }),
      pushNotifications: this.fb.group({
        enabled: [true],
        orderUpdates: [true],
        priceAlerts: [true],
        promotionalOffers: [false],
        accountSecurity: [true],
        wishlistUpdates: [true],
        deliveryUpdates: [true]
      }),
      inAppNotifications: this.fb.group({
        enabled: [true],
        soundEnabled: [true],
        vibrationEnabled: [false],
        desktopNotifications: [true],
        autoMarkAsRead: [false],
        showPreview: [true],
        maxNotifications: [50, [Validators.min(1), Validators.max(100)]]
      }),
      categories: this.fb.group({
        orders: [true],
        favorites: [true],
        cart: [true],
        account: [true],
        promotions: [false],
        reviews: [true],
        wishlist: [true],
        system: [true]
      })
    });

    // Quiet hours form
    this.quietHoursForm = this.fb.group({
      enabled: [false],
      startTime: ['22:00'],
      endTime: ['08:00'],
      timezone: ['UTC'],
      weekendsOnly: [false],
      emergencyOnly: [false]
    });

    // Frequency form
    this.frequencyForm = this.fb.group({
      immediate: [true],
      hourly: [false],
      daily: [false],
      weekly: [false],
      maxPerDay: [20, [Validators.min(1), Validators.max(100)]],
      maxPerHour: [5, [Validators.min(1), Validators.max(20)]]
    });
  }

  private loadPreferences(): void {
    this.isLoading = true;
    
    this.preferencesService.loadPreferences(this.currentUser.userId);
    
    this.preferencesService.getPreferences().subscribe(preferences => {
      if (preferences) {
        this.currentPreferences = preferences;
        this.populateForms(preferences);
      }
      this.isLoading = false;
    });
  }

  private populateForms(preferences: NotificationPreferences): void {
    this.preferencesForm.patchValue(preferences);
    this.quietHoursForm.patchValue(preferences.quietHours);
    this.frequencyForm.patchValue(preferences.frequency);
  }

  private loadStats(): void {
    this.notificationStats = this.preferencesService.getNotificationStats(this.currentUser.userId);
  }

  // Save all preferences
  saveAllPreferences(): void {
    if (this.preferencesForm.invalid || this.quietHoursForm.invalid || this.frequencyForm.invalid) {
      this.markFormGroupTouched(this.preferencesForm);
      this.markFormGroupTouched(this.quietHoursForm);
      this.markFormGroupTouched(this.frequencyForm);
      return;
    }

    this.isSaving = true;

    const updatedPreferences: NotificationPreferences = {
      ...this.currentPreferences!,
      ...this.preferencesForm.value,
      quietHours: this.quietHoursForm.value,
      frequency: this.frequencyForm.value,
      updatedAt: Date.now()
    };

    const success = this.preferencesService.savePreferences(updatedPreferences);

    if (success) {
      this.saveSuccess = true;
      setTimeout(() => {
        this.saveSuccess = false;
      }, 3000);
    } else {
      alert('Failed to save preferences. Please try again.');
    }

    this.isSaving = false;
  }

  // Reset to default
  resetToDefault(): void {
    if (confirm('Are you sure you want to reset all notification preferences to default values?')) {
      const success = this.preferencesService.resetToDefault(this.currentUser.userId);
      
      if (success) {
        this.loadPreferences();
      } else {
        alert('Failed to reset preferences. Please try again.');
      }
    }
  }

  // Export preferences
  exportPreferences(): void {
    const preferencesJson = this.preferencesService.exportPreferences(this.currentUser.userId);
    
    if (preferencesJson) {
      const blob = new Blob([preferencesJson], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `notification-preferences-${this.currentUser.userId}.json`;
      link.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert('Failed to export preferences.');
    }
  }

  // Import preferences
  importPreferences(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const preferencesJson = e.target?.result as string;
        const success = this.preferencesService.importPreferences(this.currentUser.userId, preferencesJson);
        
        if (success) {
          this.loadPreferences();
          alert('Preferences imported successfully!');
        } else {
          alert('Failed to import preferences. Please check the file format.');
        }
      } catch (error) {
        alert('Invalid preferences file format.');
      }
    };
    
    reader.readAsText(file);
  }

  // Test notification
  testNotification(type: 'info' | 'success' | 'warning' | 'error'): void {
    this.notificationService.createNotification({
      userId: this.currentUser.userId,
      type,
      category: 'system',
      title: `Test ${type} Notification`,
      message: `This is a test ${type} notification to verify your settings are working correctly.`,
      priority: 'medium',
      dismissible: true,
      source: 'user'
    });
  }

  // Clear all notifications
  clearAllNotifications(): void {
    if (confirm('Are you sure you want to clear all your notifications?')) {
      const success = this.notificationService.clearAllNotifications(this.currentUser.userId);
      
      if (success) {
        this.loadStats();
      } else {
        alert('Failed to clear notifications.');
      }
    }
  }

  // Tab navigation
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Helper method to mark form group as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Get field validation message
  getFieldErrorMessage(formGroup: FormGroup | any, fieldName: string): string {
    const field = formGroup.get(fieldName);
    
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'This field is required';
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['min']) {
        return `Minimum value is ${field.errors['min'].min}`;
      }
      if (field.errors['max']) {
        return `Maximum value is ${field.errors['max'].max}`;
      }
    }
    
    return '';
  }

  // Format date for display
  formatDate(timestamp: number | undefined): string {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  }

  // Get notification type icon
  getNotificationTypeIcon(type: string): string {
    const icons = {
      info: 'bi-info-circle',
      success: 'bi-check-circle',
      warning: 'bi-exclamation-triangle',
      error: 'bi-x-circle',
      promotion: 'bi-tag'
    };
    return icons[type as keyof typeof icons] || 'bi-bell';
  }

  // Get notification type color
  getNotificationTypeColor(type: string): string {
    const colors = {
      info: 'text-info',
      success: 'text-success',
      warning: 'text-warning',
      error: 'text-danger',
      promotion: 'text-primary'
    };
    return colors[type as keyof typeof colors] || 'text-secondary';
  }

  // Format time
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  // Get category display name
  getCategoryDisplayName(category: string): string {
    const names = {
      orders: 'Order Updates',
      favorites: 'Favorites',
      cart: 'Shopping Cart',
      account: 'Account',
      promotions: 'Promotions',
      reviews: 'Reviews',
      wishlist: 'Wishlist',
      system: 'System'
    };
    return names[category as keyof typeof names] || category;
  }

  // Get current user (added for TypeScript)
  currentUser: any;
}
