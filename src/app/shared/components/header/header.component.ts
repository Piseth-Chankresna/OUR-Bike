import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';
import { StorageService } from '../../../core/services/storage.service';
import { Observable, Subject, takeUntil, BehaviorSubject } from 'rxjs';
import { AlertModalComponent } from '../alert-modal/alert-modal.component';
import { SearchComponent } from '../search/search.component';
import { NotificationPanelComponent } from '../notification-panel/notification-panel.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, AlertModalComponent, SearchComponent, NotificationPanelComponent],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isScrolled = false; // For modern scroll effect
  cartItemCount = 0;
  favoritesCount = 0;
  
  // Custom dropdown functionality
  isShopDropdownOpen = false;
  isUserDropdownOpen = false;
  
  showAlertModal = false;
  alertModalMessage = '';
  alertModalFeature = '';
  
  private destroy$ = new Subject<void>();

  // Hardware-optimized scroll listener
  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isScrolled = window.scrollY > 30;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private themeService: ThemeService,
    private storageService: StorageService
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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserData(): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (currentUser) {
      // Load cart count
      const cartData = this.storageService.getUserCart(currentUser.userId);
      this.cartItemCount = cartData.items?.length || 0;
      
      // Load favorites count
      const favoritesData = this.storageService.getUserFavorites(currentUser.userId);
      this.favoritesCount = favoritesData.productIds?.length || 0;
    }
  }

  toggleMobileMenu(): void { 
    this.isMobileMenuOpen = !this.isMobileMenuOpen; 
  }
  
  closeMobileMenu(): void { 
    this.isMobileMenuOpen = false; 
  }
  
  onCartClick(): void { 
    if (!this.authService.isAuthenticated()) { 
      this.showLoginAlert('cart'); 
      return; 
    } 
    this.router.navigate(['/cart']); 
    this.closeMobileMenu(); 
  }
  
  onFavoritesClick(): void { 
    if (!this.authService.isAuthenticated()) { 
      this.showLoginAlert('favorites'); 
      return; 
    } 
    this.router.navigate(['/favorites']); 
    this.closeMobileMenu(); 
  }
  
  showLoginAlert(feature: string): void { 
    this.alertModalFeature = feature; 
    this.alertModalMessage = `Please login to access ${feature}`; 
    this.showAlertModal = true; 
  }
  
  onAlertModalConfirm(): void { 
    this.showAlertModal = false; 
    this.router.navigate(['/auth']); 
    this.closeMobileMenu(); 
  }
  
  onAlertModalCancel(): void { 
    this.showAlertModal = false; 
  }
  
  logout(): void { 
    this.authService.logout(); 
    this.closeMobileMenu(); 
  }
  
  toggleTheme(): void { 
    this.themeService.toggleTheme(); 
  }

  // Helper methods for template
  get currentUser$() {
    return this.authService.currentUser$;
  }

  get isAuthenticated$() {
    return new Observable<boolean>((observer) => {
      observer.next(this.authService.isAuthenticated());
      observer.complete();
    });
  }

  get isAdmin$() {
    return new Observable<boolean>((observer) => {
      observer.next(this.authService.isAdmin());
      observer.complete();
    });
  }

  // Custom dropdown methods
  toggleShopDropdown(): void {
    this.isShopDropdownOpen = !this.isShopDropdownOpen;
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
  }

  closeShopDropdown(): void {
    this.isShopDropdownOpen = false;
  }

  closeUserDropdown(): void {
    this.isUserDropdownOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const shopDropdownElement = document.querySelector('.shop-dropdown');
    const userDropdownElement = document.querySelector('.user-dropdown');
    
    if (shopDropdownElement && !shopDropdownElement.contains(target)) {
      this.closeShopDropdown();
    }
    
    if (userDropdownElement && !userDropdownElement.contains(target)) {
      this.closeUserDropdown();
    }
  }
}