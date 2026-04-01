import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  customParameters?: Record<string, any>;
}

export interface PageView {
  path: string;
  title: string;
  location: string;
  referrer?: string;
  customParameters?: Record<string, any>;
}

export interface UserProperties {
  userId?: string;
  email?: string;
  name?: string;
  role?: string;
  registrationDate?: string;
  lastLogin?: string;
  preferences?: Record<string, any>;
}

export interface ErrorInfo {
  message: string;
  stack?: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  userAgent?: string;
  url?: string;
  userId?: string;
  timestamp: string;
  context?: Record<string, any>;
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private isInitialized = false;
  private userId: string | null = null;
  private userProperties: UserProperties = {};
  
  // Google Analytics configuration
  private readonly GA_MEASUREMENT_ID = 'GA-XXXXXXXXX'; // Replace with actual GA4 ID
  private readonly GA_API_SECRET = 'XXXXXXXXXX'; // Replace with actual API secret
  
  // Sentry configuration (placeholder)
  private readonly SENTRY_DSN = 'https://XXXXXXXXX.ingest.sentry.io/XXXXXXX'; // Replace with actual DSN

  constructor(
    private router: Router,
    private authService: AuthService
  ) {
    this.initialize();
  }

  private initialize(): void {
    // Initialize Google Analytics
    this.initializeGoogleAnalytics();
    
    // Initialize error tracking
    this.initializeErrorTracking();
    
    // Track page views
    this.trackPageViews();
    
    // Track user authentication
    this.trackUserAuthentication();
    
    this.isInitialized = true;
  }

  private initializeGoogleAnalytics(): void {
    // Load Google Analytics script
    this.loadScript('https://www.googletagmanager.com/gtag/js?id=' + this.GA_MEASUREMENT_ID)
      .then(() => {
        // Initialize gtag
        if ((window as any).gtag) {
          (window as any).gtag('js', new Date());
          (window as any).gtag('config', this.GA_MEASUREMENT_ID, {
            send_page_view: false, // We'll handle page views manually
            debug_mode: !this.isProduction()
          });
          
          console.log('✅ Google Analytics initialized');
        } else {
          console.warn('⚠️ gtag function not available after script load - this is expected if GA is blocked');
          // Don't treat this as an error, it's normal when GA is blocked
        }
      })
      .catch(error => {
        console.warn('⚠️ Failed to load Google Analytics:', error);
        console.warn('⚠️ Analytics will be disabled - this is normal in development or when GA is blocked');
      });
  }

