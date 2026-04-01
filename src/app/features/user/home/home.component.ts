import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';
import { AuthService } from '../../../core/services/auth.service';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  featured?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  productCount: number;
}

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
  avatar: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  featuredProducts: Product[] = [];
  categories: Category[] = [];
  testimonials: Testimonial[] = [];
  isLoading = true;
  currentImageIndex = 0;
  autoSlideInterval: any;
  
  // Hero carousel images
  heroImages = [
    {
      image: 'https://www.cyclenews.com/wp-content/uploads/2024/12/2025-250cc-4-Stroke-MX-Shootout.jpg',
      title: 'Premium Motorbikes',
      subtitle: 'Experience the thrill of riding',
      cta: 'Shop Now'
    },
    {
      image: 'https://i.ytimg.com/vi/Dcfk7SqDRkY/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLB9N7qKTG_5S33cxgqplGNjQthtpQ',
      title: 'Professional Accessories',
      subtitle: 'Gear up for safety and style',
      cta: 'Explore Gear'
    },
    {
      image: 'https://i.etsystatic.com/8837306/r/il/aed710/7293577056/il_fullxfull.7293577056_4b5r.jpg',
      title: 'Exclusive Souvenirs',
      subtitle: 'Take home the racing spirit',
      cta: 'View Collection'
    }
  ];

  // Statistics
  statistics = {
    productsSold: 1250,
    happyCustomers: 890,
    yearsInBusiness: 5,
    productCategories: 4
  };

  constructor(
    private storageService: StorageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadHomeData();
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
  }

  loadHomeData(): void {
    this.isLoading = true;
    
    // Load featured products
    const products = this.storageService.getProducts() as Product[];
    this.featuredProducts = products
      .filter((product: Product) => product.featured)
      .slice(0, 6);

    // Load categories
    this.categories = [
      {
        id: 'bikes',
        name: 'Motorbikes',
        icon: 'bi-bicycle',
        description: 'High-performance motorcycles',
        productCount: products.filter((p: Product) => p.category === 'bikes').length
      },
      {
        id: 'accessory',
        name: 'Accessories',
        icon: 'bi-headset',
        description: 'Riding gear and equipment',
        productCount: products.filter((p: Product) => p.category === 'accessory').length
      },
      {
        id: 'souvenir',
        name: 'Souvenirs',
        icon: 'bi-gift',
        description: 'Exclusive collectibles',
        productCount: products.filter((p: Product) => p.category === 'souvenir').length
      },
      {
        id: 'tool',
        name: 'Tools',
        icon: 'bi-tools',
        description: 'Professional tools',
        productCount: products.filter((p: Product) => p.category === 'tool').length
      }
    ];

    // Load testimonials (mock data for now)
    this.testimonials = [
      {
        id: '1',
        name: 'John Doe',
        rating: 5,
        comment: 'Excellent quality products and amazing customer service!',
        date: '2024-01-15',
        avatar: 'https://picsum.photos/seed/user1/100/100.jpg'
      },
      {
        id: '2',
        name: 'Jane Smith',
        rating: 5,
        comment: 'Best motorcycle store in town. Great variety and competitive prices.',
        date: '2024-01-10',
        avatar: 'https://picsum.photos/seed/user2/100/100.jpg'
      },
      {
        id: '3',
        name: 'Mike Johnson',
        rating: 4,
        comment: 'Good selection of accessories. Fast delivery and secure packaging.',
        date: '2024-01-05',
        avatar: 'https://picsum.photos/seed/user3/100/100.jpg'
      }
    ];

    this.isLoading = false;
  }

  startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide(): void {
    this.currentImageIndex = (this.currentImageIndex + 1) % this.heroImages.length;
  }

  prevSlide(): void {
    this.currentImageIndex = (this.currentImageIndex - 1 + this.heroImages.length) % this.heroImages.length;
  }

  goToSlide(index: number): void {
    this.currentImageIndex = index;
    this.resetAutoSlide();
  }

  resetAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
    }
    this.startAutoSlide();
  }

  addToFavorites(productId: string): void {
    if (!this.authService.isAuthenticated()) {
      alert('Please login to add items to favorites');
      return;
    }
    
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) return;
    
    const favorites = this.storageService.getUserFavorites(currentUser.userId);
    if (!favorites.productIds.includes(productId)) {
      favorites.productIds.push(productId);
      this.storageService.setUserFavorites(currentUser.userId, favorites);
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
    
    const cart = this.storageService.getUserCart(currentUser.userId);
    const existingItem = cart.items.find((item: any) => item.productId === productId);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.items.push({
        productId,
        quantity: 1,
        addedAt: new Date().toISOString()
      });
    }
    
    cart.updatedAt = Date.now();
    this.storageService.setUserCart(currentUser.userId, cart);
    alert('Product added to cart!');
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}
