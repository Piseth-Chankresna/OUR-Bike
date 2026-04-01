import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { StorageService } from './storage.service';

export interface AdminAnalytics {
  overview: AnalyticsOverview;
  sales: SalesAnalytics;
  users: UserAnalytics;
  products: ProductAnalytics;
  orders: OrderAnalytics;
  performance: PerformanceAnalytics;
}

export interface AnalyticsOverview {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
  userGrowth: number;
  conversionRate: number;
  avgOrderValue: number;
  activeUsers: number;
  bounceRate: number;
  pageViews: number;
  sessionDuration: number;
}

export interface SalesAnalytics {
  dailySales: DailySales[];
  monthlySales: MonthlySales[];
  topProducts: TopProduct[];
  revenueByCategory: CategoryRevenue[];
  salesTrends: SalesTrend[];
  forecast: SalesForecast;
}

export interface DailySales {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
  avgOrderValue: number;
}

export interface MonthlySales {
  month: string;
  revenue: number;
  orders: number;
  customers: number;
  growth: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  category: string;
  totalSales: number;
  revenue: number;
  growth: number;
  stockLevel: number;
  rating: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  orders: number;
  percentage: number;
  growth: number;
}

export interface SalesTrend {
  period: string;
  actual: number;
  predicted: number;
  confidence: number;
}

export interface SalesForecast {
  nextMonth: number;
  nextQuarter: number;
  nextYear: number;
  accuracy: number;
  factors: string[];
}

export interface UserAnalytics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
  userRetention: number;
  userDemographics: UserDemographics;
  userActivity: UserActivity[];
  userSegments: UserSegment[];
  userLifecycle: UserLifecycle;
}

export interface UserDemographics {
  byAge: AgeGroup[];
  byGender: GenderData[];
  byLocation: LocationData[];
  byDevice: DeviceData[];
}

export interface AgeGroup {
  range: string;
  count: number;
  percentage: number;
}

export interface GenderData {
  gender: string;
  count: number;
  percentage: number;
}

export interface LocationData {
  country: string;
  city: string;
  count: number;
  percentage: number;
}

export interface DeviceData {
  device: string;
  count: number;
  percentage: number;
}

export interface UserActivity {
  date: string;
  activeUsers: number;
  newUsers: number;
  sessions: number;
  pageViews: number;
  avgSessionDuration: number;
  bounceRate: number;
}

export interface UserSegment {
  segment: string;
  count: number;
  percentage: number;
  avgOrderValue: number;
  lifetimeValue: number;
  retention: number;
}

export interface UserLifecycle {
  acquisition: number;
  activation: number;
  retention: number;
  revenue: number;
  referral: number;
  churn: number;
}

export interface ProductAnalytics {
  totalProducts: number;
  activeProducts: number;
  outOfStock: number;
  lowStock: number;
  topCategories: ProductCategory[];
  productPerformance: ProductPerformance[];
  inventoryMetrics: InventoryMetrics;
  pricingAnalytics: PricingAnalytics;
}

export interface ProductCategory {
  category: string;
  productCount: number;
  totalRevenue: number;
  avgPrice: number;
  growth: number;
  stockTurnover: number;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  category: string;
  views: number;
  addToCart: number;
  purchases: number;
  conversionRate: number;
  revenue: number;
  returnRate: number;
  rating: number;
  reviews: number;
}

export interface InventoryMetrics {
  totalValue: number;
  turnoverRate: number;
  deadStock: number;
  fastMoving: number;
  slowMoving: number;
  reorderPoints: number;
  stockouts: number;
}

export interface PricingAnalytics {
  avgPrice: number;
  priceRange: PriceRange;
  priceElasticity: PriceElasticity[];
  competitorPricing: CompetitorPricing[];
  optimalPricing: OptimalPricing[];
}

export interface PriceRange {
  min: number;
  max: number;
  median: number;
  mode: number;
}

export interface PriceElasticity {
  productId: string;
  productName: string;
  elasticity: number;
  optimalPrice: number;
  currentPrice: number;
  impact: number;
}

