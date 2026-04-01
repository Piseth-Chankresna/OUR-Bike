import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { StorageService } from '../../../core/services/storage.service';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Cart, Order, OrderSummary } from '../../../core/models';
import { Address as AddressModel } from '../../../core/models/address.model';
import { CartItem as CartItemModel } from '../../../core/models/cart.model';

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

interface LocalCartItem {
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

interface LocalAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface LocalOrder {
  id: string;
  userId: string;
  items: LocalCartItem[];
  shippingAddress: LocalAddress;
  billingAddress: LocalAddress;
  paymentMethod: string;
  summary: CartSummary;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  estimatedDelivery: string;
  trackingNumber?: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit, OnDestroy {
  cartItems: LocalCartItem[] = [];
  summary: CartSummary = {
    subtotal: 0,
    shipping: 0,
    tax: 0,
    discount: 0,
    total: 0
  };
  
  isLoading = true;
  isProcessing = false;
  orderPlaced = false;
  placedOrder: LocalOrder | null = null;
  
  // Checkout Steps
  currentStep = 1;
  totalSteps = 3;
  
  // Forms
  checkoutForm!: FormGroup;
  shippingForm!: FormGroup;
  billingForm!: FormGroup;
  paymentForm!: FormGroup;
  
  // Form States
  sameAsBilling = true;
  selectedPaymentMethod = 'credit-card';
  
  // Payment Methods
  paymentMethods = [
    { id: 'credit-card', name: 'Credit Card', icon: 'bi-credit-card' },
    { id: 'debit-card', name: 'Debit Card', icon: 'bi-credit-card-2-front' },
    { id: 'paypal', name: 'PayPal', icon: 'bi-paypal' },
    { id: 'cash-on-delivery', name: 'Cash on Delivery', icon: 'bi-cash-stack' }
  ];

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.loadCart();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private initializeForms(): void {
    // Main Checkout Form
    this.checkoutForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      notes: ['']
    });

