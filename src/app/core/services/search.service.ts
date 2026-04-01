import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { BehaviorSubject, Observable, debounceTime, distinctUntilChanged, map } from 'rxjs';

export interface SearchSuggestion {
  id: string;
  type: 'product' | 'category' | 'brand';
  title: string;
  subtitle?: string;
  image?: string;
  url: string;
  category?: string;
  price?: number;
}

export interface SearchHistoryItem {
  query: string;
  timestamp: number;
  resultCount: number;
}

export interface SearchOptions {
  includeProducts?: boolean;
  includeCategories?: boolean;
  includeBrands?: boolean;
  limit?: number;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private readonly STORAGE_KEY = 'our_bikes_search_history';
  private readonly MAX_HISTORY_ITEMS = 10;
  
  private searchSuggestions$ = new BehaviorSubject<SearchSuggestion[]>([]);
  private searchHistory$ = new BehaviorSubject<SearchHistoryItem[]>([]);
  private isSearching$ = new BehaviorSubject<boolean>(false);

  constructor(private storageService: StorageService) {}

  // Get search suggestions as observable
  getSearchSuggestions(): Observable<SearchSuggestion[]> {
    return this.searchSuggestions$.asObservable();
  }

  // Get search history as observable
  getSearchHistory(): Observable<SearchHistoryItem[]> {
    return this.searchHistory$.asObservable();
  }

  // Get searching state as observable
  getIsSearching(): Observable<boolean> {
    return this.isSearching$.asObservable();
  }

  // Search with autocomplete suggestions
  search(query: string, options: SearchOptions = {}): Observable<SearchSuggestion[]> {
    return new Observable(observer => {
      if (!query || query.trim().length < 2) {
        this.searchSuggestions$.next([]);
        observer.next([]);
        observer.complete();
        return;
      }

      this.isSearching$.next(true);

      try {
        const suggestions = this.generateSuggestions(query, options);
        this.searchSuggestions$.next(suggestions);
        observer.next(suggestions);
      } catch (error) {
        console.error('Error generating search suggestions:', error);
        observer.error(error);
      } finally {
        this.isSearching$.next(false);
        observer.complete();
      }
    }).pipe(
      debounceTime(300),
      distinctUntilChanged(),
      map(suggestions => suggestions as SearchSuggestion[])
    );
  }

  // Generate search suggestions
  private generateSuggestions(query: string, options: SearchOptions): SearchSuggestion[] {
    const suggestions: SearchSuggestion[] = [];
    const normalizedQuery = query.toLowerCase().trim();
    
    const opts = {
      includeProducts: true,
      includeCategories: true,
      includeBrands: true,
      limit: 8,
      ...options
    };

    // Product suggestions
    if (opts.includeProducts) {
      const products = this.storageService.getProducts() as any[] || [];
      const productSuggestions = products
        .filter(product => 
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.description.toLowerCase().includes(normalizedQuery)
        )
        .slice(0, opts.limit)
        .map(product => ({
          id: product.id,
          type: 'product' as const,
          title: product.name,
          subtitle: `$${product.price}`,
          image: product.images?.[0] || 'https://picsum.photos/seed/product-default/400/300.jpg',
          url: `/product/${product.id}`,
          category: product.category,
          price: product.price
        }));
      
      suggestions.push(...productSuggestions);
    }

    // Category suggestions
    if (opts.includeCategories) {
      const categories = this.getCategories();
      const categorySuggestions = categories
        .filter(category => 
          category.toLowerCase().includes(normalizedQuery) ||
          this.getCategoryDisplayName(category).toLowerCase().includes(normalizedQuery)
        )
        .slice(0, 3)
        .map(category => ({
          id: category,
          type: 'category' as const,
          title: this.getCategoryDisplayName(category),
          subtitle: `${this.getProductCountByCategory(category)} products`,
          image: this.getCategoryImage(category),
          url: `/products?category=${category}`,
          category
        }));
      
      suggestions.push(...categorySuggestions);
    }

    // Brand suggestions
    if (opts.includeBrands) {
      const brands = this.getBrands();
      const brandSuggestions = brands
        .filter(brand => brand.toLowerCase().includes(normalizedQuery))
        .slice(0, 3)
        .map(brand => ({
          id: brand,
          type: 'brand' as const,
          title: brand,
          subtitle: `${this.getProductCountByBrand(brand)} products`,
          image: 'https://picsum.photos/seed/brand-logo/400/300.jpg',
          url: `/products?brand=${encodeURIComponent(brand)}`,
          category: 'all'
        }));
      
      suggestions.push(...brandSuggestions);
    }

    return suggestions.slice(0, opts.limit);
  }

  // Get all categories
  private getCategories(): string[] {
    const products = this.storageService.getProducts() as any[] || [];
    return [...new Set(products.map(p => p.category).filter(Boolean))];
  }

  // Get category display name
  private getCategoryDisplayName(category: string): string {
    const categoryMap: Record<string, string> = {
      bikes: 'Motorbikes',
      accessory: 'Accessories',
      souvenir: 'Souvenirs',
      tool: 'Tools'
    };
    return categoryMap[category] || category;
  }

