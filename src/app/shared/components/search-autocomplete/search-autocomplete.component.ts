import { Component, OnInit, OnDestroy, inject, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SearchService, SearchSuggestion, SearchHistoryItem } from '../../../core/services/search.service';

@Component({
  selector: 'app-search-autocomplete',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './search-autocomplete.component.html',
  styleUrls: ['./search-autocomplete.component.scss']
})
export class SearchAutocompleteComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  
  searchForm!: FormGroup;
  suggestions: SearchSuggestion[] = [];
  searchHistory: SearchHistoryItem[] = [];
  recentSearches: SearchHistoryItem[] = [];
  popularSearches: SearchHistoryItem[] = [];
  
  isSearching = false;
  showSuggestions = false;
  showHistory = false;
  showAdvanced = false;
  
  selectedIndex = -1;
  searchQuery = '';

  private searchService = inject(SearchService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private initializeComponent(): void {
    // Initialize search form
    this.searchForm = this.fb.group({
      query: ['']
    });

    // Load search data
    this.searchService.loadSearchHistory();
    this.recentSearches = this.searchService.getRecentSearches();
    this.popularSearches = this.searchService.getPopularSearches();

    // Subscribe to search suggestions
    this.searchService.getSearchSuggestions().subscribe(suggestions => {
      this.suggestions = suggestions;
      this.selectedIndex = -1;
    });

    // Subscribe to searching state
    this.searchService.getIsSearching().subscribe(isSearching => {
      this.isSearching = isSearching;
    });

    // Subscribe to search history
    this.searchService.getSearchHistory().subscribe(history => {
      this.searchHistory = history;
      this.recentSearches = this.searchService.getRecentSearches();
    });

    // Subscribe to form changes
    this.searchForm.get('query')?.valueChanges.subscribe(query => {
      this.searchQuery = query;
      this.handleSearchInput(query);
    });
  }

  private handleSearchInput(query: string): void {
    if (!query || query.trim().length < 2) {
      this.showSuggestions = false;
      this.searchService.clearSearchSuggestions();
      return;
    }

    this.showSuggestions = true;
    this.showHistory = false;
    this.selectedIndex = -1;

    // Generate search suggestions
    this.searchService.search(query, {
      includeProducts: true,
      includeCategories: true,
      includeBrands: true,
      limit: 8
    });
  }

  // Handle search submission
  onSearchSubmit(): void {
    const query = this.searchForm.get('query')?.value?.trim();
    
    if (!query) {
      return;
    }

    this.performSearch(query);
  }

  // Helper method to get current timestamp
  getCurrentTimestamp(): number {
    return Date.now();
  }

  // Helper method to create search history item
  createSearchHistoryItem(query: string, resultCount: number): SearchHistoryItem {
    return {
      query,
      timestamp: this.getCurrentTimestamp(),
      resultCount
    };
  }

  private performSearch(query: string): void {
    // Add to search history
    this.searchService.addToSearchHistory(query, this.suggestions.length);

    // Navigate to search results
    this.router.navigate(['/products'], { 
      queryParams: { 
        search: query,
        from: 'autocomplete'
      }
    });

    // Clear suggestions and hide dropdown
    this.clearSuggestions();
    this.showSuggestions = false;
  }

  // Handle suggestion selection
  selectSuggestion(suggestion: SearchSuggestion): void {
    this.searchForm.get('query')?.setValue(suggestion.title);
    this.performSearch(suggestion.title);
  }

  // Handle keyboard navigation
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (!this.showSuggestions) {
      return;
    }

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.suggestions.length - 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        break;
      case 'Enter':
        event.preventDefault();
        if (this.selectedIndex >= 0 && this.suggestions[this.selectedIndex]) {
          this.selectSuggestion(this.suggestions[this.selectedIndex]);
        } else {
          this.onSearchSubmit();
        }
        break;
      case 'Escape':
        this.clearSuggestions();
        break;
    }
  }

  // Clear suggestions
  clearSuggestions(): void {
    this.suggestions = [];
    this.showSuggestions = false;
    this.selectedIndex = -1;
    this.searchService.clearSearchSuggestions();
  }

  // Focus search input
  focusSearchInput(): void {
    setTimeout(() => {
      this.searchInput?.nativeElement.focus();
    }, 100);
  }

  // Toggle advanced search
  toggleAdvancedSearch(): void {
    this.showAdvanced = !this.showAdvanced;
  }

  // Select history item
  selectHistoryItem(item: SearchHistoryItem): void {
    this.searchForm.get('query')?.setValue(item.query);
    this.performSearch(item.query);
  }

  // Remove from history
  removeFromHistory(item: SearchHistoryItem): void {
    this.searchService.removeFromHistory(item.query);
  }

  // Clear all history
  clearAllHistory(): void {
    if (confirm('Are you sure you want to clear all search history?')) {
      this.searchService.clearSearchHistory();
      this.recentSearches = [];
      this.popularSearches = [];
    }
  }

  // Get suggestion icon
  getSuggestionIcon(type: SearchSuggestion['type']): string {
    const icons = {
      product: 'bi-box-seam',
      category: 'bi-grid-3x3-gap',
      brand: 'bi-tag'
    };
    return icons[type] || 'bi-search';
  }

  // Get suggestion type label
  getSuggestionTypeLabel(type: SearchSuggestion['type']): string {
    const labels = {
      product: 'Product',
      category: 'Category',
      brand: 'Brand'
    };
    return labels[type] || 'Suggestion';
  }

  // Format price
  formatPrice(price?: number): string {
    if (!price) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  // Format date
  formatDate(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  // Get search statistics
  getSearchStats() {
    return this.searchService.getSearchStats();
  }

  // Handle click outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.search-autocomplete');
    
    if (!clickedInside) {
      this.clearSuggestions();
      this.showHistory = false;
    }
  }

  private cleanup(): void {
    this.clearSuggestions();
  }

  // Track if suggestion is selected
  isSuggestionSelected(index: number): boolean {
    return this.selectedIndex === index;
  }
}