export interface CompetitorPricing {
  competitor: string;
  productId: string;
  competitorPrice: number;
  ourPrice: number;
  difference: number;
  position: string;
}

export interface OptimalPricing {
  productId: string;
  currentPrice: number;
  optimalPrice: number;
  potentialRevenue: number;
  confidence: number;
  factors: string[];
}

export interface OrderAnalytics {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  orderStatus: OrderStatus[];
  orderTrends: OrderTrend[];
  fulfillmentMetrics: FulfillmentMetrics;
  paymentAnalytics: PaymentAnalytics;
}

export interface OrderStatus {
  status: string;
  count: number;
  percentage: number;
  avgProcessingTime: number;
}

export interface OrderTrend {
  period: string;
  orders: number;
  revenue: number;
  avgOrderValue: number;
  status: string;
}

export interface FulfillmentMetrics {
  avgProcessingTime: number;
  avgShippingTime: number;
  onTimeDelivery: number;
  orderAccuracy: number;
  returnRate: number;
  customerSatisfaction: number;
}

export interface PaymentAnalytics {
  paymentMethods: PaymentMethod[];
  failedPayments: number;
  paymentTrends: PaymentTrend[];
  refundAnalytics: RefundAnalytics;
}

export interface PaymentMethod {
  method: string;
  count: number;
  revenue: number;
  percentage: number;
  successRate: number;
}

export interface PaymentTrend {
  period: string;
  method: string;
  count: number;
  revenue: number;
  successRate: number;
}

export interface RefundAnalytics {
  totalRefunds: number;
  refundRate: number;
  refundAmount: number;
  refundReasons: RefundReason[];
  refundTrends: RefundTrend[];
}

export interface RefundReason {
  reason: string;
  count: number;
  percentage: number;
  avgAmount: number;
}

export interface RefundTrend {
  period: string;
  refunds: number;
  amount: number;
  rate: number;
}

export interface PerformanceAnalytics {
  systemMetrics: SystemMetrics;
  apiPerformance: ApiPerformance[];
  errorAnalytics: ErrorAnalytics;
  userExperience: UserExperienceMetrics;
  securityMetrics: SecurityMetrics;
}

export interface SystemMetrics {
  uptime: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkLatency: number;
}

export interface ApiPerformance {
  endpoint: string;
  avgResponseTime: number;
  requestsPerSecond: number;
  errorRate: number;
  statusCode: number;
}

export interface ErrorAnalytics {
  totalErrors: number;
  errorRate: number;
  errorsByType: ErrorType[];
  criticalErrors: number;
  errorTrends: ErrorTrend[];
}

export interface ErrorType {
  type: string;
  count: number;
  percentage: number;
  severity: string;
}

export interface ErrorTrend {
  period: string;
  errors: number;
  rate: number;
  severity: string;
}

export interface UserExperienceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  coreWebVitals: CoreWebVitals;
}

export interface CoreWebVitals {
  lcp: number;
  fid: number;
  cls: number;
  status: string;
}

