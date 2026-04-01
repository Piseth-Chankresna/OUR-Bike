import { Component, OnInit, HostListener, signal, computed, inject, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

// Core Services
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { SimpleStorageService } from '../../../core/services/simple-storage.service';
import { ToastNotificationService } from '../../../core/services/toast-notification.service';

// Shared Components
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { SearchComponent } from '../search/search.component';
import { NotificationPanelComponent } from '../notification-panel/notification-panel.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    AlertModalComponent, 
    SearchComponent, 
    NotificationPanelComponent
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  // --- Service Injection (Modern Pattern) ---
  private auth = inject(AuthService);
  private router = inject(Router);
  private theme = inject(ThemeService);
  private storage = inject(SimpleStorageService);
  private toast = inject(ToastNotificationService);

  // --- UI State Signals ---
  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);
  isShopDropdownOpen = signal(false);
  isUserDropdownOpen = signal(false);
  
  // --- Data Signals ---
  // Convert Observable to Signal for cleaner template access
  currentUser = toSignal(this.auth.currentUser$);
  isAuthenticated = computed(() => !!this.currentUser());
  isAdmin = computed(() => this.auth.isAdmin());
  
  cartCount = signal(0);
  favoritesCount = signal(0);

  // --- Modal State ---
  showAlertModal = signal(false);
  alertModalMessage = signal('');
  alertModalFeature = '';

  @HostListener('window:scroll')
  onWindowScroll() {
    // Threshold for the glassmorphism effect
    this.isScrolled.set(window.scrollY > 40);
  }

  ngOnInit(): void {
    this.refreshCounts();
    // Cross-tab synchronization
    window.addEventListener('storage', (e) => {
      if (e.key?.includes('cart') || e.key?.includes('favorites')) {
        this.refreshCounts();
      }
    });
  }

  refreshCounts(): void {
    const user = this.currentUser();
    if (user) {
      this.cartCount.set(this.storage.getCartCount(user.userId));
      this.favoritesCount.set(this.storage.getFavoritesCount(user.userId));
    }
  }

  // --- Actions ---
  toggleShopDropdown() { this.isShopDropdownOpen.update(v => !v); }
  toggleUserDropdown() { this.isUserDropdownOpen.update(v => !v); }
  toggleMobileMenu() { this.isMobileMenuOpen.update(v => !v); }

  onCartClick(): void {
    if (!this.isAuthenticated()) {
      this.triggerAuthAlert('cart');
    } else {
      this.router.navigate(['/cart']);
      this.isMobileMenuOpen.set(false);
    }
  }

  onFavoritesClick(): void {
    if (!this.isAuthenticated()) {
      this.triggerAuthAlert('favorites');
    } else {
      this.router.navigate(['/favorites']);
      this.isMobileMenuOpen.set(false);
    }
  }

  private triggerAuthAlert(feature: string) {
    this.alertModalFeature = feature;
    this.alertModalMessage.set(`Please login to access your ${feature}`);
    this.showAlertModal.set(true);
    this.toast.showLoginRequired(`access your ${feature}`);
  }

  onAlertModalConfirm() {
    this.showAlertModal.set(false);
    this.router.navigate(['/auth/login']);
  }

  logout() {
    this.auth.logout();
    this.isMobileMenuOpen.set(false);
    this.router.navigate(['/']);
  }

  toggleTheme() { this.theme.toggleTheme(); }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.shop-dropdown')) this.isShopDropdownOpen.set(false);
    if (!target.closest('.user-dropdown')) this.isUserDropdownOpen.set(false);
  }
}