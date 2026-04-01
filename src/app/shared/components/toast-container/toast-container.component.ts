import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastNotificationService, ToastMessage } from '../../../core/services/toast-notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss']
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private toastSubscription: Subscription | null = null;
  private removeSubscription: Subscription | null = null;

  constructor(private toastService: ToastNotificationService) {}

  ngOnInit(): void {
    // Subscribe to new toasts
    this.toastSubscription = this.toastService.toasts$.subscribe(toast => {
      this.toasts.push(toast);
    });

    // Subscribe to toast removal
    this.removeSubscription = this.toastService.toastRemove$.subscribe(id => {
      this.removeToast(id);
    });
  }

  ngOnDestroy(): void {
    if (this.toastSubscription) {
      this.toastSubscription.unsubscribe();
    }
    if (this.removeSubscription) {
      this.removeSubscription.unsubscribe();
    }
  }

  removeToast(id: string): void {
    const index = this.toasts.findIndex(toast => toast.id === id);
    if (index > -1) {
      this.toasts.splice(index, 1);
    }
  }

  getToastIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'bi-check-circle-fill';
      case 'error':
        return 'bi-x-circle-fill';
      case 'warning':
        return 'bi-exclamation-triangle-fill';
      case 'info':
        return 'bi-info-circle-fill';
      default:
        return 'bi-info-circle-fill';
    }
  }

  getToastClass(type: string): string {
    return `toast-${type}`;
  }
}
