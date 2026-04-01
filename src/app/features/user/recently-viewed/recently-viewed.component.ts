import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { AuthService } from '../../../core/services/auth.service';
import { RecentlyViewedService, RecentlyViewedItem } from '../../../core/services/recently-viewed.service';
import { Product } from '../../../core/models';

@Component({
  selector: 'app-recently-viewed',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './recently-viewed.component.html',
  styleUrls: ['./recently-viewed.component.scss']
})
export class RecentlyViewedComponent implements OnInit, OnDestroy {
  recentlyViewedItems: RecentlyViewedItem[] = [];
  filteredItems: RecentlyViewedItem[] = [];
  isLoading = true;
  maxItems = 20;

  searchForm!: FormGroup;
  private destroy$ = new Subject<void>();

  constructor(
    private recentlyViewedService: RecentlyViewedService,
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadRecentlyViewed();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.searchForm = this.fb.group({
      searchQuery: ['']
    });

    // Subscribe to search changes
    this.searchForm.get('searchQuery')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.filterItems();
      });
  }

  private loadRecentlyViewed(): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) {
      this.recentlyViewedItems = [];
      this.filteredItems = [];
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    
    try {
      this.recentlyViewedItems = this.recentlyViewedService.getUserRecentlyViewed(currentUser.userId);
      this.filteredItems = [...this.recentlyViewedItems];
    } catch (error) {
      console.error('Error loading recently viewed:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private filterItems(): void {
    const searchQuery = this.searchForm.get('searchQuery')?.value?.toLowerCase().trim() || '';
    
    if (!searchQuery) {
      this.filteredItems = [...this.recentlyViewedItems];
      return;
    }

    this.filteredItems = this.recentlyViewedItems.filter(item =>
      item.product.name.toLowerCase().includes(searchQuery) ||
      item.product.category.toLowerCase().includes(searchQuery) ||
      item.product.description.toLowerCase().includes(searchQuery)
    );
  }

  public navigateToProduct(productId: string): void {
    this.router.navigate(['/product', productId]);
  }

  public clearRecentlyViewed(): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) return;

    if (confirm('Are you sure you want to clear all recently viewed products?')) {
      this.recentlyViewedService.clearRecentlyViewed();
      this.recentlyViewedItems = [];
      this.filteredItems = [];
    }
  }

  public removeFromRecentlyViewed(productId: string): void {
    this.recentlyViewedService.removeFromRecentlyViewed(productId);
    this.loadRecentlyViewed();
  }

  public formatViewedTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return 'Just now';
    } else if (minutes < 60) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    } else if (days < 7) {
      return `${days} day${days !== 1 ? 's' : ''} ago`;
    } else {
      const date = new Date(timestamp);
      return date.toLocaleDateString();
    }
  }

  public getCategoryIcon(category: string): string {
    const icons = {
      bikes: 'bi-bicycle',
      accessory: 'bi-helmet-safety',
      souvenir: 'bi-gift',
      tool: 'bi-tools'
    };
    return icons[category as keyof typeof icons] || 'bi-box';
  }

  public getCategoryColor(category: string): string {
    const colors = {
      bikes: '#ff6b35',
      accessory: '#17a2b8',
      souvenir: '#e83e8c',
      tool: '#6c757d'
    };
    return colors[category as keyof typeof colors] || '#6c757d';
  }

  public getRecentlyViewedStats(): {
    totalItems: number;
    uniqueProducts: number;
    averageViewingInterval: number;
    mostViewedCategory: string;
  } {
    const currentUser = this.authService.getCurrentUserValue();
    return this.recentlyViewedService.getRecentlyViewedStats(currentUser?.userId);
  }

  public exportRecentlyViewed(): void {
    const currentUser = this.authService.getCurrentUserValue();
    this.recentlyViewedService.exportRecentlyViewed(currentUser?.userId);
  }

  public shareRecentlyViewed(): void {
    const currentUser = this.authService.getCurrentUserValue();
    const items = this.recentlyViewedService.getUserRecentlyViewed(currentUser?.userId);
    
    if (items.length === 0) {
      alert('No recently viewed items to share.');
      return;
    }

    const shareText = `Check out my recently viewed products:\n\n` +
      items.map((item, index) => 
        `${index + 1}. ${item.product.name} - $${item.product.price}\n${item.product.description}`
      ).join('\n\n');

    if (navigator.share) {
      navigator.share({
        title: 'Recently Viewed Products',
        text: shareText
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(shareText).then(() => {
        alert('Recently viewed products copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy to clipboard.');
      });
    }
  }

  public getStockStatus(product: Product): { class: string; text: string } {
    if (product.stock > 0) {
      return { class: 'in-stock', text: `${product.stock} in stock` };
    } else {
      return { class: 'out-of-stock', text: 'Out of stock' };
    }
  }

  public generateStars(rating?: number): string {
    if (!rating) return '☆☆☆☆☆☆';
    
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - Math.ceil(rating);
    
    let stars = '';
    for (let i = 0; i < fullStars; i++) {
      stars += '★';
    }
    if (hasHalfStar) {
      stars += '☆';
    }
    for (let i = 0; i < emptyStars; i++) {
      stars += '☆';
    }
    
    return stars;
  }

  public getUniqueCategories(): string[] {
    const categories = this.filteredItems.map(item => item.product.category);
    return [...new Set(categories)];
  }

  public filterByCategory(category?: string): void {
    if (!category) {
      this.filteredItems = [...this.recentlyViewedItems];
      return;
    }
    
    this.filteredItems = this.recentlyViewedItems.filter(item => 
      item.product.category === category
    );
  }

  public sortByDate(): void {
    this.filteredItems.sort((a, b) => b.viewedAt - a.viewedAt);
  }

  public sortByName(): void {
    this.filteredItems.sort((a, b) => 
      a.product.name.localeCompare(b.product.name)
    );
  }

  public sortByPrice(): void {
    this.filteredItems.sort((a, b) => a.product.price - b.product.price);
  }

  public sortByRating(): void {
    this.filteredItems.sort((a, b) => (b.product.rating || 0) - (a.product.rating || 0));
  }

  // Track by function for ngFor
  public trackByProductId(index: number, item: RecentlyViewedItem): string {
    return item.product.id;
  }

  // Handle image errors
  public onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://picsum.photos/seed/fallback/400/300.jpg';
  }
}
