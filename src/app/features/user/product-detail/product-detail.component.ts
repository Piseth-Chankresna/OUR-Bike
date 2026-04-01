import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnhancedStorageService } from '../../../core/services/enhanced-storage.service';
import { AuthService } from '../../../core/services/auth.service';
import { Product } from '../../../core/models/product.model';
import { ReviewSectionComponent } from '../../../shared/components/review-section/review-section.component';
import { RecentlyViewedService } from '../../../core/services/recently-viewed.service';
import { STORAGE_KEYS } from '../../../core/types/data.types';

interface LocalProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  images?: string[];
  description: string;
  featured?: boolean;
  inStock?: boolean;
  rating?: number;
  reviews?: number;
  specifications?: Record<string, string>;
  availability?: string;
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  weight?: string;
  dimensions?: string;
  warranty?: string;
}

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, ReviewSectionComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  relatedProducts: Product[] = [];
  reviews: Review[] = [];
  isLoading = true;
  
  // Image Gallery
  currentImageIndex = 0;
  isZoomed = false;
  
  // Purchase Form
  purchaseForm: FormGroup;
  quantity = 1;
  
  // Review Form
  reviewForm: FormGroup;
  showReviewForm = false;
  userReview: Review | null = null;
  
  // Tabs
  activeTab = 'description';

  constructor(
    private enhancedStorageService: EnhancedStorageService,
    private authService: AuthService,
    private recentlyViewedService: RecentlyViewedService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.purchaseForm = this.fb.group({
      quantity: [1, [Validators.required, Validators.min(1), Validators.max(10)]]
    });
    
    this.reviewForm = this.fb.group({
      rating: [5, [Validators.required]],
      comment: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.loadProduct();
    this.loadReviews();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private loadProduct(): void {
    this.isLoading = true;
    
    this.route.paramMap.subscribe(params => {
      const productId = params.get('id');
      if (!productId) {
        this.router.navigate(['/products']);
        return;
      }

      const products = this.enhancedStorageService.get(STORAGE_KEYS.PRODUCTS) as Product[];
      this.product = products.find(p => p.id === productId) || null;
      
      if (!this.product) {
        this.router.navigate(['/products']);
        return;
      }

      // Add to recently viewed
      const productForRecentlyViewed = {
        ...this.product,
        inStock: (this.product.stock || 0) > 0,
        brand: this.product.specifications?.brand || '',
        model: this.product.specifications?.model || '',
        year: this.product.specifications?.['year'] ? parseInt(this.product.specifications?.['year']) : undefined,
        color: this.product.specifications?.color,
        weight: this.product.specifications?.weight,
        dimensions: this.product.specifications?.dimensions,
        warranty: this.product.specifications?.warranty,
        reviews: 0
      };
      this.recentlyViewedService.addToRecentlyViewed(productId, productForRecentlyViewed);

      // Enhance product with additional data
      this.product = {
        ...this.product,
        images: this.product.images || [this.product.images[0] || 'assets/images/placeholder.jpg'],
        stock: this.product.stock || 0
      };

      this.loadRelatedProducts();
      this.checkUserReview();
      this.isLoading = false;
    });
  }

  private generateSpecifications(product: Product): Record<string, string> {
    const baseSpecs: Record<string, string> = {
      'Category': product.category,
      'Price': `$${product.price}`,
      'Condition': 'New',
      'Shipping': 'Free Shipping'
    };

    if (product.category === 'bikes') {
      return {
        ...baseSpecs,
        'Engine Type': '4-Stroke',
        'Displacement': '250cc',
        'Fuel Capacity': '15L',
        'Top Speed': '120 km/h',
        'Transmission': 'Manual',
        'Brakes': 'Disc Brakes'
      };
    } else if (product.category === 'accessory') {
      return {
        ...baseSpecs,
        'Material': 'High-Quality Materials',
        'Compatibility': 'Universal',
        'Weather Resistance': 'Waterproof',
        'Installation': 'Easy Install'
      };
    } else if (product.category === 'souvenir') {
      return {
        ...baseSpecs,
        'Material': 'Premium Collectible',
        'Packaging': 'Gift Box',
        'Limited Edition': 'Yes',
        'Certificate': 'Authenticity Included'
      };
    } else if (product.category === 'tool') {
      return {
        ...baseSpecs,
        'Material': 'Steel Alloy',
        'Warranty': 'Lifetime',
        'Professional Grade': 'Yes',
        'Portability': 'Compact Design'
      };
    }

    return baseSpecs;
  }

  private loadRelatedProducts(): void {
    if (!this.product) return;
    
    const products = this.enhancedStorageService.get(STORAGE_KEYS.PRODUCTS) as Product[];
    this.relatedProducts = products
      .filter(p => p.id !== this.product!.id && p.category === this.product!.category)
      .slice(0, 4);
  }

  private loadReviews(): void {
    if (!this.product) return;
    
    // Mock reviews for now - in real app, this would come from StorageService
    this.reviews = [
      {
        id: '1',
        productId: this.product.id,
        userId: 'user1',
        userName: 'John Doe',
        rating: 5,
        comment: 'Excellent product! Exactly what I expected. Great quality and fast shipping.',
        date: '2024-01-15',
        helpful: 12
      },
      {
        id: '2',
        productId: this.product.id,
        userId: 'user2',
        userName: 'Jane Smith',
        rating: 4,
        comment: 'Good product overall. Minor issues with packaging but the product itself is great.',
        date: '2024-01-10',
        helpful: 8
      },
      {
        id: '3',
        productId: this.product.id,
        userId: 'user3',
        userName: 'Mike Johnson',
        rating: 5,
        comment: 'Amazing quality! Would definitely recommend to others. Worth every penny.',
        date: '2024-01-05',
        helpful: 15
      }
    ];
  }

  private checkUserReview(): void {
    if (!this.authService.isAuthenticated() || !this.product) return;
    
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) return;
    
    this.userReview = this.reviews.find(r => r.userId === currentUser.userId) || null;
  }

  // Image Gallery Methods
  selectImage(index: number): void {
    this.currentImageIndex = index;
  }

  nextImage(): void {
    if (!this.product?.images) return;
    this.currentImageIndex = (this.currentImageIndex + 1) % this.product.images.length;
  }

  prevImage(): void {
    if (!this.product?.images) return;
    this.currentImageIndex = this.currentImageIndex === 0 
      ? this.product.images.length - 1 
      : this.currentImageIndex - 1;
  }

  toggleZoom(): void {
    this.isZoomed = !this.isZoomed;
  }

  // Purchase Methods
  decreaseQuantity(): void {
    const currentQuantity = this.purchaseForm.get('quantity')?.value || 1;
    if (currentQuantity > 1) {
      this.purchaseForm.patchValue({ quantity: currentQuantity - 1 });
    }
  }

  increaseQuantity(): void {
    const currentQuantity = this.purchaseForm.get('quantity')?.value || 1;
    if (currentQuantity < 10) {
      this.purchaseForm.patchValue({ quantity: currentQuantity + 1 });
    }
  }

  addToFavorites(): void {
    if (!this.product) return;
    
    if (!this.authService.isAuthenticated()) {
      alert('Please login to add items to favorites');
      return;
    }
    
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) return;
    
    // Get current favorites from localStorage
    const favorites = this.enhancedStorageService.get(STORAGE_KEYS.WISHLIST) as any[] || [];
    
    if (!favorites.some((fav: any) => fav.productId === this.product!.id)) {
      // Add to favorites
      const newFavorite = {
        productId: this.product.id,
        dateAdded: Date.now()
      };
      favorites.push(newFavorite);
      this.enhancedStorageService.set(STORAGE_KEYS.WISHLIST, favorites);
      alert('Product added to favorites!');
    } else {
      alert('Product already in favorites!');
    }
  }

  addToCart(): void {
    if (!this.product) return;
    
    if (!this.authService.isAuthenticated()) {
      alert('Please login to add items to cart');
      return;
    }
    
    if (!this.product || (this.product.stock || 0) <= 0) {
      alert('Product is out of stock');
      return;
    }
    
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) return;
    
    const quantity = this.purchaseForm.get('quantity')?.value || 1;
    
    // Get current cart items from localStorage
    const cartItems = this.enhancedStorageService.get(STORAGE_KEYS.CART) as any[] || [];
    const existingItem = cartItems.find((item: any) => item.productId === this.product!.id);
    
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.updatedAt = Date.now();
    } else {
      cartItems.push({
        productId: this.product.id,
        quantity: quantity,
        addedAt: Date.now(),
        updatedAt: Date.now()
      });
    }
    
    // Save updated cart items to localStorage
    this.enhancedStorageService.set(STORAGE_KEYS.CART, cartItems);
    alert('Product added to cart!');
  }

  buyNow(): void {
    this.addToCart();
    this.router.navigate(['/checkout']);
  }

  // Review Methods
  submitReview(): void {
    if (!this.reviewForm.valid || !this.product) return;
    
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) {
      alert('Please login to submit a review');
      return;
    }

    const reviewData = {
      id: Date.now().toString(),
      userId: currentUser.userId,
      userName: currentUser.email || 'Anonymous',
      rating: this.reviewForm.get('rating')?.value,
      title: this.reviewForm.get('title')?.value,
      content: this.reviewForm.get('content')?.value,
      date: new Date().toISOString(),
      helpful: 0
    };

    alert('Review submitted successfully!');
    this.showReviewForm = false;
    this.reviewForm.reset({
      rating: 5,
      title: '',
      content: ''
    });
  }

  // Utility Methods
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  shareProduct(platform: string): void {
    const url = window.location.href;
    const text = `Check out this ${this.product?.name} on OUR-Bikes!`;
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
        break;
      default:
        navigator.clipboard.writeText(url).then(() => {
          alert('Product link copied to clipboard!');
        });
        return;
    }
    
    window.open(shareUrl, '_blank');
  }

  // Additional methods required by template
  getAverageRating(): number {
    return this.product?.rating || 0;
  }

  getRatingDistribution(): Record<number, number> {
    // Mock distribution - in real app this would come from actual review data
    return {
      5: Math.floor((this.product?.rating || 0) * 0.6),
      4: Math.floor((this.product?.rating || 0) * 0.3),
      3: Math.floor((this.product?.rating || 0) * 0.1),
      2: 0,
      1: 0
    };
  }

  getRatingPercentage(rating: number): number {
    const distribution = this.getRatingDistribution();
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    return total > 0 ? (distribution[rating] / total) * 100 : 0;
  }

  markHelpful(reviewId: string): void {
    // Mock implementation - in real app this would update the review in storage
    console.log('Marking review as helpful:', reviewId);
    alert('Review marked as helpful!');
  }

  onReviewAdded(): void {
    // Mock implementation - in real app this would refresh the reviews
    console.log('Review added');
  }
}
