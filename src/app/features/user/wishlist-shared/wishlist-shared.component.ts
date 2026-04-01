import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { WishlistShareService, WishlistShareData } from '../../../core/services/wishlist-share.service';
import { StorageService } from '../../../core/services/storage.service';

@Component({
  selector: 'app-wishlist-shared',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './wishlist-shared.component.html',
  styleUrls: ['./wishlist-shared.component.scss']
})
export class WishlistSharedComponent implements OnInit, OnDestroy {
  shareData: WishlistShareData | null = null;
  sharedProducts: any[] = [];
  isLoading = true;
  error = '';
  shareId = '';

  constructor(
    private route: ActivatedRoute,
    private wishlistShareService: WishlistShareService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.loadSharedWishlist();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private loadSharedWishlist(): void {
    this.shareId = this.route.snapshot.paramMap.get('shareId') || '';
    
    if (!this.shareId) {
      this.error = 'Invalid share link';
      this.isLoading = false;
      return;
    }

    try {
      // Get share data
      this.shareData = this.wishlistShareService.getShare(this.shareId);
      
      if (!this.shareData) {
        this.error = 'This wishlist share is not available or has expired';
        this.isLoading = false;
        return;
      }

      // Get products
      this.sharedProducts = this.wishlistShareService.getShareProducts(this.shareId);
      this.isLoading = false;

    } catch (error) {
      console.error('Error loading shared wishlist:', error);
      this.error = 'Failed to load shared wishlist';
      this.isLoading = false;
    }
  }

  // Format price
  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  // Get total value
  getTotalValue(): number {
    return this.sharedProducts.reduce((total, product) => total + (product.price || 0), 0);
  }

  // Get product image
  getProductImage(product: any): string {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return 'https://picsum.photos/seed/product-default/400/300.jpg';
  }

  // Check if product is in stock
  isInStock(product: any): boolean {
    return product.stock > 0;
  }

  // Get category display name
  getCategoryName(category: string): string {
    const categoryMap: Record<string, string> = {
      bikes: 'Motorbikes',
      accessory: 'Accessories',
      souvenir: 'Souvenirs',
      tool: 'Tools'
    };
    return categoryMap[category] || category;
  }

  // Format date
  formatDate(timestamp: number): string {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Check if share is expired
  isExpired(): boolean {
    if (!this.shareData || !this.shareData.expiresAt) {
      return false;
    }
    return Date.now() > this.shareData.expiresAt;
  }

  // Get days until expiration
  getDaysUntilExpiration(): number {
    if (!this.shareData || !this.shareData.expiresAt) {
      return 0;
    }
    const msUntilExpiration = this.shareData.expiresAt - Date.now();
    return Math.ceil(msUntilExpiration / (1000 * 60 * 60 * 24));
  }

  // Get share statistics
  getShareStats(): {
    totalProducts: number;
    totalValue: number;
    inStockCount: number;
    outOfStockCount: number;
  } {
    const totalProducts = this.sharedProducts.length;
    const totalValue = this.getTotalValue();
    const inStockCount = this.sharedProducts.filter(p => this.isInStock(p)).length;
    const outOfStockCount = totalProducts - inStockCount;

    return {
      totalProducts,
      totalValue,
      inStockCount,
      outOfStockCount
    };
  }

  // Copy share link to clipboard
  copyShareLink(): void {
    if (this.shareData) {
      navigator.clipboard.writeText(this.shareData.shareUrl).then(() => {
        alert('Share link copied to clipboard!');
      }).catch(() => {
        alert('Failed to copy share link');
      });
    }
  }

  // Share on social media
  shareOnSocial(platform: string): void {
    if (!this.shareData) return;

    const url = encodeURIComponent(this.shareData.shareUrl);
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
}
