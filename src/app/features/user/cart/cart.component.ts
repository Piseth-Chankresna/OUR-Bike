import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnhancedStorageService } from '../../../core/services/enhanced-storage.service';
import { AuthService } from '../../../core/services/auth.service';
import { STORAGE_KEYS } from '../../../core/types/data.types';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  featured?: boolean;
  inStock?: boolean;
  rating?: number;
  reviews?: number;
  brand?: string;
  model?: string;
}

interface CartItem {
  productId: string;
  quantity: number;
  addedAt: string;
  product?: Product;
}

interface CartSummary {
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  total: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  isLoading = true;
  isEmpty = false;
  
  // Cart Summary
  summary: CartSummary = {
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0
  };

  // Promo Code Form
  promoForm: FormGroup;
  promoApplied = false;
  promoDiscount = 0;
  promoMessage = '';

  // Recommended Products
  recommendedProducts: Product[] = [];

  constructor(
    private enhancedStorageService: EnhancedStorageService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.promoForm = this.fb.group({
      promoCode: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.loadCart();
    this.loadRecommendedProducts();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private loadCart(): void {
    this.isLoading = true;

    if (!this.authService.isAuthenticated()) {
      this.isEmpty = true;
      this.isLoading = false;
      return;
    }

    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) {
      this.isEmpty = true;
      this.isLoading = false;
      return;
    }

    // Load cart items from localStorage using EnhancedStorageService
    const cartItems = this.enhancedStorageService.get(STORAGE_KEYS.CART) as any[] || [];
    const products = this.enhancedStorageService.get(STORAGE_KEYS.PRODUCTS) as Product[];

    this.cartItems = cartItems.map((item: any) => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        product: product || undefined
      };
    }).filter((item: CartItem) => item.product);

    this.isEmpty = this.cartItems.length === 0;
    this.calculateSummary();
    this.isLoading = false;
  }

  private loadRecommendedProducts(): void {
    const products = this.enhancedStorageService.get(STORAGE_KEYS.PRODUCTS) as Product[];
    this.recommendedProducts = products
      .filter(p => p.featured && !this.cartItems.some(item => item.productId === p.id))
      .slice(0, 4);
  }

  private calculateSummary(): void {
    this.summary.subtotal = this.cartItems.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    this.summary.shipping = this.summary.subtotal > 100 ? 0 : 10;
    this.summary.tax = this.summary.subtotal * 0.08; // 8% tax
    this.summary.discount = this.promoDiscount;
    this.summary.total = this.summary.subtotal + this.summary.shipping + this.summary.tax - this.summary.discount;
  }

  // Quantity Controls
  updateQuantity(item: CartItem, newQuantity: number): void {
    if (newQuantity < 1 || newQuantity > 10) return;

    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) return;

    // Get current cart items from localStorage
    const cartItems = this.enhancedStorageService.get(STORAGE_KEYS.CART) as any[] || [];
    const itemIndex = cartItems.findIndex((i: any) => i.productId === item.productId);
    
    if (itemIndex !== -1) {
      cartItems[itemIndex].quantity = newQuantity;
      cartItems[itemIndex].updatedAt = Date.now();
      
      // Save updated cart items to localStorage
      this.enhancedStorageService.set(STORAGE_KEYS.CART, cartItems);
      
      item.quantity = newQuantity;
      this.calculateSummary();
    }
  }

  increaseQuantity(item: CartItem): void {
    this.updateQuantity(item, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    this.updateQuantity(item, item.quantity - 1);
  }

  // Cart Item Management
  removeItem(item: CartItem): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) return;

    // Get current cart items and remove the specified item
    const cartItems = this.enhancedStorageService.get(STORAGE_KEYS.CART) as any[] || [];
    const updatedCartItems = cartItems.filter((i: any) => i.productId !== item.productId);
    
    // Save updated cart items to localStorage
    this.enhancedStorageService.set(STORAGE_KEYS.CART, updatedCartItems);

    this.cartItems = this.cartItems.filter(i => i.productId !== item.productId);
    this.isEmpty = this.cartItems.length === 0;
    this.calculateSummary();
    this.loadRecommendedProducts();
  }

  clearCart(): void {
    if (!confirm('Are you sure you want to clear your entire cart?')) return;

    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) return;

    // Clear cart in localStorage
    this.enhancedStorageService.set(STORAGE_KEYS.CART, []);
    
    this.cartItems = [];
    this.isEmpty = true;
    this.calculateSummary();
    this.loadRecommendedProducts();
  }

  // Promo Code
  applyPromoCode(): void {
    if (!this.promoForm.valid) return;

    const promoCode = this.promoForm.get('promoCode')?.value?.toUpperCase();
    
    // Mock promo codes
    const promoCodes: Record<string, { discount: number; message: string }> = {
      'SAVE10': { discount: 10, message: '10% discount applied!' },
      'SAVE20': { discount: 20, message: '20% discount applied!' },
      'FREESHIP': { discount: 0, message: 'Free shipping applied!' },
      'NEWUSER': { discount: 15, message: '15% discount for new users!' }
    };

    if (promoCodes[promoCode]) {
      const promo = promoCodes[promoCode];
      
      if (promoCode === 'FREESHIP') {
        this.summary.shipping = 0;
        this.promoMessage = promo.message;
      } else {
        this.promoDiscount = this.summary.subtotal * (promo.discount / 100);
        this.promoMessage = promo.message;
      }
      
      this.promoApplied = true;
      this.calculateSummary();
      this.promoForm.reset();
    } else {
      this.promoMessage = 'Invalid promo code. Please try again.';
    }
  }

  removePromoCode(): void {
    this.promoApplied = false;
    this.promoDiscount = 0;
    this.promoMessage = '';
    this.summary.shipping = this.summary.subtotal > 100 ? 0 : 10;
    this.calculateSummary();
  }

  // Checkout
  proceedToCheckout(): void {
    if (this.cartItems.length === 0) return;
    this.router.navigate(['/checkout']);
  }

  // Utility Methods
  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }

  getItemTotal(item: CartItem): number {
    return (item.product?.price || 0) * item.quantity;
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  getStockStatus(item: CartItem): string {
    if (!item.product) return 'Unknown';
    if (item.product.inStock) {
      return item.quantity <= 5 ? `Only ${item.quantity} left in stock` : 'In Stock';
    }
    return 'Out of Stock';
  }

  moveToWishlist(productId: string): void {
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
      
      // Remove from cart
      this.removeItem(this.cartItems.find(item => item.productId === productId)!);
      
      alert('Product moved to favorites!');
    } else {
      alert('Product already in favorites!');
    }
  }

  navigateToProduct(productId: string): void {
    this.router.navigate(['/product', productId]);
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

  // Comparison
  compareItems(): void {
    if (this.cartItems.length < 2) {
      alert('Please add at least 2 items to compare');
      return;
    }
    
    // In a real app, this would navigate to a comparison page
    alert('Product comparison feature coming soon!');
  }
}