export interface SecurityMetrics {
  securityIncidents: number;
  blockedAttempts: number;
  authenticationFailures: number;
  dataBreaches: number;
  vulnerabilityScans: number;
  complianceScore: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdminAnalyticsService {
  private readonly CACHE_KEY = 'admin_analytics_cache';
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  private analytics$ = new BehaviorSubject<AdminAnalytics | null>(null);
  private isLoading$ = new BehaviorSubject<boolean>(false);

  constructor(private storageService: StorageService) {}

  // Get analytics as observable
  getAnalytics(): Observable<AdminAnalytics | null> {
    return this.analytics$.asObservable();
  }

  // Get loading state as observable
  getIsLoading(): Observable<boolean> {
    return this.isLoading$.asObservable();
  }

  // Load all analytics data
  loadAnalytics(): void {
    this.isLoading$.next(true);

    // Check cache first
    const cached = this.getCachedAnalytics();
    if (cached) {
      this.analytics$.next(cached);
      this.isLoading$.next(false);
      return;
    }

    // Generate comprehensive analytics
    const analytics = this.generateAnalytics();
    
    // Cache the results
    this.cacheAnalytics(analytics);
    
    // Update observable
    this.analytics$.next(analytics);
    this.isLoading$.next(false);
  }

  // Refresh analytics
  refreshAnalytics(): void {
    this.clearCache();
    this.loadAnalytics();
  }

  // Get cached analytics
  private getCachedAnalytics(): AdminAnalytics | null {
    try {
      const cached = this.storageService.get(this.CACHE_KEY) as any;
      if (cached && cached.timestamp && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
        return cached.data;
      }
    } catch (error) {
      console.error('Error getting cached analytics:', error);
    }
    return null;
  }

  // Cache analytics
  private cacheAnalytics(analytics: AdminAnalytics): void {
    try {
      this.storageService.set(this.CACHE_KEY, {
        data: analytics,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error caching analytics:', error);
    }
  }

  // Clear cache
  private clearCache(): void {
    try {
      this.storageService.remove(this.CACHE_KEY);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }

  // Generate comprehensive analytics
  private generateAnalytics(): AdminAnalytics {
    const users = this.storageService.getUsers() as any[];
    const products = this.storageService.getProducts() as any[];
    const orders = this.storageService.getOrders() as any[];

    return {
      overview: this.generateOverview(users, products, orders),
      sales: this.generateSalesAnalytics(orders, products),
      users: this.generateUserAnalytics(users),
      products: this.generateProductAnalytics(products, orders),
      orders: this.generateOrderAnalytics(orders),
      performance: this.generatePerformanceAnalytics()
    };
  }

  // Generate overview analytics
  private generateOverview(users: any[], products: any[], orders: any[]): AnalyticsOverview {
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const totalUsers = users.length;
    const totalProducts = products.length;
    
    const activeUsers = users.filter(user => 
      user.lastLogin && (Date.now() - user.lastLogin) < 30 * 24 * 60 * 60 * 1000
    ).length;

    return {
      totalRevenue,
      totalOrders,
      totalUsers,
      totalProducts,
      revenueGrowth: this.calculateGrowth(orders, 'total'),
      orderGrowth: this.calculateGrowth(orders, 'count'),
      userGrowth: this.calculateGrowth(users, 'count'),
      conversionRate: totalOrders > 0 ? (totalOrders / totalUsers) * 100 : 0,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      activeUsers,
      bounceRate: Math.random() * 20 + 30, // Mock data
      pageViews: Math.floor(Math.random() * 50000) + 10000,
      sessionDuration: Math.floor(Math.random() * 300) + 120
    };
  }

  // Generate sales analytics
  private generateSalesAnalytics(orders: any[], products: any[]): SalesAnalytics {
    const dailySales = this.generateDailySales(orders);
    const monthlySales = this.generateMonthlySales(orders);
    const topProducts = this.generateTopProducts(orders, products);
    const revenueByCategory = this.generateRevenueByCategory(orders, products);
    const salesTrends = this.generateSalesTrends(orders);
    const forecast = this.generateSalesForecast(orders);

    return {
      dailySales,
      monthlySales,
      topProducts,
      revenueByCategory,
      salesTrends,
      forecast
    };
  }

  // Generate user analytics
  private generateUserAnalytics(users: any[]): UserAnalytics {
    const totalUsers = users.length;
    const activeUsers = users.filter(user => 
      user.lastLogin && (Date.now() - user.lastLogin) < 30 * 24 * 60 * 60 * 1000
    ).length;
    
    const newUsers = users.filter(user => 
      user.createdAt && (Date.now() - user.createdAt) < 30 * 24 * 60 * 60 * 1000
    ).length;

    return {
      totalUsers,
      activeUsers,
      newUsers,
      userGrowth: this.calculateGrowth(users, 'count'),
      userRetention: Math.random() * 20 + 70, // Mock data
      userDemographics: this.generateUserDemographics(),
      userActivity: this.generateUserActivity(),
      userSegments: this.generateUserSegments(),
      userLifecycle: this.generateUserLifecycle()
    };
  }

  // Generate product analytics
  private generateProductAnalytics(products: any[], orders: any[]): ProductAnalytics {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.status !== 'inactive').length;
    const outOfStock = products.filter(p => p.stock === 0).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock < 5).length;

    return {
      totalProducts,
      activeProducts,
      outOfStock,
      lowStock,
      topCategories: this.generateTopCategories(products, orders),
      productPerformance: this.generateProductPerformance(products, orders),
      inventoryMetrics: this.generateInventoryMetrics(products),
      pricingAnalytics: this.generatePricingAnalytics(products)
    };
  }

  // Generate order analytics
  private generateOrderAnalytics(orders: any[]): OrderAnalytics {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length;
    const returnedOrders = orders.filter(o => o.status === 'returned').length;

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      returnedOrders,
      orderStatus: this.generateOrderStatus(orders),
      orderTrends: this.generateOrderTrends(orders),
      fulfillmentMetrics: this.generateFulfillmentMetrics(),
      paymentAnalytics: this.generatePaymentAnalytics(orders)
    };
  }

  // Generate performance analytics
  private generatePerformanceAnalytics(): PerformanceAnalytics {
    return {
      systemMetrics: this.generateSystemMetrics(),
      apiPerformance: this.generateApiPerformance(),
      errorAnalytics: this.generateErrorAnalytics(),
      userExperience: this.generateUserExperienceMetrics(),
      securityMetrics: this.generateSecurityMetrics()
    };
  }

  // Helper methods for generating specific analytics data
  private generateDailySales(orders: any[]): DailySales[] {
    const dailySales: DailySales[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orders.filter(order => 
        order.createdAt && order.createdAt.startsWith(dateStr)
      );
      
      const revenue = dayOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const customers = new Set(dayOrders.map(o => o.userId)).size;
      
      dailySales.push({
        date: dateStr,
        revenue,
        orders: dayOrders.length,
        customers,
        avgOrderValue: dayOrders.length > 0 ? revenue / dayOrders.length : 0
      });
    }
    
    return dailySales;
  }

  private generateMonthlySales(orders: any[]): MonthlySales[] {
    const monthlySales: MonthlySales[] = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      const monthOrders = orders.filter(order => {
        if (!order.createdAt) return false;
        const orderDate = new Date(order.createdAt);
        return orderDate.getMonth() === date.getMonth() && 
               orderDate.getFullYear() === date.getFullYear();
      });
      
      const revenue = monthOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      const customers = new Set(monthOrders.map(o => o.userId)).size;
      const previousMonthRevenue = monthlySales.length > 0 ? monthlySales[0].revenue : revenue;
      const growth = previousMonthRevenue > 0 ? ((revenue - previousMonthRevenue) / previousMonthRevenue) * 100 : 0;
      
      monthlySales.unshift({
        month: monthStr,
        revenue,
        orders: monthOrders.length,
        customers,
        growth
      });
    }
    
    return monthlySales;
  }

