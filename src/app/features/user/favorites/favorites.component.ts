import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EnhancedStorageService } from '../../../core/services/enhanced-storage.service';
import { AuthService } from '../../../core/services/auth.service';
import { WishlistShareService, ShareSettings } from '../../../core/services/wishlist-share.service';
import { Product } from '../../../core/models/product.model';
import { STORAGE_KEYS } from '../../../core/types/data.types';

interface FavoriteItem {
  productId: string;
  dateAdded: number;
  product: Product;
}

interface FilterOptions {
  category: string;
  sortBy: string;
  searchQuery: string;
}

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent implements OnInit, OnDestroy {
  favorites: FavoriteItem[] = [];
  filteredFavorites: FavoriteItem[] = [];
  isLoading = true;
  currentUser: any = null;
  Object = Object; // Make Object available in template
  
  // Filter and Sort Options
  filterForm!: FormGroup;
  categories: string[] = ['All', 'bikes', 'accessory', 'tool', 'souvenir'];
  sortOptions: { value: string; label: string }[] = [
    { value: 'dateAdded', label: 'Date Added (Newest)' },
    { value: 'dateAdded-asc', label: 'Date Added (Oldest)' },
    { value: 'name', label: 'Name (A-Z)' },
    { value: 'name-desc', label: 'Name (Z-A)' },
    { value: 'price', label: 'Price (Low to High)' },
    { value: 'price-desc', label: 'Price (High to Low)' }
  ];
  
  // Statistics
  totalItems = 0;
  totalValue = 0;
  categoriesCount: Record<string, number> = {};
  
  // UI States
  showExportModal = false;
  showShareModal = false;
  selectedItems: string[] = [];
  selectAll = false;
  
  // Share Settings
  shareSettings!: FormGroup;
  createdShareUrl: string | null = null;
  isCreatingShare = false;

  constructor(
    private enhancedStorageService: EnhancedStorageService,
    private authService: AuthService,
    private wishlistShareService: WishlistShareService,
    private fb: FormBuilder
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
      // Redirect to login if not authenticated
      window.location.href = '/auth/login';
      return;
    }

    // Initialize filter form
    this.filterForm = this.fb.group({
      category: ['All'],
      sortBy: ['dateAdded'],
      searchQuery: ['']
    });

    // Initialize share settings form
    this.shareSettings = this.fb.group({
      allowPublic: [true],
      requireEmail: [false],
      expireInDays: [30],
      includeMessage: [false],
      message: ['']
    });

    // Load favorites
    this.loadFavorites();
    
    // Subscribe to form changes
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private loadFavorites(): void {
    this.isLoading = true;
    
    try {
      // Get user favorites from localStorage using WISHLIST key
      const userFavorites = this.enhancedStorageService.get(STORAGE_KEYS.WISHLIST) as any[] || [];
      
      // Get all products
      const allProducts = this.enhancedStorageService.get(STORAGE_KEYS.PRODUCTS) as Product[] || [];
      
      // Map favorites to full product details
      this.favorites = userFavorites
        .map((favorite: any) => {
          const product = allProducts.find(p => p.id === favorite.productId);
          return product ? {
            productId: favorite.productId,
            dateAdded: favorite.dateAdded || Date.now(),
            product
          } : null;
        })
        .filter((item: FavoriteItem | null): item is FavoriteItem => item !== null);
      
      this.filteredFavorites = [...this.favorites];
      this.calculateStatistics();
      this.isLoading = false;
    } catch (error) {
      console.error('Error loading favorites:', error);
      this.favorites = [];
      this.filteredFavorites = [];
      this.isLoading = false;
    }
  }

  private applyFilters(): void {
    const filters = this.filterForm.value;
    
    this.filteredFavorites = this.favorites.filter(item => {
      // Category filter
      if (filters.category !== 'All' && item.product.category !== filters.category) {
        return false;
      }
      
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesSearch = 
          item.product.name.toLowerCase().includes(query) ||
          item.product.description.toLowerCase().includes(query) ||
          item.product.category.toLowerCase().includes(query);
        
        if (!matchesSearch) {
          return false;
        }
      }
      
      return true;
    });

    // Apply sorting
    this.applySorting(filters.sortBy);
  }

  private applySorting(sortBy: string): void {
    this.filteredFavorites.sort((a, b) => {
      switch (sortBy) {
        case 'dateAdded':
          return b.dateAdded - a.dateAdded;
        case 'dateAdded-asc':
          return a.dateAdded - b.dateAdded;
        case 'name':
          return a.product.name.localeCompare(b.product.name);
        case 'name-desc':
          return b.product.name.localeCompare(a.product.name);
        case 'price':
          return a.product.price - b.product.price;
        case 'price-desc':
          return b.product.price - a.product.price;
        default:
          return 0;
      }
    });
  }

  private calculateStatistics(): void {
    this.totalItems = this.favorites.length;
    this.totalValue = this.favorites.reduce((sum, item) => sum + item.product.price, 0);
    
    // Count by category
    this.categoriesCount = {};
    this.favorites.forEach(item => {
      const category = item.product.category;
      this.categoriesCount[category] = (this.categoriesCount[category] || 0) + 1;
    });
  }

  // Favorite Management
  removeFromFavorites(productId: string): void {
    try {
      // Get current favorites from localStorage
      const favorites = this.enhancedStorageService.get(STORAGE_KEYS.WISHLIST) as any[] || [];
      const updatedFavorites = favorites.filter((fav: any) => fav.productId !== productId);
      
      // Save updated favorites to localStorage
      this.enhancedStorageService.set(STORAGE_KEYS.WISHLIST, updatedFavorites);
      
      // Remove from local array
      this.favorites = this.favorites.filter(item => item.productId !== productId);
      
      // Reapply filters
      this.applyFilters();
      
      // Recalculate statistics
      this.calculateStatistics();
      
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  }

  removeAllFavorites(): void {
    if (confirm('Are you sure you want to remove all items from your favorites?')) {
      try {
        // Clear favorites in localStorage
        this.enhancedStorageService.set(STORAGE_KEYS.WISHLIST, []);
        this.favorites = [];
        this.filteredFavorites = [];
        this.calculateStatistics();
      } catch (error) {
        console.error('Error clearing favorites:', error);
      }
    }
  }

  // Selection Management
  toggleItemSelection(productId: string): void {
    const index = this.selectedItems.indexOf(productId);
    if (index > -1) {
      this.selectedItems.splice(index, 1);
    } else {
      this.selectedItems.push(productId);
    }
    
    // Update select all state
    this.selectAll = this.selectedItems.length === this.filteredFavorites.length;
  }

  toggleSelectAll(): void {
    if (this.selectAll) {
      this.selectedItems = [];
    } else {
      this.selectedItems = this.filteredFavorites.map(item => item.productId);
    }
    this.selectAll = !this.selectAll;
  }

  removeSelectedItems(): void {
    if (this.selectedItems.length === 0) return;
    
    if (confirm(`Are you sure you want to remove ${this.selectedItems.length} item(s) from your favorites?`)) {
      try {
        // Get current favorites and remove selected items
        const favorites = this.enhancedStorageService.get(STORAGE_KEYS.WISHLIST) as any[] || [];
        const updatedFavorites = favorites.filter((fav: any) => !this.selectedItems.includes(fav.productId));
        
        // Save updated favorites to localStorage
        this.enhancedStorageService.set(STORAGE_KEYS.WISHLIST, updatedFavorites);
        
        // Reload favorites
        this.loadFavorites();
        
        // Clear selection
        this.selectedItems = [];
        this.selectAll = false;
        
      } catch (error) {
        console.error('Error removing selected items:', error);
      }
    }
  }

  // Export Functionality
  exportFavorites(): void {
    this.showExportModal = true;
  }

  downloadFavorites(format: 'json' | 'csv'): void {
    try {
      const exportData = this.favorites.map(item => ({
        name: item.product.name,
        category: item.product.category,
        price: item.product.price,
        description: item.product.description,
        dateAdded: new Date(item.dateAdded).toLocaleDateString()
      }));

      if (format === 'json') {
        this.downloadJSON(exportData);
      } else {
        this.downloadCSV(exportData);
      }
      
      this.showExportModal = false;
    } catch (error) {
      console.error('Error exporting favorites:', error);
    }
  }

  private downloadJSON(data: any[]): void {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    this.downloadFile(blob, 'favorites.json');
  }

  private downloadCSV(data: any[]): void {
    const headers = ['Name', 'Category', 'Price', 'Description', 'Date Added'];
    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        `"${row.name}"`,
        `"${row.category}"`,
        row.price,
        `"${row.description}"`,
        `"${row.dateAdded}"`
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    this.downloadFile(blob, 'favorites.csv');
  }

  private downloadFile(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  // Share Functionality
  shareFavorites(): void {
    this.showShareModal = true;
    this.createdShareUrl = null;
  }

  createShare(): void {
    if (!this.shareSettings.valid || this.favorites.length === 0) {
      return;
    }

    this.isCreatingShare = true;

    const productIds = this.favorites.map(fav => fav.productId);
    const settings: ShareSettings = this.shareSettings.value;

    const shareData = this.wishlistShareService.createShare(
      this.currentUser.userId,
      productIds,
      settings
    );

    if (shareData) {
      this.createdShareUrl = shareData.shareUrl;
    } else {
      alert('Failed to create share link. Please try again.');
    }

    this.isCreatingShare = false;
  }

  copyShareLink(): void {
    if (this.createdShareUrl) {
      navigator.clipboard.writeText(this.createdShareUrl).then(() => {
        alert('Share link copied to clipboard!');
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = this.createdShareUrl!;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Share link copied to clipboard!');
      });
    }
  }

  closeShareModal(): void {
    this.showShareModal = false;
    this.createdShareUrl = null;
    this.isCreatingShare = false;
  }

  shareOnSocial(platform: string): void {
    if (!this.createdShareUrl) return;

    const url = encodeURIComponent(this.createdShareUrl);
    const text = encodeURIComponent(`Check out my wishlist from OUR-Bikes Store!`);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${url}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }

  // Utility Methods
  formatDate(dateAdded: number): string {
    return new Date(dateAdded).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getCategoryLabel(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1);
  }

  // Navigation
  goToProduct(productId: string): void {
    // Navigate to product detail
    window.location.href = `/products/${productId}`;
  }

  addToCart(productId: string): void {
    // Add to cart functionality
    try {
      // Get current cart items from localStorage
      const cartItems = this.enhancedStorageService.get(STORAGE_KEYS.CART) as any[] || [];
      const existingItem = cartItems.find((item: any) => item.productId === productId);
      
      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.updatedAt = Date.now();
      } else {
        cartItems.push({
          productId: productId,
          quantity: 1,
          addedAt: Date.now(),
          updatedAt: Date.now()
        });
      }
      
      // Save updated cart items to localStorage
      this.enhancedStorageService.set(STORAGE_KEYS.CART, cartItems);
      alert('Product added to cart!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert('Failed to add product to cart');
    }
  }

  // Modal Management
  closeExportModal(): void {
    this.showExportModal = false;
  }
}
