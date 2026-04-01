import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  User, 
  Product, 
  Category, 
  Order, 
  Address, 
  Review, 
  CartItem, 
  WishlistItem, 
  Analytics, 
  Report, 
  SystemSettings,
  STORAGE_KEYS 
} from '../types/data.types';

@Injectable({
  providedIn: 'root'
})
export class EnhancedStorageService {
  private readonly subjects = new Map<string, BehaviorSubject<any>>();

  constructor() {
    this.initializeDefaultData();
  }

  // === CORE STORAGE OPERATIONS ===

  /**
   * Generic get operation with type safety
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item from localStorage: ${key}`, error);
      return null;
    }
  }

  /**
   * Generic set operation with error handling
   */
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notifyChange(key, value);
    } catch (error) {
      console.error(`Error setting item to localStorage: ${key}`, error);
    }
  }

  /**
   * Generic remove operation
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
      this.notifyChange(key, null);
    } catch (error) {
      console.error(`Error removing item from localStorage: ${key}`, error);
    }
  }

  /**
   * Clear all storage
   */
  clear(): void {
    try {
      localStorage.clear();
      this.subjects.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Get all storage keys
   */
  getAllKeys(): string[] {
    return Object.values(STORAGE_KEYS);
  }

  /**
   * Watch for changes to storage data
   */
  watch<T>(key: string): Observable<T | null> {
    if (!this.subjects.has(key)) {
      this.subjects.set(key, new BehaviorSubject<T | null>(this.get<T>(key)));
    }
    return this.subjects.get(key)!.asObservable();
  }

  // === USER MANAGEMENT ===

  /**
   * Get all users
   */
  getUsers(): User[] {
    return this.get<User[]>(STORAGE_KEYS.USERS) || [];
  }

  /**
   * Set all users
   */
  setUsers(users: User[]): void {
    this.set(STORAGE_KEYS.USERS, users);
  }

  /**
   * Add new user
   */
  addUser(user: User): void {
    const users = this.getUsers();
    users.push(user);
    this.setUsers(users);
  }

  /**
   * Update user by ID
   */
  updateUser(userId: string, updates: Partial<User>): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...updates };
      this.setUsers(users);
    }
  }

  /**
   * Delete user by ID
   */
  deleteUser(userId: string): void {
    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    this.setUsers(filteredUsers);
  }

  /**
   * Get user by ID
   */
  getUserById(userId: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.id === userId) || null;
  }

  /**
   * Get user by email
   */
  getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(u => u.email === email) || null;
  }

  // === PRODUCT MANAGEMENT ===

  /**
   * Get all products
   */
  getProducts(): Product[] {
    return this.get<Product[]>(STORAGE_KEYS.PRODUCTS) || [];
  }

  /**
   * Set all products
   */
  setProducts(products: Product[]): void {
    this.set(STORAGE_KEYS.PRODUCTS, products);
  }

  /**
   * Add new product
   */
  addProduct(product: Product): void {
    const products = this.getProducts();
    products.push(product);
    this.setProducts(products);
  }

  /**
   * Update product by ID
   */
  updateProduct(productId: string, updates: Partial<Product>): void {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index !== -1) {
      products[index] = { ...products[index], ...updates, updatedAt: Date.now() };
      this.setProducts(products);
    }
  }

  /**
   * Delete product by ID
   */
  deleteProduct(productId: string): void {
    const products = this.getProducts();
    const filteredProducts = products.filter(p => p.id !== productId);
    this.setProducts(filteredProducts);
  }

  /**
   * Get product by ID
   */
  getProductById(productId: string): Product | null {
    const products = this.getProducts();
    return products.find(p => p.id === productId) || null;
  }

  /**
   * Get products by category
   */
  getProductsByCategory(category: string): Product[] {
    const products = this.getProducts();
    return products.filter(p => p.category === category);
  }

  /**
   * Get low stock products (stock < 10)
   */
  getLowStockProducts(): Product[] {
    const products = this.getProducts();
    return products.filter(p => p.stock < 10);
  }

  /**
   * Get out of stock products
   */
  getOutOfStockProducts(): Product[] {
    const products = this.getProducts();
    return products.filter(p => p.stock === 0);
  }

  /**
   * Update product stock
   */
  updateProductStock(productId: string, stock: number): void {
    this.updateProduct(productId, { stock, updatedAt: Date.now() });
  }

  // === CATEGORY MANAGEMENT ===

  /**
   * Get all categories
   */
  getCategories(): Category[] {
    return this.get<Category[]>(STORAGE_KEYS.CATEGORIES) || [];
  }

  /**
   * Set all categories
   */
  setCategories(categories: Category[]): void {
    this.set(STORAGE_KEYS.CATEGORIES, categories);
  }

  /**
   * Add new category
   */
  addCategory(category: Category): void {
    const categories = this.getCategories();
    categories.push(category);
    this.setCategories(categories);
  }

  /**
   * Update category by ID
   */
  updateCategory(categoryId: string, updates: Partial<Category>): void {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === categoryId);
    if (index !== -1) {
      categories[index] = { ...categories[index], ...updates, updatedAt: Date.now() };
      this.setCategories(categories);
    }
  }

  /**
   * Delete category by ID
   */
  deleteCategory(categoryId: string): void {
    const categories = this.getCategories();
    const filteredCategories = categories.filter(c => c.id !== categoryId);
    this.setCategories(filteredCategories);
  }

  /**
   * Get category by ID
   */
  getCategoryById(categoryId: string): Category | null {
    const categories = this.getCategories();
    return categories.find(c => c.id === categoryId) || null;
  }

  // === ORDER MANAGEMENT ===

  /**
   * Get all orders
   */
  getOrders(): Order[] {
    return this.get<Order[]>(STORAGE_KEYS.ORDERS) || [];
  }

  /**
   * Set all orders
   */
  setOrders(orders: Order[]): void {
    this.set(STORAGE_KEYS.ORDERS, orders);
  }

  /**
   * Add new order
   */
  addOrder(order: Order): void {
    const orders = this.getOrders();
    orders.push(order);
    this.setOrders(orders);
  }

  /**
   * Update order by ID
   */
  updateOrder(orderId: string, updates: Partial<Order>): void {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updates, updatedAt: Date.now() };
      this.setOrders(orders);
    }
  }

  /**
   * Delete order by ID
   */
  deleteOrder(orderId: string): void {
    const orders = this.getOrders();
    const filteredOrders = orders.filter(o => o.id !== orderId);
    this.setOrders(filteredOrders);
  }

  /**
   * Get order by ID
   */
  getOrderById(orderId: string): Order | null {
    const orders = this.getOrders();
    return orders.find(o => o.id === orderId) || null;
  }

  /**
   * Get orders by user ID
   */
  getOrdersByUserId(userId: string): Order[] {
    const orders = this.getOrders();
    return orders.filter(o => o.userId === userId);
  }

  /**
   * Get orders by status
   */
  getOrdersByStatus(status: Order['status']): Order[] {
    const orders = this.getOrders();
    return orders.filter(o => o.status === status);
  }

  // === CART MANAGEMENT ===

  /**
   * Get cart items
   */
  getCartItems(): CartItem[] {
    return this.get<CartItem[]>(STORAGE_KEYS.CART) || [];
  }

  /**
   * Set cart items
   */
  setCartItems(items: CartItem[]): void {
    this.set(STORAGE_KEYS.CART, items);
  }

  /**
   * Add item to cart
   */
  addToCart(item: CartItem): void {
    const items = this.getCartItems();
    const existingItemIndex = items.findIndex(i => i.productId === item.productId);
    
    if (existingItemIndex !== -1) {
      // Update existing item quantity
      items[existingItemIndex].quantity += item.quantity;
    } else {
      // Add new item
      items.push(item);
    }
    
    this.setCartItems(items);
  }

  /**
   * Remove item from cart
   */
  removeFromCart(productId: string): void {
    const items = this.getCartItems();
    const filteredItems = items.filter(i => i.productId !== productId);
    this.setCartItems(filteredItems);
  }

  /**
   * Update cart item quantity
   */
  updateCartItem(productId: string, quantity: number): void {
    const items = this.getCartItems();
    const index = items.findIndex(i => i.productId === productId);
    if (index !== -1) {
      items[index].quantity = quantity;
      this.setCartItems(items);
    }
  }

  /**
   * Clear cart
   */
  clearCart(): void {
    this.remove(STORAGE_KEYS.CART);
  }

  // === WISHLIST MANAGEMENT ===

  /**
   * Get wishlist items
   */
  getWishlistItems(): WishlistItem[] {
    return this.get<WishlistItem[]>(STORAGE_KEYS.WISHLIST) || [];
  }

  /**
   * Set wishlist items
   */
  setWishlistItems(items: WishlistItem[]): void {
    this.set(STORAGE_KEYS.WISHLIST, items);
  }

  /**
   * Add item to wishlist
   */
  addToWishlist(item: WishlistItem): void {
    const items = this.getWishlistItems();
    const existingItem = items.find(i => i.productId === item.productId);
    
    if (!existingItem) {
      items.push(item);
      this.setWishlistItems(items);
    }
  }

  /**
   * Remove item from wishlist
   */
  removeFromWishlist(productId: string): void {
    const items = this.getWishlistItems();
    const filteredItems = items.filter(i => i.productId !== productId);
    this.setWishlistItems(filteredItems);
  }

  // === REVIEW MANAGEMENT ===

  /**
   * Get all reviews
   */
  getReviews(): Review[] {
    return this.get<Review[]>(STORAGE_KEYS.REVIEWS) || [];
  }

  /**
   * Set all reviews
   */
  setReviews(reviews: Review[]): void {
    this.set(STORAGE_KEYS.REVIEWS, reviews);
  }

  /**
   * Add new review
   */
  addReview(review: Review): void {
    const reviews = this.getReviews();
    reviews.push(review);
    this.setReviews(reviews);
  }

  /**
   * Update review by ID
   */
  updateReview(reviewId: string, updates: Partial<Review>): void {
    const reviews = this.getReviews();
    const index = reviews.findIndex(r => r.id === reviewId);
    if (index !== -1) {
      reviews[index] = { ...reviews[index], ...updates, updatedAt: Date.now() };
      this.setReviews(reviews);
    }
  }

  /**
   * Delete review by ID
   */
  deleteReview(reviewId: string): void {
    const reviews = this.getReviews();
    const filteredReviews = reviews.filter(r => r.id !== reviewId);
    this.setReviews(filteredReviews);
  }

  // === ANALYTICS MANAGEMENT ===

  /**
   * Get analytics data
   */
  getAnalytics(): Analytics | null {
    return this.get<Analytics>(STORAGE_KEYS.ANALYTICS);
  }

  /**
   * Set analytics data
   */
  setAnalytics(analytics: Analytics): void {
    this.set(STORAGE_KEYS.ANALYTICS, analytics);
  }

  // === REPORTS MANAGEMENT ===

  /**
   * Get all reports
   */
  getReports(): Report[] {
    return this.get<Report[]>(STORAGE_KEYS.REPORTS) || [];
  }

  /**
   * Set all reports
   */
  setReports(reports: Report[]): void {
    this.set(STORAGE_KEYS.REPORTS, reports);
  }

  /**
   * Add new report
   */
  addReport(report: Report): void {
    const reports = this.getReports();
    reports.push(report);
    this.setReports(reports);
  }

  // === SETTINGS MANAGEMENT ===

  /**
   * Get system settings
   */
  getSettings(): SystemSettings | null {
    return this.get<SystemSettings>(STORAGE_KEYS.SETTINGS);
  }

  /**
   * Set system settings
   */
  setSettings(settings: SystemSettings): void {
    this.set(STORAGE_KEYS.SETTINGS, { ...settings, updatedAt: Date.now() });
  }

  /**
   * Update specific setting
   */
  updateSetting<K extends keyof SystemSettings>(key: K, value: SystemSettings[K]): void {
    const settings = this.getSettings();
    if (settings) {
      settings[key] = value;
      this.setSettings({ ...settings, updatedAt: Date.now() });
    }
  }

  // === SESSION MANAGEMENT ===

  /**
   * Get current user session
   */
  getCurrentUser(): User | null {
    return this.get<User>(STORAGE_KEYS.CURRENT_USER);
  }

  /**
   * Set current user session
   */
  setCurrentUser(user: User | null): void {
    this.set(STORAGE_KEYS.CURRENT_USER, user);
  }

  /**
   * Get session token
   */
  getSessionToken(): string | null {
    return this.get<string>(STORAGE_KEYS.SESSION_TOKEN);
  }

  /**
   * Set session token
   */
  setSessionToken(token: string | null): void {
    this.set(STORAGE_KEYS.SESSION_TOKEN, token);
  }

  /**
   * Clear session
   */
  clearSession(): void {
    this.remove(STORAGE_KEYS.CURRENT_USER);
    this.remove(STORAGE_KEYS.SESSION_TOKEN);
    this.remove(STORAGE_KEYS.LAST_ACTIVITY);
  }

  // === UTILITY METHODS ===

  /**
   * Notify subscribers of data changes
   */
  private notifyChange<T>(key: string, value: T | null): void {
    if (this.subjects.has(key)) {
      this.subjects.get(key)!.next(value);
    }
  }

  /**
   * Initialize default data if localStorage is empty
   */
  private initializeDefaultData(): void {
    // Initialize admin user if no users exist
    if (!this.getUsers()) {
      this.initializeAdminUser();
    }

    // Initialize sample categories if none exist
    if (!this.getCategories()) {
      this.initializeSampleCategories();
    }

    // Initialize sample products if none exist
    if (!this.getProducts()) {
      this.initializeSampleProducts();
    }
  }

  /**
   * Initialize admin user account
   */
  private initializeAdminUser(): void {
    const adminUser: User = {
      id: 'admin-001',
      name: 'Admin User',
      email: 'pisethchankresna@gmail.com',
      password: this.hashPassword('Sna#123$123$', 'admin-salt'),
      role: 'admin',
      isActive: true,
      registeredDate: Date.now(),
      lastLogin: Date.now()
    };

    this.addUser(adminUser);
  }

  /**
   * Initialize sample categories
   */
  private initializeSampleCategories(): void {
    const categories: Category[] = [
      {
        id: 'cat-001',
        name: 'Motorbikes',
        description: 'High-performance motorcycles and sport bikes',
        level: 0,
        icon: 'bi bi-bicycle',
        productCount: 0,
        isActive: true,
        sortOrder: 1,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'cat-002',
        name: 'Accessories',
        description: 'Riding gear, helmets, and protective equipment',
        level: 0,
        icon: 'bi bi-helmet',
        productCount: 0,
        isActive: true,
        sortOrder: 2,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'cat-003',
        name: 'Tools',
        description: 'Maintenance tools and equipment',
        level: 0,
        icon: 'bi bi-tools',
        productCount: 0,
        isActive: true,
        sortOrder: 3,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'cat-004',
        name: 'Souvenirs',
        description: 'Branded merchandise and collectibles',
        level: 0,
        icon: 'bi bi-gift',
        productCount: 0,
        isActive: true,
        sortOrder: 4,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    this.setCategories(categories);
  }

  /**
   * Initialize sample products
   */
  private initializeSampleProducts(): void {
    const products: Product[] = [
      {
        id: 'prod-001',
        name: 'Honda CRF450R',
        description: 'High-performance motocross bike with 450cc engine',
        price: 8999.99,
        category: 'Motorbikes',
        stock: 15,
        image: 'https://picsum.photos/400/300?random=1',
        brand: 'Honda',
        model: 'CRF450R',
        year: 2024,
        color: 'Red',
        featured: true,
        rating: 4.5,
        reviews: 23,
        warranty: '2 years manufacturer warranty',
        specifications: {
          engine: '450cc single-cylinder',
          transmission: '5-speed manual',
          suspension: 'Showa USD front fork',
          brakes: 'Hydraulic disc',
          weight: '231 lbs'
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'prod-002',
        name: 'KTM 350 SX-F',
        description: 'Lightweight motocross bike for competitive racing',
        price: 9499.99,
        category: 'Motorbikes',
        stock: 8,
        image: 'https://picsum.photos/400/300?random=2',
        brand: 'KTM',
        model: '350 SX-F',
        year: 2024,
        color: 'Orange',
        featured: true,
        rating: 4.8,
        reviews: 18,
        warranty: '2 years manufacturer warranty',
        specifications: {
          engine: '350cc single-cylinder',
          transmission: '5-speed manual',
          suspension: 'WP Xact front fork',
          brakes: 'Hydraulic disc',
          weight: '205 lbs'
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    this.setProducts(products);
  }

  /**
   * Simple password hashing for demo purposes
   * In production, use proper bcrypt or similar
   */
  private hashPassword(password: string, salt: string): string {
    // This is a simple hash for demo purposes
    // In production, use proper password hashing
    return btoa(password + salt);
  }
}