  private generateTopProducts(orders: any[], products: any[]): any[] {
    const productSales = new Map<string, { totalSales: number; revenue: number }>();
    
    orders.forEach((order: any) => {
      if (order.items) {
        order.items.forEach((item: any) => {
          const current = productSales.get(item.productId) || { 
            totalSales: 0, 
            revenue: 0 
          };
          current.totalSales += item.quantity || 1;
          current.revenue += (item.price || 0) * (item.quantity || 1);
          productSales.set(item.productId, current);
        });
      }
    });
    
    return Array.from(productSales.entries())
      .map(([productId, sales]) => {
        const product = products.find(p => p.productId === productId);
        return {
          productId,
          productName: product?.name || 'Unknown',
          category: product?.category || 'Unknown',
          totalSales: sales.totalSales,
          revenue: sales.revenue,
          growth: Math.random() * 40 - 10, // Mock growth
          stockLevel: product?.stock || 0,
          rating: product?.rating || 0
        };
      })
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }

  private generateRevenueByCategory(orders: any[], products: any[]): CategoryRevenue[] {
    const categoryRevenue = new Map();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    orders.forEach((order: any) => {
      if (order.items) {
        order.items.forEach((item: any) => {
          const product = products.find(p => p.productId === item.productId);
          const category = product?.category || 'Unknown';
          
          const current = categoryRevenue.get(category) || { 
            revenue: 0, 
            orders: 0 
          };
          current.revenue += (item.price || 0) * (item.quantity || 1);
          current.orders += 1;
          categoryRevenue.set(category, current);
        });
      }
    });
    
    return Array.from(categoryRevenue.entries())
      .map(([category, data]) => ({
        category,
        revenue: data.revenue,
        orders: data.orders,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
        growth: Math.random() * 30 - 5 // Mock growth
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  private generateSalesTrends(orders: any[]): SalesTrend[] {
    const trends: SalesTrend[] = [];
    const periods = ['Last Week', 'Last 2 Weeks', 'Last Month', 'Last 3 Months'];
    
    periods.forEach(period => {
      const actual = Math.random() * 50000 + 10000;
      const predicted = actual * (1 + (Math.random() * 0.2 - 0.1));
      
      trends.push({
        period,
        actual,
        predicted,
        confidence: Math.random() * 20 + 70
      });
    });
    
    return trends;
  }

  private generateSalesForecast(orders: any[]): SalesForecast {
    const currentRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    return {
      nextMonth: currentRevenue * (1 + Math.random() * 0.2),
      nextQuarter: currentRevenue * 3 * (1 + Math.random() * 0.3),
      nextYear: currentRevenue * 12 * (1 + Math.random() * 0.4),
      accuracy: Math.random() * 20 + 70,
      factors: ['Seasonal trends', 'Market conditions', 'Product launches', 'Marketing campaigns']
    };
  }

  private generateUserDemographics(): UserDemographics {
    return {
      byAge: [
        { range: '18-24', count: 120, percentage: 15 },
        { range: '25-34', count: 280, percentage: 35 },
        { range: '35-44', count: 240, percentage: 30 },
        { range: '45-54', count: 120, percentage: 15 },
        { range: '55+', count: 40, percentage: 5 }
      ],
      byGender: [
        { gender: 'Male', count: 480, percentage: 60 },
        { gender: 'Female', count: 280, percentage: 35 },
        { gender: 'Other', count: 40, percentage: 5 }
      ],
      byLocation: [
        { country: 'USA', city: 'New York', count: 200, percentage: 25 },
        { country: 'USA', city: 'Los Angeles', count: 150, percentage: 18.75 },
        { country: 'UK', city: 'London', count: 100, percentage: 12.5 },
        { country: 'Canada', city: 'Toronto', count: 80, percentage: 10 },
        { country: 'Australia', city: 'Sydney', count: 60, percentage: 7.5 }
      ],
      byDevice: [
        { device: 'Desktop', count: 400, percentage: 50 },
        { device: 'Mobile', count: 320, percentage: 40 },
        { device: 'Tablet', count: 80, percentage: 10 }
      ]
    };
  }

  private generateUserActivity(): UserActivity[] {
    const activity: UserActivity[] = [];
    const today = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      activity.push({
        date: dateStr,
        activeUsers: Math.floor(Math.random() * 100) + 50,
        newUsers: Math.floor(Math.random() * 20) + 5,
        sessions: Math.floor(Math.random() * 500) + 200,
        pageViews: Math.floor(Math.random() * 2000) + 1000,
        avgSessionDuration: Math.floor(Math.random() * 300) + 120,
        bounceRate: Math.random() * 20 + 30
      });
    }
    
    return activity;
  }

  private generateUserSegments(): UserSegment[] {
    return [
      {
        segment: 'New Customers',
        count: 200,
        percentage: 25,
        avgOrderValue: 150,
        lifetimeValue: 300,
        retention: 60
      },
      {
        segment: 'Regular Customers',
        count: 400,
        percentage: 50,
        avgOrderValue: 250,
        lifetimeValue: 1500,
        retention: 85
      },
      {
        segment: 'VIP Customers',
        count: 100,
        percentage: 12.5,
        avgOrderValue: 500,
        lifetimeValue: 5000,
        retention: 95
      },
      {
        segment: 'Inactive Customers',
        count: 100,
        percentage: 12.5,
        avgOrderValue: 100,
        lifetimeValue: 200,
        retention: 20
      }
    ];
  }

  private generateUserLifecycle(): UserLifecycle {
    return {
      acquisition: 100,
      activation: 75,
      retention: 85,
      revenue: 60,
      referral: 40,
      churn: 15
    };
  }

  private generateTopCategories(products: any[], orders: any[]): ProductCategory[] {
    const categories = ['Motorbikes', 'Accessories', 'Souvenirs', 'Tools'];
    
    return categories.map(category => {
      const categoryProducts = products.filter(p => p.category === category);
      const categoryOrders = orders.filter(order => 
        order.items && order.items.some((item: any) => {
          const product = products.find(p => p.productId === item.productId);
          return product && product.category === category;
        })
      );
      
      const revenue = categoryOrders.reduce((sum: number, order: any) => {
        return sum + order.items.reduce((orderSum: number, item: any) => {
          const product = products.find(p => p.productId === item.productId);
          if (product && product.category === category) {
            return orderSum + (item.price || 0) * (item.quantity || 1);
          }
          return orderSum;
        }, 0);
      }, 0);
      
      return {
        category,
        productCount: categoryProducts.length,
        totalRevenue: revenue,
        avgPrice: categoryProducts.length > 0 ? 
          categoryProducts.reduce((sum, p) => sum + (p.price || 0), 0) / categoryProducts.length : 0,
        growth: Math.random() * 30 - 5,
        stockTurnover: Math.random() * 10 + 2
      };
    }).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  private generateProductPerformance(products: any[], orders: any[]): ProductPerformance[] {
    return products.slice(0, 20).map(product => {
      const productOrders = orders.filter(order => 
        order.items && order.items.some((item: any) => item.productId === product.productId)
      );
      
      const totalPurchases = productOrders.reduce((sum: number, order: any) => {
        return sum + order.items.reduce((itemSum: number, item: any) => {
          return item.productId === product.productId ? itemSum + (item.quantity || 1) : itemSum;
        }, 0);
      }, 0);
      
      const revenue = productOrders.reduce((sum: number, order: any) => {
        return sum + order.items.reduce((itemSum: number, item: any) => {
          return item.productId === product.productId ? 
            itemSum + (item.price || 0) * (item.quantity || 1) : itemSum;
        }, 0);
      }, 0);
      
      return {
        productId: product.productId,
        productName: product.name,
        category: product.category,
        views: Math.floor(Math.random() * 1000) + 100,
        addToCart: Math.floor(Math.random() * 100) + 20,
        purchases: totalPurchases,
        conversionRate: Math.random() * 10 + 2,
        revenue,
        returnRate: Math.random() * 5,
        rating: product.rating || Math.random() * 2 + 3,
        reviews: Math.floor(Math.random() * 50) + 10
      };
    }).sort((a, b) => b.revenue - a.revenue);
  }

  private generateInventoryMetrics(products: any[]): InventoryMetrics {
    const totalValue = products.reduce((sum, product) => 
      sum + (product.price || 0) * (product.stock || 0), 0
    );
    
    return {
      totalValue,
      turnoverRate: Math.random() * 8 + 2,
      deadStock: Math.floor(Math.random() * 10) + 5,
      fastMoving: Math.floor(Math.random() * 20) + 10,
      slowMoving: Math.floor(Math.random() * 15) + 8,
      reorderPoints: Math.floor(Math.random() * 30) + 20,
      stockouts: Math.floor(Math.random() * 5) + 1
    };
  }

  private generatePricingAnalytics(products: any[]): PricingAnalytics {
    const prices = products.map(p => p.price || 0).filter(p => p > 0);
    const sortedPrices = prices.sort((a, b) => a - b);
    
    return {
      avgPrice: prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : 0,
      priceRange: {
        min: sortedPrices[0] || 0,
        max: sortedPrices[sortedPrices.length - 1] || 0,
        median: sortedPrices[Math.floor(sortedPrices.length / 2)] || 0,
        mode: 0 // Would need more complex calculation
      },
      priceElasticity: [],
      competitorPricing: [],
      optimalPricing: []
    };
  }

  private generateOrderStatus(orders: any[]): OrderStatus[] {
    const statusCounts = new Map();
    
    orders.forEach(order => {
      const status = order.status || 'unknown';
      statusCounts.set(status, (statusCounts.get(status) || 0) + 1);
    });
    
    return Array.from(statusCounts.entries()).map(([status, count]) => ({
      status,
      count,
      percentage: (count / orders.length) * 100,
      avgProcessingTime: Math.random() * 48 + 12 // Mock processing time in hours
    }));
  }

  private generateOrderTrends(orders: any[]): OrderTrend[] {
    const trends: OrderTrend[] = [];
    const periods = ['Last Week', 'Last 2 Weeks', 'Last Month', 'Last 3 Months'];
    
    periods.forEach(period => {
      const ordersCount = Math.floor(Math.random() * 100) + 50;
      const revenue = ordersCount * (Math.random() * 200 + 100);
      
      trends.push({
        period,
        orders: ordersCount,
        revenue,
        avgOrderValue: revenue / ordersCount,
        status: 'completed'
      });
    });
    
    return trends;
  }

  private generateFulfillmentMetrics(): FulfillmentMetrics {
    return {
      avgProcessingTime: Math.random() * 24 + 12,
      avgShippingTime: Math.random() * 72 + 24,
      onTimeDelivery: Math.random() * 20 + 80,
      orderAccuracy: Math.random() * 10 + 90,
      returnRate: Math.random() * 5 + 2,
      customerSatisfaction: Math.random() * 2 + 3.5
    };
  }

  private generatePaymentAnalytics(orders: any[]): PaymentAnalytics {
    return {
      paymentMethods: [
        { method: 'Credit Card', count: 400, revenue: 80000, percentage: 60, successRate: 95 },
        { method: 'PayPal', count: 200, revenue: 30000, percentage: 30, successRate: 98 },
        { method: 'Cash on Delivery', count: 67, revenue: 10000, percentage: 10, successRate: 85 }
      ],
      failedPayments: Math.floor(Math.random() * 20) + 5,
      paymentTrends: [],
      refundAnalytics: {
        totalRefunds: Math.floor(Math.random() * 20) + 10,
        refundRate: Math.random() * 5 + 2,
        refundAmount: Math.random() * 5000 + 1000,
        refundReasons: [
          { reason: 'Defective Product', count: 10, percentage: 40, avgAmount: 150 },
          { reason: 'Wrong Item', count: 8, percentage: 32, avgAmount: 100 },
          { reason: 'Customer Dissatisfaction', count: 7, percentage: 28, avgAmount: 200 }
        ],
        refundTrends: []
      }
    };
  }

  private generateSystemMetrics(): SystemMetrics {
    return {
      uptime: 99.9,
      responseTime: Math.random() * 200 + 100,
      throughput: Math.random() * 1000 + 500,
      errorRate: Math.random() * 2,
      cpuUsage: Math.random() * 40 + 20,
      memoryUsage: Math.random() * 30 + 40,
      diskUsage: Math.random() * 20 + 30,
      networkLatency: Math.random() * 50 + 10
    };
  }

  private generateApiPerformance(): ApiPerformance[] {
    return [
      { endpoint: '/api/products', avgResponseTime: 150, requestsPerSecond: 100, errorRate: 0.5, statusCode: 200 },
      { endpoint: '/api/orders', avgResponseTime: 200, requestsPerSecond: 50, errorRate: 1, statusCode: 200 },
      { endpoint: '/api/users', avgResponseTime: 120, requestsPerSecond: 30, errorRate: 0.2, statusCode: 200 }
    ];
  }

  private generateErrorAnalytics(): ErrorAnalytics {
    return {
      totalErrors: Math.floor(Math.random() * 100) + 50,
      errorRate: Math.random() * 2,
      errorsByType: [
        { type: '404 Not Found', count: 30, percentage: 40, severity: 'low' },
        { type: '500 Server Error', count: 20, percentage: 26.67, severity: 'high' },
        { type: '403 Forbidden', count: 15, percentage: 20, severity: 'medium' },
        { type: '400 Bad Request', count: 10, percentage: 13.33, severity: 'medium' }
      ],
      criticalErrors: Math.floor(Math.random() * 10) + 5,
      errorTrends: []
    };
  }

  private generateUserExperienceMetrics(): UserExperienceMetrics {
    return {
      pageLoadTime: Math.random() * 1000 + 500,
      firstContentfulPaint: Math.random() * 800 + 400,
      largestContentfulPaint: Math.random() * 1500 + 800,
      cumulativeLayoutShift: Math.random() * 0.2 + 0.05,
      firstInputDelay: Math.random() * 100 + 50,
      coreWebVitals: {
        lcp: Math.random() * 1500 + 800,
        fid: Math.random() * 100 + 50,
        cls: Math.random() * 0.2 + 0.05,
        status: 'good'
      }
    };
  }

  private generateSecurityMetrics(): SecurityMetrics {
    return {
      securityIncidents: Math.floor(Math.random() * 5) + 1,
      blockedAttempts: Math.floor(Math.random() * 100) + 50,
      authenticationFailures: Math.floor(Math.random() * 50) + 20,
      dataBreaches: 0,
      vulnerabilityScans: Math.floor(Math.random() * 10) + 5,
      complianceScore: Math.random() * 10 + 85
    };
  }

  // Calculate growth rate
  private calculateGrowth(data: any[], type: 'count' | 'total'): number {
    if (data.length < 2) return 0;
    
    const now = Date.now();
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000);
    
    const recent = data.filter(item => {
      const itemTime = item.createdAt ? new Date(item.createdAt).getTime() : 0;
      return itemTime >= thirtyDaysAgo;
    });
    
    const previous = data.filter(item => {
      const itemTime = item.createdAt ? new Date(item.createdAt).getTime() : 0;
      return itemTime < thirtyDaysAgo && itemTime >= (thirtyDaysAgo - (30 * 24 * 60 * 60 * 1000));
    });
    
    const recentValue = type === 'count' ? recent.length : 
      recent.reduce((sum, item) => sum + (item.total || 0), 0);
    const previousValue = type === 'count' ? previous.length : 
      previous.reduce((sum, item) => sum + (item.total || 0), 0);
    
    return previousValue > 0 ? ((recentValue - previousValue) / previousValue) * 100 : 0;
  }

  // Get specific analytics sections
  getOverviewAnalytics(): Observable<AnalyticsOverview | null> {
    return this.getAnalytics().pipe(
      map(analytics => analytics?.overview || null)
    );
  }

  getSalesAnalytics(): Observable<SalesAnalytics | null> {
    return this.getAnalytics().pipe(
      map(analytics => analytics?.sales || null)
    );
  }

  getUserAnalytics(): Observable<UserAnalytics | null> {
    return this.getAnalytics().pipe(
      map(analytics => analytics?.users || null)
    );
  }

  getProductAnalytics(): Observable<ProductAnalytics | null> {
    return this.getAnalytics().pipe(
      map(analytics => analytics?.products || null)
    );
  }

  getOrderAnalytics(): Observable<OrderAnalytics | null> {
    return this.getAnalytics().pipe(
      map(analytics => analytics?.orders || null)
    );
  }

  getPerformanceAnalytics(): Observable<PerformanceAnalytics | null> {
    return this.getAnalytics().pipe(
      map(analytics => analytics?.performance || null)
    );
  }
}
