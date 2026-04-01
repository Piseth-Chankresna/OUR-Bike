import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EnhancedStorageService } from '../../../core/services/enhanced-storage.service';
import { AuthService } from '../../../core/services/auth.service';
import { ComparisonService } from '../../../core/services/comparison.service';
import { STORAGE_KEYS } from '../../../core/types/data.types';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  images: string[];
  description: string;
  featured?: boolean;
  inStock?: boolean;
  rating?: number;
  reviews?: number;
  stock?: number;
  dateAdded?: number;
  specifications?: any;
}

interface FilterOptions {
  category: string;
  minPrice: number;
  maxPrice: number;
  inStock: boolean;
  rating: number;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit, OnDestroy {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading = true;
  
  // Filtering and sorting
  filterForm: FormGroup;
  sortBy = 'name';
  sortOrder = 'asc';
  searchTerm = '';
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 12;
  totalPages = 0;
  
  // Categories
  categories = [
    { id: 'all', name: 'All Products' },
    { id: 'bikes', name: 'Motorbikes' },
    { id: 'accessory', name: 'Accessories' },
    { id: 'souvenir', name: 'Souvenirs' },
    { id: 'tool', name: 'Tools' }
  ];
  
  // Price ranges
  priceRanges = [
    { min: 0, max: 100, label: 'Under $100' },
    { min: 100, max: 500, label: '$100 - $500' },
    { min: 500, max: 1000, label: '$500 - $1,000' },
    { min: 1000, max: 5000, label: '$1,000 - $5,000' },
    { min: 5000, max: 999999, label: 'Over $5,000' }
  ];
  
  // Ratings
  ratings = [5, 4, 3, 2, 1];

  constructor(
    private enhancedStorageService: EnhancedStorageService,
    private authService: AuthService,
    private comparisonService: ComparisonService,
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {
    this.filterForm = this.fb.group({
      category: ['all'],
      minPrice: [0],
      maxPrice: [999999],
      inStock: [false],
      rating: [0],
      search: ['']
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.setupRouteParams();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private setupRouteParams(): void {
    this.route.queryParams.subscribe(params => {
      if (params['category']) {
        this.filterForm.patchValue({ category: params['category'] });
        this.applyFilters();
      }
    });
  }

  private setupFormListeners(): void {
    this.filterForm.valueChanges.subscribe(() => {
      this.applyFilters();
    });
  }

  private loadProducts(): void {
    this.isLoading = true;
    const products = this.enhancedStorageService.get(STORAGE_KEYS.PRODUCTS) as Product[];
    this.products = products.map(product => ({
      ...product,
      inStock: (product.stock || 0) > 0,
      featured: product.featured || false,
      rating: product.rating || 0,
      reviews: product.reviews || 0
    }));
    this.applyFilters();
    this.isLoading = false;
  }

  // Helper method to get product image
  getProductImage(product: Product): string {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return 'https://via.placeholder.com/300x200/cccccc/666666?text=No+Image';
  }

  private applyFilters(): void {
    let filtered = [...this.products];
    
    const filters = this.filterForm.value;
    
    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category);
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Price filter
    filtered = filtered.filter(product => 
      product.price >= filters.minPrice && product.price <= filters.maxPrice
    );
    
    // Stock filter
    if (filters.inStock) {
      filtered = filtered.filter(product => product.inStock !== false);
    }
    
    // Rating filter
    if (filters.rating > 0) {
      filtered = filtered.filter(product => 
        (product.rating || 0) >= filters.rating
      );
    }
    
    // Apply sorting
    filtered = this.sortProducts(filtered);
    
    this.filteredProducts = filtered;
    this.updatePagination();
  }

  private sortProducts(products: Product[]): Product[] {
    const sorted = [...products];
    
    switch (this.sortBy) {
      case 'name':
        sorted.sort((a, b) => {
          const comparison = a.name.localeCompare(b.name);
          return this.sortOrder === 'asc' ? comparison : -comparison;
        });
        break;
      case 'price':
        sorted.sort((a, b) => {
          const comparison = a.price - b.price;
          return this.sortOrder === 'asc' ? comparison : -comparison;
        });
        break;
      case 'rating':
        sorted.sort((a, b) => {
          const comparison = (a.rating || 0) - (b.rating || 0);
          return this.sortOrder === 'asc' ? comparison : -comparison;
        });
        break;
      case 'newest':
        sorted.sort((a, b) => {
          // This would need a date field in the product
          return 0; // Placeholder
        });
        break;
    }
    
    return sorted;
  }

  private updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  onSortChange(sortBy: string): void {
    this.sortBy = sortBy;
    this.applyFilters();
  }

  onSortOrderChange(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applyFilters();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get paginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredProducts.slice(startIndex, endIndex);
  }

  addToFavorites(productId: string): void {
    if (!this.authService.isAuthenticated()) {
      alert('Please login to add items to favorites');
      return;
    }
    
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) return;
    
    // Get current favorites from localStorage
    const favorites = this.enhancedStorageService.get(STORAGE_KEYS.WISHLIST) as any[] || [];
    
    if (!favorites.some((fav: any) => fav.productId === productId)) {
      // Add to favorites
      const newFavorite = {
        productId: productId,
        dateAdded: Date.now()
      };
      favorites.push(newFavorite);
      this.enhancedStorageService.set(STORAGE_KEYS.WISHLIST, favorites);
      alert('Product added to favorites!');
    } else {
      alert('Product already in favorites!');
    }
  }

  addToCart(productId: string): void {
    if (!this.authService.isAuthenticated()) {
      alert('Please login to add items to cart');
      return;
    }
    
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) return;
    
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
  }

  clearFilters(): void {
    this.filterForm.reset({
      category: 'all',
      minPrice: 0,
      maxPrice: 999999,
      inStock: false,
      rating: 0,
      search: ''
    });
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  getRatingStars(rating: number): string[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 'bi-star-fill' : i - 0.5 <= rating ? 'bi-star-half' : 'bi-star');
    }
    return stars;
  }

  addToComparison(productId: string): void {
    const user = this.authService.getCurrentUserValue();
    if (!user) {
      alert('Please login to add products to comparison');
      return;
    }

    if (this.comparisonService.addToComparison(user.userId, productId)) {
      alert('Product added to comparison!');
    } else {
      alert('Could not add product to comparison. You may have reached the limit (4 products).');
    }
  }

  removeFromComparison(productId: string): void {
    const user = this.authService.getCurrentUserValue();
    if (!user) return;

    this.comparisonService.removeFromComparison(user.userId, productId);
  }

  isInComparison(productId: string): boolean {
    const user = this.authService.getCurrentUserValue();
    if (!user) return false;

    return this.comparisonService.isInComparison(user.userId, productId);
  }

  getComparisonCount(): number {
    const user = this.authService.getCurrentUserValue();
    if (!user) return 0;

    return this.comparisonService.getComparisonCount(user.userId);
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  getPages(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
      const end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
}
