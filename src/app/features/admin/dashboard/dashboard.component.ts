import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { EnhancedStorageService } from '../../../core/services/enhanced-storage.service';
import { AuthService } from '../../../core/services/auth.service';
import { Order, User, Product } from '../../../core/types/data.types';

interface DashboardStats {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  pendingOrders: number;
  completedOrders: number;
  activeUsers: number;
  newUsersToday: number;
  lowStockItems: number;
  totalCategories: number;
}

interface RecentActivity {
  id: string;
  type: 'order' | 'user' | 'product' | 'review';
  title: string;
  description: string;
  timestamp: number;
  user?: string;
}

interface TopProduct {
  id: string;
  name: string;
  category: string;
  sales: number;
  revenue: number;
  stock: number;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  storage: number;
  performance: number;
  errors: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats = {
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    activeUsers: 0,
    newUsersToday: 0,
    lowStockItems: 0,
    totalCategories: 0
  };

  recentActivity: RecentActivity[] = [];
  topProducts: TopProduct[] = [];
  systemHealth: SystemHealth = {
    status: 'healthy',
    uptime: 0,
    storage: 0,
    performance: 0,
    errors: 0
  };

  dateRangeForm!: FormGroup;
  isLoading = true;
  selectedPeriod = '7days';

  private destroy$ = new Subject<void>();

  constructor(
    private enhancedStorageService: EnhancedStorageService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.dateRangeForm = this.fb.group({
      period: ['7days']
    });

    this.dateRangeForm.get('period')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(period => {
        this.selectedPeriod = period;
        this.loadDashboardData();
      });
  }

  public loadDashboardData(): void {
    console.log('Loading dashboard data...');
    this.isLoading = true;
    
    // Simulate API delay
    setTimeout(() => {
      console.log('Loading stats...');
      this.loadStats();
      console.log('Loading recent activity...');
      this.loadRecentActivity();
      console.log('Loading top products...');
      this.loadTopProducts();
      console.log('Loading system health...');
      this.loadSystemHealth();
      console.log('Dashboard data loaded');
      this.isLoading = false;
    }, 800);
  }

  private loadStats(): void {
    console.log('Loading stats...');
    const users = this.enhancedStorageService.getUsers();
    const orders = this.enhancedStorageService.getOrders();
    const products = this.enhancedStorageService.getProducts();
    const categories = this.enhancedStorageService.getCategories();

    console.log('Users:', users);
    console.log('Orders:', orders);
    console.log('Products:', products);
    console.log('Categories:', categories);

    const today = Date.now();
    const oneDayAgo = today - (24 * 60 * 60 * 1000);

    // Calculate low stock items (products with stock < 10)
    const lowStockItems = this.enhancedStorageService.getLowStockProducts().length;

    this.stats = {
      totalUsers: users.length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0),
      totalProducts: products.length,
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      completedOrders: orders.filter(order => order.status === 'completed').length,
      activeUsers: users.filter(user => user.isActive).length,
      newUsersToday: users.filter(user => user.registeredDate > oneDayAgo).length,
      lowStockItems: lowStockItems,
      totalCategories: categories.length
    };

