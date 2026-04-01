import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { SearchService, SearchSuggestion, SearchHistoryItem } from '../../../core/services/search.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit, OnDestroy {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  
  searchQuery = '';
  suggestions: SearchSuggestion[] = [];
  searchHistory: SearchHistoryItem[] = [];
  recentSearches: SearchHistoryItem[] = [];
  popularSearches: SearchHistoryItem[] = [];
  
  isDropdownOpen = false;
  isSearching = false;
  showHistory = true;
  showSuggestions = false;
  
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  private searchService = inject(SearchService);
  private router = inject(Router);

  ngOnInit(): void {
    this.initializeSearch();
    this.loadSearchData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Initialize search functionality
  private initializeSearch(): void {
    // Setup search with debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(query => {
      this.performSearch(query);
    });

    // Listen to search suggestions
    this.searchService.getSearchSuggestions()
      .pipe(takeUntil(this.destroy$))
      .subscribe(suggestions => {
        this.suggestions = suggestions;
        this.isSearching = false;
        this.updateDropdownState();
      });

    // Listen to search history
    this.searchService.getSearchHistory()
      .pipe(takeUntil(this.destroy$))
      .subscribe(history => {
        this.searchHistory = history;
        this.recentSearches = this.searchService.getRecentSearches();
        this.popularSearches = this.searchService.getPopularSearches();
      });

    // Listen to searching state
    this.searchService.getIsSearching()
      .pipe(takeUntil(this.destroy$))
      .subscribe(isSearching => {
        this.isSearching = isSearching;
      });
  }

  // Load initial search data
  private loadSearchData(): void {
    this.searchService.loadSearchHistory();
    this.recentSearches = this.searchService.getRecentSearches();
    this.popularSearches = this.searchService.getPopularSearches();
  }

  // Handle input change
  onInputChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value;
    this.searchQuery = query;
    this.searchSubject.next(query);
  }

  // Perform search
  private performSearch(query: string): void {
    if (query.trim().length < 2) {
      this.clearSearch();
      return;
    }

    this.isSearching = true;
    this.showHistory = false;
    this.showSuggestions = true;
    
    this.searchService.search(query);
  }

  // Clear search
  clearSearch(): void {
    this.searchQuery = '';
    this.suggestions = [];
    this.showHistory = true;
    this.showSuggestions = false;
    this.searchService.clearSearchSuggestions();
  }

  // Handle suggestion click
  onSuggestionClick(suggestion: SearchSuggestion): void {
    this.searchQuery = suggestion.title;
    this.addToHistory(suggestion.title);
    this.closeDropdown();
    this.router.navigate([suggestion.url]);
  }

  // Handle history item click
  onHistoryItemClick(item: SearchHistoryItem): void {
    this.searchQuery = item.query;
    this.closeDropdown();
    this.performSearch(item.query);
    this.router.navigate(['/products'], { queryParams: { search: item.query } });
  }

  // Handle popular search click
  onPopularSearchClick(item: { query: string; count: number }): void {
    this.searchQuery = item.query;
    this.closeDropdown();
    this.performSearch(item.query);
    this.router.navigate(['/products'], { queryParams: { search: item.query } });
  }

  // Handle search submit
  onSearchSubmit(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    
    if (this.searchQuery.trim().length < 2) {
      return;
    }

    this.addToHistory(this.searchQuery);
    this.closeDropdown();
    this.router.navigate(['/products'], { queryParams: { search: this.searchQuery } });
  }

  // Add to search history
  private addToHistory(query: string): void {
    this.searchService.addToSearchHistory(query, this.suggestions.length);
  }

  // Remove from history
  removeFromHistory(query: string): void {
    this.searchService.removeFromHistory(query);
  }

  // Clear all history
  clearAllHistory(): void {
    this.searchService.clearSearchHistory();
  }

  // Close dropdown
  closeDropdown(): void {
    this.isDropdownOpen = false;
    this.showHistory = true;
    this.showSuggestions = false;
  }

  // Update dropdown state
  private updateDropdownState(): void {
    this.isDropdownOpen = this.searchQuery.length >= 2 || this.showHistory;
  }

  // Handle focus
  onFocus(): void {
    this.isDropdownOpen = true;
    this.updateDropdownState();
  }

  // Handle blur (with delay to allow clicking suggestions)
  onBlur(): void {
    setTimeout(() => {
      if (!this.isInputFocused()) {
        this.closeDropdown();
      }
    }, 200);
  }

  // Check if input is focused
  private isInputFocused(): boolean {
    return document.activeElement === this.searchInput?.nativeElement;
  }

  // Handle keyboard navigation
  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Escape':
        this.closeDropdown();
        break;
      case 'ArrowDown':
        event.preventDefault();
        // Navigate to next suggestion
        this.navigateSuggestions();
        break;
      case 'ArrowUp':
        event.preventDefault();
        // Navigate to previous suggestion
        this.navigateSuggestions();
        break;
      case 'Enter':
        if (this.suggestions.length > 0) {
          event.preventDefault();
          // Select first suggestion
          this.onSuggestionClick(this.suggestions[0]);
        } else {
          this.onSearchSubmit(event);
        }
        break;
    }
  }

  // Navigate suggestions with keyboard
  private navigateSuggestions(): void {
    // Implementation for keyboard navigation
    // This would require tracking selected index and updating UI
    // For now, this is a placeholder for the functionality
  }

  // Handle click outside
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const searchContainer = this.searchInput?.nativeElement?.closest('.search-container');
    
    if (searchContainer && !searchContainer.contains(target)) {
      this.closeDropdown();
    }
  }

  // Get suggestion icon based on type
  getSuggestionIcon(type: string): string {
    const iconMap: Record<string, string> = {
      product: 'bi-box',
      category: 'bi-grid-3x3-gap',
      brand: 'bi-building'
    };
    return iconMap[type] || 'bi-search';
  }

  // Format timestamp
  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  // Focus search input
  focusSearch(): void {
    if (this.searchInput) {
      this.searchInput.nativeElement.focus();
    }
  }
}