  // Get category image
  private getCategoryImage(category: string): string {
    const categoryImages: Record<string, string> = {
      bikes: 'https://picsum.photos/seed/bikes-category/400/300.jpg',
      accessory: 'https://picsum.photos/seed/accessory-category/400/300.jpg',
      souvenir: 'https://picsum.photos/seed/souvenir-category/400/300.jpg',
      tool: 'https://picsum.photos/seed/tool-category/400/300.jpg'
    };
    return categoryImages[category] || 'https://picsum.photos/seed/category-default/400/300.jpg';
  }

  // Get product count by category
  private getProductCountByCategory(category: string): number {
    const products = this.storageService.getProducts() as any[] || [];
    return products.filter(p => p.category === category).length;
  }

  // Get all brands
  private getBrands(): string[] {
    const products = this.storageService.getProducts() as any[] || [];
    return [...new Set(products.map(p => p.specifications?.brand).filter(Boolean))];
  }

  // Get product count by brand
  private getProductCountByBrand(brand: string): number {
    const products = this.storageService.getProducts() as any[] || [];
    return products.filter(p => p.specifications?.brand === brand).length;
  }

  // Add search to history
  addToSearchHistory(query: string, resultCount = 0): void {
    if (!query || query.trim().length < 2) {
      return;
    }

    try {
      const history = this.getSearchHistoryFromStorage();
      const newItem: SearchHistoryItem = {
        query: query.trim(),
        timestamp: Date.now(),
        resultCount
      };

      // Remove existing query if present
      const filteredHistory = history.filter(item => item.query !== newItem.query);
      
      // Add new item at the beginning
      const updatedHistory = [newItem, ...filteredHistory].slice(0, this.MAX_HISTORY_ITEMS);
      
      this.storageService.set(this.STORAGE_KEY, updatedHistory);
      this.searchHistory$.next(updatedHistory);
    } catch (error) {
      console.error('Error adding to search history:', error);
    }
  }

  // Get search history from storage
  private getSearchHistoryFromStorage(): SearchHistoryItem[] {
    try {
      return this.storageService.get(this.STORAGE_KEY) as SearchHistoryItem[] || [];
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  // Load search history
  loadSearchHistory(): void {
    const history = this.getSearchHistoryFromStorage();
    this.searchHistory$.next(history);
  }

  // Clear search history
  clearSearchHistory(): void {
    try {
      this.storageService.remove(this.STORAGE_KEY);
      this.searchHistory$.next([]);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }

  // Remove specific item from history
  removeFromHistory(query: string): void {
    try {
      const history = this.getSearchHistoryFromStorage();
      const filteredHistory = history.filter(item => item.query !== query);
      
      this.storageService.set(this.STORAGE_KEY, filteredHistory);
      this.searchHistory$.next(filteredHistory);
    } catch (error) {
      console.error('Error removing from search history:', error);
    }
  }

  // Get recent searches (last 5)
  getRecentSearches(): SearchHistoryItem[] {
    const history = this.getSearchHistoryFromStorage();
    return history.slice(0, 5);
  }

  // Get popular searches (most frequent)
  getPopularSearches(): SearchHistoryItem[] {
    const history = this.getSearchHistoryFromStorage();
    const queryCounts = new Map<string, number>();
    
    history.forEach(item => {
      const current = queryCounts.get(item.query) || 0;
      queryCounts.set(item.query, current + 1);
    });
    
    return Array.from(queryCounts.entries())
      .map(([query, count]) => ({ 
        query, 
        timestamp: Date.now() - Math.random() * 86400000, // Random timestamp for variety
        resultCount: count 
      }))
      .sort((a, b) => b.resultCount - a.resultCount)
      .slice(0, 5);
  }

  // Clear search suggestions
  clearSearchSuggestions(): void {
    this.searchSuggestions$.next([]);
  }

  // Get search statistics
  getSearchStats(): {
    totalSearches: number;
    averageResultCount: number;
    mostRecentQuery: string | null;
    topCategory: string;
  } {
    const history = this.getSearchHistoryFromStorage();
    
    if (history.length === 0) {
      return {
        totalSearches: 0,
        averageResultCount: 0,
        mostRecentQuery: null,
        topCategory: 'none'
      };
    }

    const totalSearches = history.length;
    const averageResultCount = history.reduce((sum, item) => sum + item.resultCount, 0) / totalSearches;
    const mostRecentQuery = history[0]?.query || null;
    
    // Find most searched category (simple heuristic)
    const categoryCounts = new Map<string, number>();
    history.forEach(item => {
      const category = this.inferCategoryFromQuery(item.query);
      const current = categoryCounts.get(category) || 0;
      categoryCounts.set(category, current + 1);
    });
    
    const topCategory = Array.from(categoryCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'none';

    return {
      totalSearches,
      averageResultCount: Math.round(averageResultCount),
      mostRecentQuery,
      topCategory
    };
  }

  // Simple category inference from query
  private inferCategoryFromQuery(query: string): string {
    const lowerQuery = query.toLowerCase();
    const keywords: Record<string, string[]> = {
      bikes: ['bike', 'motorcycle', 'motorbike', 'crf', 'ktm', 'yamaha', 'suzuki', 'honda'],
      accessory: ['helmet', 'boots', 'jersey', 'gloves', 'gear', 'protective'],
      souvenir: ['t-shirt', 'cap', 'merchandise', 'souvenir', 'gift'],
      tool: ['tool', 'kit', 'stand', 'maintenance', 'repair']
    };

    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => lowerQuery.includes(word))) {
        return category;
      }
    }
    
    return 'general';
  }
}