    // Shipping Address Form
    this.shippingForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      street: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5,10}$')]],
      country: ['United States', [Validators.required]]
    });

    // Billing Address Form
    this.billingForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      street: ['', [Validators.required, Validators.minLength(5)]],
      city: ['', [Validators.required, Validators.minLength(2)]],
      state: ['', [Validators.required, Validators.minLength(2)]],
      zipCode: ['', [Validators.required, Validators.pattern('^[0-9]{5,10}$')]],
      country: ['United States', [Validators.required]]
    });

    // Payment Form
    this.paymentForm = this.fb.group({
      cardNumber: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],
      cardName: ['', [Validators.required, Validators.minLength(3)]],
      expiryDate: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\/[0-9]{2}$')]],
      cvv: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],
      saveCard: [false]
    });
  }

  private loadCart(): void {
    this.isLoading = true;

    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    const cart = this.storageService.getUserCart(currentUser.userId);
    const products = this.storageService.getProducts() as Product[];

    this.cartItems = cart.items.map((item: CartItemModel) => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        product: product || undefined
      };
    }).filter((item: LocalCartItem) => item.product);

    if (this.cartItems.length === 0) {
      this.router.navigate(['/cart']);
      return;
    }

    this.calculateSummary();
    this.loadUserAddress();
    this.isLoading = false;
  }

  private loadUserAddress(): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) return;

    // Load saved address if exists
    const savedAddress = this.storageService.get(`user_address_${currentUser.userId}`);
    if (savedAddress) {
      this.shippingForm.patchValue(savedAddress);
      this.billingForm.patchValue(savedAddress);
    }

    // Pre-fill email
    this.checkoutForm.patchValue({
      email: currentUser.email
    });
  }

  private calculateSummary(): void {
    this.summary.subtotal = this.cartItems.reduce((sum, item) => {
      return sum + (item.product?.price || 0) * item.quantity;
    }, 0);

    this.summary.shipping = this.summary.subtotal > 100 ? 0 : 10;
    this.summary.tax = this.summary.subtotal * 0.08; // 8% tax
    this.summary.total = this.summary.subtotal + this.summary.shipping + this.summary.tax - this.summary.discount;
  }

  // Step Navigation
  nextStep(): void {
    if (this.validateCurrentStep()) {
      this.currentStep++;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousStep(): void {
    this.currentStep--;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goToStep(step: number): void {
    if (step < this.currentStep || this.validateCurrentStep()) {
      this.currentStep = step;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  private validateCurrentStep(): boolean {
    switch (this.currentStep) {
      case 1:
        return this.checkoutForm.valid && this.shippingForm.valid;
      case 2:
        return this.billingForm.valid && !!this.selectedPaymentMethod;
      default:
        return true;
    }
  }

  // Address Management
  onSameAsBillingChange(): void {
    if (this.sameAsBilling) {
      this.billingForm.patchValue(this.shippingForm.value);
      this.billingForm.disable();
    } else {
      this.billingForm.enable();
    }
  }

  // Payment Method Selection
  selectPaymentMethod(method: string): void {
    this.selectedPaymentMethod = method;
    
    // Reset payment form when switching methods
    if (method !== 'credit-card' && method !== 'debit-card') {
      this.paymentForm.reset();
    }
  }

  // Order Processing
  placeOrder(): void {
    if (!this.validateCurrentStep()) {
      return;
    }

    this.isProcessing = true;

    // Simulate order processing
    setTimeout(() => {
      const currentUser = this.authService.getCurrentUserValue();
      const order: LocalOrder = this.createOrder();
      this.saveOrder(order);
      this.clearCart();
      this.placedOrder = order;
      this.orderPlaced = true;
      this.isProcessing = false;
      
      // Send notification to user
      if (currentUser) {
        this.notificationService.notifyOrderStatus(
          currentUser.userId,
          order.id,
          'Order Placed Successfully',
          `Your order #${order.id} has been placed and is being processed.`
        );
      }

      // Send notification to admin users
      this.notifyAdminUsersOfNewOrder(order);
      
      // Scroll to confirmation
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  }

  private notifyAdminUsersOfNewOrder(order: LocalOrder): void {
    // Get all admin users
    const users = this.storageService.get('USERS') as any[] || [];
    const adminUsers = users.filter(user => user.role === 'admin');
    
    // Send notification to all admin users
    adminUsers.forEach(admin => {
      this.notificationService.notifyAdminNewOrder(
        admin.id,
        order.id,
        `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
        order.summary.total
      );
    });
  }

  private createOrder(): LocalOrder {
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) throw new Error('User not authenticated');

    const shippingAddress: LocalAddress = {
      ...this.shippingForm.value,
      email: this.checkoutForm.value.email,
      phone: this.checkoutForm.value.phone
    };

    const billingAddress: LocalAddress = this.sameAsBilling 
      ? shippingAddress 
      : { ...this.billingForm.value, email: this.checkoutForm.value.email, phone: this.checkoutForm.value.phone };

    return {
      id: 'ORD' + Date.now(),
      userId: currentUser.userId,
      items: this.cartItems,
      shippingAddress,
      billingAddress,
      paymentMethod: this.selectedPaymentMethod,
      summary: this.summary,
      status: 'pending',
      createdAt: Date.now().toString(),
      estimatedDelivery: this.calculateEstimatedDelivery(),
      trackingNumber: this.generateTrackingNumber()
    };
  }

  private saveOrder(order: LocalOrder): void {
    const orders = (this.storageService.get('ORDERS') as LocalOrder[]) || [];
    orders.push(order);
    this.storageService.set('ORDERS', orders);

    // Save user address if requested
    if (this.paymentForm.value.saveCard) {
      const currentUser = this.authService.getCurrentUserValue();
      if (currentUser) {
        this.storageService.set(`user_address_${currentUser.userId}`, this.shippingForm.value);
      }
    }
  }

  private clearCart(): void {
    const currentUser = this.authService.getCurrentUserValue();
    if (!currentUser) return;

    const cart = {
      userId: currentUser.userId,
      items: [],
      updatedAt: Date.now()
    };
    
    this.storageService.setUserCart(currentUser.userId, cart);
  }

  private calculateEstimatedDelivery(): string {
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7); // 7 days from now
    return deliveryDate.toISOString().split('T')[0];
  }

  private generateTrackingNumber(): string {
    return 'TRK' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  // Utility Methods
  getItemTotal(item: LocalCartItem): number {
    return (item.product?.price || 0) * item.quantity;
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  getStepClass(step: number): string {
    if (step < this.currentStep) return 'completed';
    if (step === this.currentStep) return 'active';
    return 'pending';
  }

  getPaymentIcon(method: string): string {
    const paymentMethod = this.paymentMethods.find(m => m.id === method);
    return paymentMethod?.icon || 'bi-credit-card';
  }

  // Navigation
  continueShopping(): void {
    this.router.navigate(['/products']);
  }

  viewOrderDetails(): void {
    if (this.placedOrder) {
      this.router.navigate(['/profile'], { fragment: 'orders' });
    }
  }

  // Form Validators
  getErrorMessage(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (control?.errors && control.touched) {
      if (control.errors['required']) return 'This field is required';
      if (control.errors['email']) return 'Please enter a valid email';
      if (control.errors['minlength']) return `Minimum ${control.errors['minlength'].requiredLength} characters`;
      if (control.errors['pattern']) return 'Please enter a valid format';
    }
    return '';
  }
}