  private initializeErrorTracking(): void {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.userId || undefined,
        timestamp: new Date().toISOString(),
        context: {
          type: 'javascript_error',
          source: 'global_handler'
        }
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: this.userId || undefined,
        timestamp: new Date().toISOString(),
        context: {
          type: 'promise_rejection',
          reason: event.reason
        }
      });
    });

    console.log('✅ Error tracking initialized');
  }

  private trackPageViews(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const pageView: PageView = {
        path: event.urlAfterRedirects,
        title: this.getPageTitle(),
        location: window.location.href,
        referrer: document.referrer || undefined
      };

      this.trackPageView(pageView);
    });
  }

  private trackUserAuthentication(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userId = user.userId;
        this.userProperties = {
          userId: user.userId,
          email: user.email,
          name: user.email, // Use email as name since UserSession doesn't have firstName/lastName
          role: user.role,
          registrationDate: new Date(user.loginTime).toISOString(), // Use loginTime as fallback
          lastLogin: new Date(user.loginTime).toISOString(),
          preferences: {}
        };
        
        this.identifyUser(this.userProperties);
      } else {
        this.userId = null;
        this.userProperties = {};
        this.resetUser();
      }
    });
  }

  // Public methods
  trackPageView(pageView: PageView): void {
    if (!this.isInitialized) return;
    
    // Track in Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'page_view', {
        page_title: pageView.title,
        page_location: pageView.location,
        page_referrer: pageView.referrer
      });
    } else {
      // Fallback when gtag is not available
      console.log('📊 Page View (Analytics disabled):', pageView);
    }
    
    // Track in custom analytics
    console.log('📊 Page View:', pageView);
  }

  trackEvent(event: AnalyticsEvent): void {
    if (!this.isInitialized) return;
    
    // Track in Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        custom_parameters: event.customParameters
      });
    } else {
      // Fallback when gtag is not available
      console.log('📊 Event (Analytics disabled):', event);
    }
    
    // Track in custom analytics
    console.log('📊 Event:', event);
  }

  trackError(errorInfo: ErrorInfo): void {
    if (!this.isInitialized) return;
    
    // Track in Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: errorInfo.message,
        fatal: false,
        custom_parameters: {
          filename: errorInfo.filename,
          lineno: errorInfo.lineno,
          colno: errorInfo.colno,
          stack: errorInfo.stack?.substring(0, 1000) // Truncate long stack traces
        }
      });
    } else {
      // Fallback when gtag is not available
      console.log('📊 Error (Analytics disabled):', errorInfo);
    }
    
    // Log to console in development
    if (!this.isProduction()) {
      console.error('🚨 Error tracked:', errorInfo);
    }
    
    // Send to error tracking service (Sentry, etc.)
    this.sendToErrorTracking(errorInfo);
  }

  identifyUser(userProperties: UserProperties): void {
    if (!this.isInitialized) return;
    
    // Set user ID in Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('config', this.GA_MEASUREMENT_ID, {
        user_id: userProperties.userId,
        custom_parameters: {
          user_role: userProperties.role,
          user_registration_date: userProperties.registrationDate
        }
      });
    } else {
      // Fallback when gtag is not available
      console.log('📊 User identified (Analytics disabled):', userProperties);
    }
    
    console.log('👤 User identified:', userProperties);
  }

  resetUser(): void {
    if (!this.isInitialized) return;
    
    // Reset user in Google Analytics
    if ((window as any).gtag) {
      (window as any).gtag('config', this.GA_MEASUREMENT_ID, {
        user_id: undefined
      });
    } else {
      // Fallback when gtag is not available
      console.log('📊 User reset (Analytics disabled)');
    }
    
    console.log('👤 User reset');
  }

  // E-commerce tracking
  trackPurchase(order: any): void {
    this.trackEvent({
      category: 'Ecommerce',
      action: 'purchase',
      label: `Order ${order.id}`,
      value: order.total,
      customParameters: {
        transaction_id: order.id,
        currency: 'USD',
        value: order.total,
        items: order.items.map((item: any) => ({
          item_id: item.productId,
          item_name: item.name,
          category: item.category,
          quantity: item.quantity,
          price: item.price
        }))
      }
    });
  }

  trackAddToCart(product: any, quantity = 1): void {
    this.trackEvent({
      category: 'Ecommerce',
      action: 'add_to_cart',
      label: product.name,
      value: product.price * quantity,
      customParameters: {
        item_id: product.id,
        item_name: product.name,
        category: product.category,
        quantity: quantity,
        price: product.price
      }
    });
  }

  trackRemoveFromCart(product: any, quantity = 1): void {
    this.trackEvent({
      category: 'Ecommerce',
      action: 'remove_from_cart',
      label: product.name,
      value: product.price * quantity,
      customParameters: {
        item_id: product.id,
        item_name: product.name,
        category: product.category,
        quantity: quantity,
        price: product.price
      }
    });
  }

  trackProductView(product: any): void {
    this.trackEvent({
      category: 'Engagement',
      action: 'product_view',
      label: product.name,
      customParameters: {
        item_id: product.id,
        item_name: product.name,
        category: product.category,
        price: product.price,
        brand: product.brand
      }
    });
  }

  trackSearch(searchTerm: string, resultsCount: number): void {
    this.trackEvent({
      category: 'Search',
      action: 'search',
      label: searchTerm,
      value: resultsCount,
      customParameters: {
        search_term: searchTerm,
        results_count: resultsCount
      }
    });
  }

  trackFormSubmission(formName: string, success: boolean): void {
    this.trackEvent({
      category: 'Forms',
      action: success ? 'form_submit_success' : 'form_submit_error',
      label: formName,
      customParameters: {
        form_name: formName,
        success: success
      }
    });
  }

  // Performance tracking
  trackWebVitals(metrics: any): void {
    this.trackEvent({
      category: 'Performance',
      action: 'web_vitals',
      label: 'Core Web Vitals',
      customParameters: {
        lcp: metrics.lcp, // Largest Contentful Paint
        fid: metrics.fid, // First Input Delay
        cls: metrics.cls, // Cumulative Layout Shift
        fcp: metrics.fcp, // First Contentful Paint
        ttfb: metrics.ttfb // Time to First Byte
      }
    });
  }

  // Helper methods
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  private getPageTitle(): string {
    const title = document.querySelector('title');
    return title ? title.textContent || 'Unknown Page' : 'Unknown Page';
  }

  private isProduction(): boolean {
    return window.location.hostname !== 'localhost' && !window.location.hostname.includes('127.0.0.1');
  }

  private sendToErrorTracking(errorInfo: ErrorInfo): void {
    // In a real implementation, this would send to Sentry or another error tracking service
    // For now, we'll just log it in development
    if (!this.isProduction()) {
      console.warn('Error tracking (would send to service):', errorInfo);
    }
  }

  // Public API for manual tracking
  public setUserProperties(properties: Partial<UserProperties>): void {
    this.userProperties = { ...this.userProperties, ...properties };
    this.identifyUser(this.userProperties);
  }

  public getAnalyticsId(): string {
    return this.GA_MEASUREMENT_ID;
  }

  public isAnalyticsEnabled(): boolean {
    return this.isInitialized && this.isProduction();
  }
}
