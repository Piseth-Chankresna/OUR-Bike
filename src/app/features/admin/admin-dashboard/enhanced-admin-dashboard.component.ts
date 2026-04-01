import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AdminAnalyticsService, AdminAnalytics, AnalyticsOverview, SalesAnalytics, UserAnalytics, ProductAnalytics, OrderAnalytics, PerformanceAnalytics } from '../../../core/services/admin-analytics.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-enhanced-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './enhanced-admin-dashboard.component.html',
  styleUrls: ['./enhanced-admin-dashboard.component.scss']
})
export class EnhancedAdminDashboardComponent implements OnInit, OnDestroy {
  analytics: AdminAnalytics | null = null;
  isLoading = false;
  lastUpdated: Date | null = null;
  
  // Form controls for filtering
  dashboardForm!: FormGroup;
  
  // Subscriptions
  private analyticsSubscription!: Subscription;
  private loadingSubscription!: Subscription;
  
  // Chart data
  chartData: any = {
    revenueChart: [],
    userGrowthChart: [],
    productPerformanceChart: [],
    orderStatusChart: []
  };
  
  // Quick stats
  quickStats: any = {
    revenue: 0,
    orders: 0,
    users: 0,
    products: 0,
    growth: 0
  };
  
  // Recent activity
  recentActivity: any[] = [];
  
  // Alerts and notifications
  alerts: any[] = [];
  
  // System health
  systemHealth: any = {
    status: 'healthy',
    uptime: 0,
    responseTime: 0,
    errorRate: 0
  };

  constructor(
    private adminAnalyticsService: AdminAnalyticsService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.cleanupSubscriptions();
  }

  private initializeComponent(): void {
    this.initializeForms();
    this.loadAnalytics();
    this.setupSubscriptions();
    this.generateMockData();
  }

  private initializeForms(): void {
    this.dashboardForm = this.fb.group({
      dateRange: ['30days'],
      category: ['all'],
      status: ['all'],
      sortBy: ['revenue'],
      refreshInterval: [5]
    });
  }

  private setupSubscriptions(): void {
    // Subscribe to analytics
    this.analyticsSubscription = this.adminAnalyticsService.getAnalytics().subscribe(
      analytics => {
        this.analytics = analytics;
        this.lastUpdated = new Date();
        this.updateChartData();
        this.updateQuickStats();
        this.checkAlerts();
      }
    );

    // Subscribe to loading state
    this.loadingSubscription = this.adminAnalyticsService.getIsLoading().subscribe(
      isLoading => {
        this.isLoading = isLoading;
      }
    );
  }

  private cleanupSubscriptions(): void {
    if (this.analyticsSubscription) {
      this.analyticsSubscription.unsubscribe();
    }
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }

  private loadAnalytics(): void {
    this.adminAnalyticsService.loadAnalytics();
  }

  private updateChartData(): void {
    if (!this.analytics) return;

    // Revenue chart data
    this.chartData.revenueChart = this.analytics.sales.dailySales.map(sale => ({
      date: sale.date,
      revenue: sale.revenue,
      orders: sale.orders
    }));

    // User growth chart data
    this.chartData.userGrowthChart = this.analytics.users.userActivity.map(activity => ({
      date: activity.date,
      activeUsers: activity.activeUsers,
      newUsers: activity.newUsers
    }));

    // Product performance chart data
    this.chartData.productPerformanceChart = this.analytics.products.productPerformance.slice(0, 10).map(product => ({
      name: product.productName,
      revenue: product.revenue,
      conversionRate: product.conversionRate
    }));

    // Order status chart data
    this.chartData.orderStatusChart = this.analytics.orders.orderStatus.map(status => ({
      status: status.status,
      count: status.count,
      percentage: status.percentage
    }));
  }

  private updateQuickStats(): void {
    if (!this.analytics) return;

    this.quickStats = {
      revenue: this.analytics.overview.totalRevenue,
      orders: this.analytics.overview.totalOrders,
      users: this.analytics.overview.totalUsers,
      products: this.analytics.overview.totalProducts,
      growth: this.analytics.overview.revenueGrowth
    };

    // Update system health
    this.systemHealth = {
      status: this.getSystemHealthStatus(this.analytics.performance.systemMetrics),
      uptime: this.analytics.performance.systemMetrics.uptime,
      responseTime: this.analytics.performance.systemMetrics.responseTime,
      errorRate: this.analytics.performance.systemMetrics.errorRate
    };
  }

