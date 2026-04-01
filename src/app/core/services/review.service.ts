import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userEmail: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  helpful: number;
  notHelpful: number;
  createdAt: number;
  updatedAt: number;
}

export interface ReviewFilter {
  rating: number;
  verified: boolean;
  sortBy: 'newest' | 'oldest' | 'highest' | 'lowest' | 'helpful';
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private readonly STORAGE_KEY = 'our_bikes_product_reviews';

  constructor(private storageService: StorageService) {}

  // Get all reviews for a product
  getReviews(productId: string, filter?: ReviewFilter): Review[] {
    try {
      const allReviews = this.storageService.getComments() as Review[] || [];
      let productReviews = allReviews.filter(review => review.productId === productId);

      // Apply filters
      if (filter) {
        if (filter.rating > 0) {
          productReviews = productReviews.filter(review => review.rating === filter.rating);
        }
        if (filter.verified) {
          productReviews = productReviews.filter(review => review.verified);
        }
      }

      // Apply sorting
      productReviews = this.sortReviews(productReviews, filter?.sortBy || 'newest');

      return productReviews;
    } catch (error) {
      console.error('Error getting reviews:', error);
      return [];
    }
  }

  // Get review statistics for a product
  getReviewStats(productId: string): {
    total: number;
    average: number;
    distribution: Record<number, number>;
    verified: number;
  } {
    try {
      const reviews = this.getReviews(productId);
      const total = reviews.length;
      const verified = reviews.filter(r => r.verified).length;
      
      if (total === 0) {
        return {
          total: 0,
          average: 0,
          distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          verified: 0
        };
      }

      const average = reviews.reduce((sum, review) => sum + review.rating, 0) / total;
      const distribution: Record<string, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      
      reviews.forEach(review => {
        distribution[review.rating.toString()]++;
      });

      return {
        total,
        average,
        distribution,
        verified
      };
    } catch (error) {
      console.error('Error getting review stats:', error);
      return {
        total: 0,
        average: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        verified: 0
      };
    }
  }

  // Add a new review
  addReview(review: Omit<Review, 'id' | 'verified' | 'helpful' | 'notHelpful' | 'createdAt' | 'updatedAt'>): boolean {
    try {
      const allReviews = this.storageService.getComments() as Review[] || [];
      
      // Check if user already reviewed this product
      const existingReview = allReviews.find(r => 
        r.productId === review.productId && r.userId === review.userId
      );
      
      if (existingReview) {
        return false; // User already reviewed
      }

      const newReview: Review = {
        ...review,
        id: this.storageService.generateId(),
        verified: false, // Will be verified by admin
        helpful: 0,
        notHelpful: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      allReviews.push(newReview);
      return this.storageService.setComments(allReviews);
    } catch (error) {
      console.error('Error adding review:', error);
      return false;
    }
  }

  // Update an existing review
  updateReview(reviewId: string, updates: Partial<Review>): boolean {
    try {
      const allReviews = this.storageService.getComments() as Review[] || [];
      const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
      
      if (reviewIndex === -1) {
        return false;
      }

      allReviews[reviewIndex] = {
        ...allReviews[reviewIndex],
        ...updates,
        updatedAt: Date.now()
      };

      return this.storageService.setComments(allReviews);
    } catch (error) {
      console.error('Error updating review:', error);
      return false;
    }
  }

  // Delete a review
  deleteReview(reviewId: string): boolean {
    try {
      const allReviews = this.storageService.getComments() as Review[] || [];
      const filteredReviews = allReviews.filter(r => r.id !== reviewId);
      return this.storageService.setComments(filteredReviews);
    } catch (error) {
      console.error('Error deleting review:', error);
      return false;
    }
  }

  // Mark review as helpful
  markHelpful(reviewId: string): boolean {
    try {
      const allReviews = this.storageService.getComments() as Review[] || [];
      const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
      
      if (reviewIndex === -1) {
        return false;
      }

      allReviews[reviewIndex].helpful++;
      return this.storageService.setComments(allReviews);
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      return false;
    }
  }

  // Mark review as not helpful
  markNotHelpful(reviewId: string): boolean {
    try {
      const allReviews = this.storageService.getComments() as Review[] || [];
      const reviewIndex = allReviews.findIndex(r => r.id === reviewId);
      
      if (reviewIndex === -1) {
        return false;
      }

      allReviews[reviewIndex].notHelpful++;
      return this.storageService.setComments(allReviews);
    } catch (error) {
      console.error('Error marking review as not helpful:', error);
      return false;
    }
  }

  // Get user's review for a product
  getUserReview(productId: string, userId: string): Review | null {
    try {
      const allReviews = this.storageService.getComments() as Review[] || [];
      return allReviews.find(r => r.productId === productId && r.userId === userId) || null;
    } catch (error) {
      console.error('Error getting user review:', error);
      return null;
    }
  }

  // Verify review (admin function)
  verifyReview(reviewId: string): boolean {
    return this.updateReview(reviewId, { verified: true });
  }

  // Get reviews by user
  getUserReviews(userId: string): Review[] {
    try {
      const allReviews = this.storageService.getComments() as Review[] || [];
      return allReviews.filter(r => r.userId === userId);
    } catch (error) {
      console.error('Error getting user reviews:', error);
      return [];
    }
  }

  // Private method to sort reviews
  private sortReviews(reviews: Review[], sortBy: string): Review[] {
    const sorted = [...reviews];
    
    switch (sortBy) {
      case 'newest':
        return sorted.sort((a, b) => b.createdAt - a.createdAt);
      case 'oldest':
        return sorted.sort((a, b) => a.createdAt - b.createdAt);
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'helpful':
        return sorted.sort((a, b) => b.helpful - a.helpful);
      default:
        return sorted;
    }
  }
}
