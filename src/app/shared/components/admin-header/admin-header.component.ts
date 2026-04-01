import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { EnhancedStorageService } from '../../../core/services/enhanced-storage.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-header.component.html',
  styleUrls: ['./admin-header.component.scss']
})
export class AdminHeaderComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isScrolled = false;
  
  // Admin stats
  totalUsers = 0;
  totalOrders = 0;
  totalProducts = 0;
  pendingOrders = 0;
  
  // Dropdown states
  isManagementDropdownOpen = false;
  isReportsDropdownOpen = false;
  isUserDropdownOpen = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private enhancedStorageService: EnhancedStorageService
  ) {}

  ngOnInit(): void {
    this.loadAdminStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAdminStats(): void {
    // Load admin statistics
    const users = this.enhancedStorageService.getUsers();
    const orders = this.enhancedStorageService.getOrders();
    const products = this.enhancedStorageService.getProducts();

    this.totalUsers = users.length;
    this.totalOrders = orders.length;
    this.totalProducts = products.length;
    this.pendingOrders = orders.filter(order => order.status === 'pending').length;
  }

  // Navigation methods
  toggleManagementDropdown(): void {
    this.isManagementDropdownOpen = !this.isManagementDropdownOpen;
    this.isReportsDropdownOpen = false;
    this.isUserDropdownOpen = false;
  }

  toggleReportsDropdown(): void {
    this.isReportsDropdownOpen = !this.isReportsDropdownOpen;
    this.isManagementDropdownOpen = false;
    this.isUserDropdownOpen = false;
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    this.isManagementDropdownOpen = false;
    this.isReportsDropdownOpen = false;
  }

  closeAllDropdowns(): void {
    this.isManagementDropdownOpen = false;
    this.isReportsDropdownOpen = false;
    this.isUserDropdownOpen = false;
  }

  // Mobile menu
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  // Admin actions
  refreshStats(): void {
    this.loadAdminStats();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  // Close dropdowns when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.admin-dropdown')) {
      this.closeAllDropdowns();
    }
  }

  // Scroll effect
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 30;
  }
}
