import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EnhancedStorageService } from '../../../core/services/enhanced-storage.service';
import { ThemeService } from '../../../core/services/theme.service';
import { Observable, Subject, takeUntil } from 'rxjs';
import { STORAGE_KEYS } from '../../../core/types/data.types';

@Component({
  selector: 'app-user-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-header.component.html',
  styleUrls: ['./user-header.component.scss']
})
export class UserHeaderComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isScrolled = false;
  cartItemCount = 0;
  favoritesCount = 0;
  
  // Dropdown states
  isShopDropdownOpen = false;
  isUserDropdownOpen = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private enhancedStorageService: EnhancedStorageService,
    private themeService: ThemeService
  ) {}

  ngOnInit(): void {
    // Subscribe to authentication changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user: any) => {
        if (user) {
          this.loadUserData();
        } else {
          this.cartItemCount = 0;
          this.favoritesCount = 0;
        }
      });

    // Load initial data
    if (this.authService.getCurrentUserValue()) {
      this.loadUserData();
    }

    // Listen for storage changes to update counts in real-time
    this.handleStorageChange = this.handleStorageChange.bind(this);
    window.addEventListener('storage', this.handleStorageChange);
  }

  ngOnDestroy(): void {
    // Remove storage event listener
    window.removeEventListener('storage', this.handleStorageChange);
    
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserData(): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (currentUser) {
      // Load cart items from localStorage
      const cartItems = this.enhancedStorageService.get(STORAGE_KEYS.CART) as any[] || [];
      this.cartItemCount = cartItems.length;

      // Load favorites from localStorage using WISHLIST key
      const favorites = this.enhancedStorageService.get(STORAGE_KEYS.WISHLIST) as any[] || [];
      this.favoritesCount = favorites.length;
    }
  }

  // Method to refresh cart and favorites counts
  refreshCounts(): void {
    this.loadUserData();
  }

  // Handle storage changes for real-time updates
  handleStorageChange(event: StorageEvent): void {
    if (event.key === STORAGE_KEYS.CART || event.key === STORAGE_KEYS.WISHLIST) {
      this.loadUserData();
    }
  }

  // Navigation methods
  toggleShopDropdown(): void {
    this.isShopDropdownOpen = !this.isShopDropdownOpen;
    this.isUserDropdownOpen = false;
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    this.isShopDropdownOpen = false;
  }

  closeShopDropdown(): void {
    this.isShopDropdownOpen = false;
  }

  closeUserDropdown(): void {
    this.isUserDropdownOpen = false;
  }

  // Mobile menu
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  // Action methods
  onFavoritesClick(): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/favorites']);
  }

  onCartClick(): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.router.navigate(['/cart']);
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.shop-dropdown') && !target.closest('.user-dropdown')) {
      this.isShopDropdownOpen = false;
      this.isUserDropdownOpen = false;
    }
  }

  // Scroll effect
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 30;
  }
}