  private getSystemHealthStatus(metrics: any): string {
    if (metrics.uptime < 95 || metrics.errorRate > 5) return 'critical';
    if (metrics.uptime < 98 || metrics.errorRate > 2) return 'warning';
    return 'healthy';
  }

  private checkAlerts(): void {
    if (!this.analytics) return;

    this.alerts = [];

    // Check for critical issues
    if (this.analytics.performance.systemMetrics.errorRate > 5) {
      this.alerts.push({
        type: 'error',
        message: 'High error rate detected',
        description: `Error rate is ${this.analytics.performance.systemMetrics.errorRate}%`,
        action: 'View Performance Metrics'
      });
    }

    // Check for low stock
    if (this.analytics.products.lowStock > 0) {
      this.alerts.push({
        type: 'warning',
        message: 'Low stock items',
        description: `${this.analytics.products.lowStock} items are running low on stock`,
        action: 'View Inventory'
      });
    }

    // Check for out of stock
    if (this.analytics.products.outOfStock > 0) {
      this.alerts.push({
        type: 'error',
        message: 'Out of stock items',
        description: `${this.analytics.products.outOfStock} items are out of stock`,
        action: 'View Inventory'
      });
    }

    // Check for pending orders
    if (this.analytics.orders.pendingOrders > 10) {
      this.alerts.push({
        type: 'warning',
        message: 'High pending orders',
        description: `${this.analytics.orders.pendingOrders} orders are pending`,
        action: 'View Orders'
      });
    }

    // Check for system performance
    if (this.analytics.performance.systemMetrics.responseTime > 500) {
      this.alerts.push({
        type: 'warning',
        message: 'Slow response time',
        description: `Average response time is ${this.analytics.performance.systemMetrics.responseTime}ms`,
        action: 'View Performance'
      });
    }
  }

  private generateMockData(): void {
    // Generate recent activity
    this.recentActivity = [
      {
        type: 'order',
        message: 'New order #12345',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        user: 'John Doe'
      },
      {
        type: 'user',
        message: 'New user registered',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        user: 'Jane Smith'
      },
      {
        type: 'product',
        message: 'Product "Honda CRF450R" updated',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        user: 'Admin'
      },
      {
        type: 'system',
        message: 'System backup completed',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        user: 'System'
      }
    ];
  }

  // Public methods
  refreshAnalytics(): void {
    this.loadAnalytics();
  }

  exportData(type: string): void {
    console.log(`Exporting ${type} data...`);
    // In a real implementation, this would generate and download reports
    alert(`Exporting ${type} data... (This would download a ${type} report)`);
  }

  viewDetails(section: string): void {
    console.log(`Viewing ${section} details...`);
    // In a real implementation, this would navigate to detailed views
  }

  dismissAlert(index: number): void {
    this.alerts.splice(index, 1);
  }

