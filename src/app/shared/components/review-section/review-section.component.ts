import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ReviewService, Review, ReviewFilter } from '../../../core/services/review.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-review-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './review-section.component.html',
  styleUrls: ['./review-section.component.scss']
})
export class ReviewSectionComponent implements OnInit {
  @Input() productId = '';
  @Output() reviewAdded = new EventEmitter<void>();

  reviews: Review[] = [];
  isLoading = true;
  currentUser: any = null;
  userReview: Review | null = null;
  
  // Review form
  reviewForm!: FormGroup;
  showReviewForm = false;
  submittingReview = false;
  
  // Filter and pagination
  reviewFilter: ReviewFilter = {
    rating: 0,
    verified: false,
    sortBy: 'newest'
  };
  
  // Statistics
  reviewStats: any = null;
  
  // Pagination
  currentPage = 1;
  reviewsPerPage = 5;
  totalPages = 0;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  private initializeComponent(): void {
    // Check authentication
    this.currentUser = this.authService.getCurrentUserValue();
    
    // Initialize form
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      content: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
    });

    // Load reviews
    this.loadReviews();
    
    // Check if user has already reviewed
    if (this.currentUser && this.productId) {
      this.userReview = this.reviewService.getUserReview(this.productId, this.currentUser.userId);
    }
  }

  private loadReviews(): void {
    if (!this.productId) return;
    
    try {
      this.isLoading = true;
      this.reviews = this.reviewService.getReviews(this.productId, this.reviewFilter);
      this.reviewStats = this.reviewService.getReviewStats(this.productId);
      this.calculatePagination();
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private calculatePagination(): void {
    this.totalPages = Math.ceil(this.reviews.length / this.reviewsPerPage);
    this.currentPage = 1;
  }

  // Form methods
  toggleReviewForm(): void {
    if (!this.currentUser) {
      alert('Please login to write a review');
      return;
    }
    
    this.showReviewForm = !this.showReviewForm;
    if (this.showReviewForm) {
      this.reviewForm.reset({
        rating: 5,
        title: '',
        content: ''
      });
    }
  }

  submitReview(): void {
    if (this.reviewForm.invalid) {
      this.reviewForm.markAllAsTouched();
      return;
    }

    if (!this.currentUser || !this.productId) return;

    this.submittingReview = true;

    try {
      const reviewData = {
        productId: this.productId,
        userId: this.currentUser.userId,
        userName: `${this.currentUser.firstName} ${this.currentUser.lastName}`,
        userEmail: this.currentUser.email,
        rating: this.reviewForm.value.rating,
        title: this.reviewForm.value.title,
        content: this.reviewForm.value.content
      };

      if (this.reviewService.addReview(reviewData)) {
        this.showReviewForm = false;
        this.reviewForm.reset();
        this.loadReviews();
        this.userReview = this.reviewService.getUserReview(this.productId, this.currentUser.userId);
        this.reviewAdded.emit();
        alert('Review submitted successfully! It will be visible after verification.');
      } else {
        alert('You have already reviewed this product.');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review');
    } finally {
      this.submittingReview = false;
    }
  }

  cancelReview(): void {
    this.showReviewForm = false;
    this.reviewForm.reset();
  }

  // Filter methods
  onRatingFilterChange(rating: number): void {
    this.reviewFilter.rating = rating;
    this.loadReviews();
  }

  onVerifiedFilterChange(): void {
    this.reviewFilter.verified = !this.reviewFilter.verified;
    this.loadReviews();
  }

  onSortChange(sortBy: string): void {
    this.reviewFilter.sortBy = sortBy as any;
    this.loadReviews();
  }

  clearFilters(): void {
    this.reviewFilter = {
      rating: 0,
      verified: false,
      sortBy: 'newest'
    };
    this.loadReviews();
  }

  // Review interaction methods
  markHelpful(reviewId: string): void {
    if (this.reviewService.markHelpful(reviewId)) {
      this.loadReviews();
    }
  }

  markNotHelpful(reviewId: string): void {
    if (this.reviewService.markNotHelpful(reviewId)) {
      this.loadReviews();
    }
  }

  // Utility methods
  getStars(rating: number): string[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 'bi-star-fill' : i - 0.5 <= rating ? 'bi-star-half' : 'bi-star');
    }
    return stars;
  }

  formatDate(date: number): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getRatingPercentage(rating: number): number {
    if (!this.reviewStats || this.reviewStats.total === 0) return 0;
    return (this.reviewStats.distribution[rating] / this.reviewStats.total) * 100;
  }

  // Pagination methods
  getPaginatedReviews(): Review[] {
    const startIndex = (this.currentPage - 1) * this.reviewsPerPage;
    const endIndex = startIndex + this.reviewsPerPage;
    return this.reviews.slice(startIndex, endIndex);
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    
    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, this.currentPage - 2);
      const end = Math.min(this.totalPages, start + maxVisiblePages - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }
}