    console.log('Final stats:', this.stats);
  }

  private loadRecentActivity(): void {
    const orders = this.enhancedStorageService.getOrders();
    const users = this.enhancedStorageService.getUsers();
    const products = this.enhancedStorageService.getProducts();

    const activities: RecentActivity[] = [];

    // Add recent orders
    orders.slice(-5).reverse().forEach((order: Order) => {
      activities.push({
        id: order.id,
        type: 'order',
        title: `Order #${order.id.slice(-6)}`,
        description: `Order placed for ${order.total ? '$' + order.total.toFixed(2) : 'multiple items'}`,
        timestamp: order.orderDate,
        user: users.find(u => u.id === order.userId)?.name || 'Unknown User'
      });
    });

    // Add recent user registrations
    users.slice(-3).reverse().forEach((user: User) => {
      activities.push({
        id: user.id,
        type: 'user',
        title: 'New User Registration',
        description: `${user.name} joined the platform`,
        timestamp: user.registeredDate,
        user: user.name
      });
    });

    // Add recent product updates
    products.slice(-3).reverse().forEach((product: Product) => {
      activities.push({
        id: product.id,
        type: 'product',
        title: 'Product Updated',
        description: `${product.name} was updated`,
        timestamp: product.updatedAt || product.createdAt,
        user: 'Admin'
      });
    });

    this.recentActivity = activities;
  }

  private loadTopProducts(): void {
    const orders = this.enhancedStorageService.getOrders();
    const products = this.enhancedStorageService.getProducts();

    const productSales = new Map<string, { sales: number; revenue: number }>();

    orders.forEach((order: Order) => {
      if (order.items) {
        order.items.forEach((item: any) => {
          const current = productSales.get(item.productId) || { sales: 0, revenue: 0 };
          productSales.set(item.productId, {
            sales: current.sales + (item.quantity || 1),
            revenue: current.revenue + (item.price * (item.quantity || 1))
          });
        });
      }
    });

    // Convert to array and sort by revenue
    this.topProducts = Array.from(productSales.entries())
      .map(([productId, data]) => ({
        id: productId,
        name: products.find(p => p.id === productId)?.name || 'Unknown Product',
        category: products.find(p => p.id === productId)?.category || 'Uncategorized',
        sales: data.sales,
        revenue: data.revenue,
        stock: products.find(p => p.id === productId)?.stock || 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  private loadSystemHealth(): void {
    const products = this.enhancedStorageService.getProducts();
    const orders = this.enhancedStorageService.getOrders();
    const users = this.enhancedStorageService.getUsers();

    const totalProducts = products.length;
    const activeUsers = users.filter(user => user.isActive).length;
    const lowStockItems = this.enhancedStorageService.getLowStockProducts().length;
    const outOfStockItems = this.enhancedStorageService.getOutOfStockProducts().length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;

    // Calculate health metrics
    const errors = 0; // Could be calculated from error logs
    const storage = Math.max(0, Math.min(100, (totalProducts / 10) * 15)); // Simulated storage usage
    const performance = Math.min(100, 100 - (lowStockItems * 5) - (outOfStockItems * 2)); // Simulated performance
    const uptime = Math.random() * 20 + 80; // Simulated uptime

    this.systemHealth = {
      status: lowStockItems > 5 ? 'warning' : outOfStockItems > 10 ? 'critical' : 'healthy',
      uptime,
      storage,
      performance,
      errors
    };
  }

  // Helper methods
  getActivityIcon(type: string): string {
    const icons = {
      order: 'bi-bag-check',
      user: 'bi-person-plus',
      product: 'bi-box',
      review: 'bi-star'
    };
    return icons[type as keyof typeof icons] || 'bi-info-circle';
  }

  getActivityColor(type: string): string {
    const colors = {
      order: '#28a745',
      user: '#007bff',
      product: '#ffc107',
      review: '#17a2b8'
    };
    return colors[type as keyof typeof colors] || '#6c757d';
  }

  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays}d ago`;
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getHealthStatusColor(status: string): string {
    const colors = {
      healthy: '#28a745',
      warning: '#ffc107',
      critical: '#dc3545'
    };
    return colors[status as keyof typeof colors] || '#6c757d';
  }

  getHealthStatusIcon(status: string): string {
    const icons = {
      healthy: 'bi-check-circle',
      warning: 'bi-exclamation-triangle',
      critical: 'bi-x-circle'
    };
    return icons[status as keyof typeof icons] || 'bi-question-circle';
  }

  getPerformanceColor(value: number): string {
    if (value >= 85) return '#28a745';
    if (value >= 70) return '#ffc107';
    return '#dc3545';
  }

  refreshData(): void {
    this.loadDashboardData();
  }

  exportData(): void {
    const data = {
      stats: this.stats,
      topProducts: this.topProducts,
      systemHealth: this.systemHealth,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dashboard-export-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