  // Format methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('en-US').format(num);
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  }

  // Getters for analytics sections
  get overview(): AnalyticsOverview | null {
    return this.analytics?.overview || null;
  }

  get salesAnalytics(): SalesAnalytics | null {
    return this.analytics?.sales || null;
  }

  get userAnalytics(): UserAnalytics | null {
    return this.analytics?.users || null;
  }

  get productAnalytics(): ProductAnalytics | null {
    return this.analytics?.products || null;
  }

  get orderAnalytics(): OrderAnalytics | null {
    return this.analytics?.orders || null;
  }

  get performanceAnalytics(): PerformanceAnalytics | null {
    return this.analytics?.performance || null;
  }

  // Helper methods for UI
  getGrowthClass(growth: number): string {
    if (growth > 0) return 'text-success';
    if (growth < 0) return 'text-danger';
    return 'text-secondary';
  }

  getGrowthIcon(growth: number): string {
    if (growth > 0) return 'bi-arrow-up';
    if (growth < 0) return 'bi-arrow-down';
    return 'bi-dash';
  }

  getHealthStatusClass(status: string): string {
    switch (status) {
      case 'healthy': return 'text-success';
      case 'warning': return 'text-warning';
      case 'critical': return 'text-danger';
      default: return 'text-secondary';
    }
  }

  getHealthStatusIcon(status: string): string {
    switch (status) {
      case 'healthy': return 'bi-check-circle';
      case 'warning': return 'bi-exclamation-triangle';
      case 'critical': return 'bi-x-circle';
      default: return 'bi-question-circle';
    }
  }

  getAlertClass(type: string): string {
    switch (type) {
      case 'error': return 'alert-danger';
      case 'warning': return 'alert-warning';
      case 'info': return 'alert-info';
      case 'success': return 'alert-success';
      default: return 'alert-secondary';
    }
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'order': return 'bi-shopping-cart';
      case 'user': return 'bi-person-plus';
      case 'product': return 'bi-box';
      case 'system': return 'bi-gear';
      default: return 'bi-info-circle';
    }
  }

  // Check if user is admin
  get isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  // Get current user
  get currentUser() {
    return this.authService.getCurrentUserValue();
  }

  // Filter methods
  applyFilters(): void {
    console.log('Applying filters:', this.dashboardForm.value);
    // In a real implementation, this would filter the analytics data
    this.refreshAnalytics();
  }

  resetFilters(): void {
    this.dashboardForm.reset({
      dateRange: '30days',
      category: 'all',
      status: 'all',
      sortBy: 'revenue',
      refreshInterval: 5
    });
    this.refreshAnalytics();
  }

  // Auto-refresh functionality
  startAutoRefresh(): void {
    const interval = this.dashboardForm.get('refreshInterval')?.value || 5;
    setInterval(() => {
      this.refreshAnalytics();
    }, interval * 60 * 1000); // Convert minutes to milliseconds
  }

  // Export methods
  exportFullReport(): void {
    console.log('Exporting full analytics report...');
    alert('Full analytics report would be downloaded as PDF/Excel');
  }

  exportSection(section: string): void {
    console.log(`Exporting ${section} report...`);
    alert(`${section} report would be downloaded`);
  }

  // Navigation methods
  navigateToUsers(): void {
    console.log('Navigating to users management...');
    // In a real implementation, this would use router navigation
  }

  navigateToProducts(): void {
    console.log('Navigating to products management...');
    // In a real implementation, this would use router navigation
  }

  navigateToOrders(): void {
    console.log('Navigating to orders management...');
    // In a real implementation, this would use router navigation
  }

  navigateToSettings(): void {
    console.log('Navigating to settings...');
    // In a real implementation, this would use router navigation
  }

  // Quick actions
  quickAddProduct(): void {
    console.log('Opening quick add product dialog...');
    alert('Quick add product dialog would open');
  }

  quickViewOrders(): void {
    console.log('Opening quick view orders dialog...');
    alert('Quick view orders dialog would open');
  }

  quickViewUsers(): void {
    console.log('Opening quick view users dialog...');
    alert('Quick view users dialog would open');
  }

  // Search functionality
  searchAnalytics(query: string): void {
    console.log(`Searching analytics for: ${query}`);
    // In a real implementation, this would filter analytics based on search
  }

  // Date range helpers
  getDateRangeLabel(range: string): string {
    switch (range) {
      case '7days': return 'Last 7 Days';
      case '30days': return 'Last 30 Days';
      case '90days': return 'Last 90 Days';
      case '1year': return 'Last Year';
      default: return 'Custom Range';
    }
  }

  // Performance metrics helpers
  getPerformanceColor(value: number, type: string): string {
    switch (type) {
      case 'responseTime':
        if (value < 200) return 'text-success';
        if (value < 500) return 'text-warning';
        return 'text-danger';
      case 'errorRate':
        if (value < 1) return 'text-success';
        if (value < 3) return 'text-warning';
        return 'text-danger';
      case 'uptime':
        if (value > 99.5) return 'text-success';
        if (value > 98) return 'text-warning';
        return 'text-danger';
      default:
        return 'text-secondary';
    }
  }

  // Initialize dashboard
  initializeDashboard(): void {
    this.loadAnalytics();
    this.generateMockData();
    this.startAutoRefresh();
  }
}
