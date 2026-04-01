import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';

export interface PerformanceMetrics {
  navigationStart: number;
  navigationEnd: number;
  loadTime: number;
  route: string;
  timestamp: number;
}

export interface WebVitalsMetrics {
  FCP: number; // First Contentful Paint
  LCP: number; // Largest Contentful Paint
  FID: number; // First Input Delay
  CLS: number; // Cumulative Layout Shift
  TTFB: number; // Time to First Byte
}

export interface PerformanceReport {
  averageLoadTime: number;
  totalNavigations: number;
  slowestRoute: string;
  fastestRoute: string;
  webVitals: WebVitalsMetrics | null;
  recommendations: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private metrics: PerformanceMetrics[] = [];
  private webVitals: WebVitalsMetrics | null = null;
  private performanceSubject = new Subject<PerformanceMetrics>();
  private performanceReportSubject = new BehaviorSubject<PerformanceReport | null>(null);
  
  public performance$ = this.performanceSubject.asObservable();
  public performanceReport$ = this.performanceReportSubject.asObservable();

  constructor(private router: Router) {
    this.initializePerformanceMonitoring();
    this.trackNavigationPerformance();
  }

  private initializePerformanceMonitoring(): void {
    // Monitor Web Vitals
    this.observeFirstContentfulPaint();
    this.observeLargestContentfulPaint();
    this.observeFirstInputDelay();
    this.observeCumulativeLayoutShift();
    this.observeTimeToFirstByte();
  }

  private trackNavigationPerformance(): void {
    let navigationStart = 0;

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      const navigationEnd = performance.now();
      const loadTime = navigationEnd - navigationStart;

      const metric: PerformanceMetrics = {
        navigationStart,
        navigationEnd,
        loadTime,
        route: event.urlAfterRedirects,
        timestamp: Date.now()
      };

      this.metrics.push(metric);
      this.performanceSubject.next(metric);

      // Keep only last 50 metrics
      if (this.metrics.length > 50) {
        this.metrics = this.metrics.slice(-50);
      }

      navigationStart = performance.now();
    });

    // Track navigation start
    this.router.events.subscribe((event) => {
      if (event.constructor.name === 'NavigationStart') {
        navigationStart = performance.now();
      }
    });
  }

  private observeFirstContentfulPaint(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          this.webVitals = {
            ...this.webVitals!,
            FCP: fcpEntry.startTime
          };
        }
      });

      observer.observe({ type: 'paint', buffered: true });
    }
  }

  private observeLargestContentfulPaint(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcpEntry = entries[entries.length - 1]; // Get the latest LCP
        if (lcpEntry) {
          this.webVitals = {
            ...this.webVitals!,
            LCP: lcpEntry.startTime
          };
        }
      });

      observer.observe({ type: 'largest-contentful-paint', buffered: true });
    }
  }

  private observeFirstInputDelay(): void {
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fidEntry = entries[0];
        if (fidEntry && 'processingStart' in fidEntry) {
          const fid = (fidEntry as any).processingStart - fidEntry.startTime;
          this.webVitals = {
            ...this.webVitals!,
            FID: fid
          };
        }
      });

      observer.observe({ type: 'first-input', buffered: true });
    }
  }

  private observeCumulativeLayoutShift(): void {
    if ('PerformanceObserver' in window) {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });

        this.webVitals = {
          ...this.webVitals!,
          CLS: clsValue
        };
      });

      observer.observe({ type: 'layout-shift', buffered: true });
    }
  }

  private observeTimeToFirstByte(): void {
    if ('performance' in window && 'timing' in performance) {
      const ttfb = performance.timing.responseStart - performance.timing.navigationStart;
      this.webVitals = {
        ...this.webVitals!,
        TTFB: ttfb
      };
    }
  }

  // Public methods
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  getWebVitals(): WebVitalsMetrics | null {
    return this.webVitals;
  }

  getAverageLoadTime(): number {
    if (this.metrics.length === 0) return 0;
    const total = this.metrics.reduce((sum, metric) => sum + metric.loadTime, 0);
    return total / this.metrics.length;
  }

  getSlowestRoutes(): PerformanceMetrics[] {
    return this.metrics
      .sort((a, b) => b.loadTime - a.loadTime)
      .slice(0, 10);
  }

  getRouteMetrics(route: string): PerformanceMetrics[] {
    return this.metrics.filter(metric => metric.route === route);
  }

  // Performance scoring
  getPerformanceScore(): number {
    if (!this.webVitals) return 0;

    let score = 100;

    // FCP scoring (0-100)
    if (this.webVitals.FCP > 2500) score -= 20;
    else if (this.webVitals.FCP > 1800) score -= 10;

    // LCP scoring (0-100)
    if (this.webVitals.LCP > 4000) score -= 20;
    else if (this.webVitals.LCP > 2500) score -= 10;

    // FID scoring (0-100)
    if (this.webVitals.FID > 300) score -= 20;
    else if (this.webVitals.FID > 100) score -= 10;

    // CLS scoring (0-100)
    if (this.webVitals.CLS > 0.25) score -= 20;
    else if (this.webVitals.CLS > 0.1) score -= 10;

    // TTFB scoring (0-100)
    if (this.webVitals.TTFB > 1000) score -= 20;
    else if (this.webVitals.TTFB > 600) score -= 10;

    return Math.max(0, score);
  }

  // Memory usage monitoring
  getMemoryUsage(): any {
    if ('memory' in performance) {
      return {
        used: (performance as any).memory.usedJSHeapSize,
        total: (performance as any).memory.totalJSHeapSize,
        limit: (performance as any).memory.jsHeapSizeLimit,
        usedPercentage: ((performance as any).memory.usedJSHeapSize / (performance as any).memory.jsHeapSizeLimit) * 100
      };
    }
    return null;
  }

  // Network information
  getNetworkInfo(): any {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    return null;
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics = [];
    this.webVitals = null;
  }

  // Export metrics
  exportMetrics(): string {
    const data = {
      metrics: this.metrics,
      webVitals: this.webVitals,
      averageLoadTime: this.getAverageLoadTime(),
      performanceScore: this.getPerformanceScore(),
      memoryUsage: this.getMemoryUsage(),
      networkInfo: this.getNetworkInfo(),
      exportDate: new Date().toISOString()
    };

    return JSON.stringify(data, null, 2);
  }

  // Check if performance is good
  isPerformanceGood(): boolean {
    return this.getPerformanceScore() >= 80;
  }

  // Get performance recommendations
  getPerformanceRecommendations(): string[] {
    const recommendations: string[] = [];
    const score = this.getPerformanceScore();

    if (!this.webVitals) {
      recommendations.push('Performance metrics not available yet');
      return recommendations;
    }

    if (this.webVitals.FCP > 2500) {
      recommendations.push('Consider optimizing initial page load and reducing render-blocking resources');
    }

    if (this.webVitals.LCP > 4000) {
      recommendations.push('Optimize images and reduce largest content element size');
    }

    if (this.webVitals.FID > 300) {
      recommendations.push('Reduce JavaScript execution time and break up long tasks');
    }

    if (this.webVitals.CLS > 0.25) {
      recommendations.push('Ensure proper image dimensions and avoid layout shifts');
    }

    if (this.webVitals.TTFB > 1000) {
      recommendations.push('Optimize server response time and use CDN');
    }

    const memoryUsage = this.getMemoryUsage();
    if (memoryUsage && memoryUsage.usedPercentage > 80) {
      recommendations.push('Monitor memory usage and consider memory optimization');
    }

    if (score < 50) {
      recommendations.push('Overall performance needs significant improvement');
    } else if (score < 80) {
      recommendations.push('Performance could be improved with optimizations');
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance is excellent! Keep up the good work.');
    }

    return recommendations;
  }

  // Debounce function for performance optimization
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: number;
    return (...args: Parameters<T>): void => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  // Throttle function for performance optimization
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>): void => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // Memoize function for performance optimization
  memoize<T extends (...args: any[]) => any>(func: T): T {
    const cache = new Map();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  }

  // Lazy load images
  lazyLoadImage(imageElement: HTMLImageElement, src: string): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });

    imageElement.classList.add('lazy');
    observer.observe(imageElement);
  }

  // Optimize image loading
  optimizeImageSrc(src: string, width: number, height: number, quality: number = 80): string {
    // This would integrate with an image optimization service
    // For now, return the original src
    return src;
  }

  // Preload critical resources
  preloadResource(url: string, type: 'script' | 'style' | 'image' | 'font'): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = type;
    document.head.appendChild(link);
  }

  // Generate performance report
  generatePerformanceReport(): PerformanceReport {
    const averageLoadTime = this.getAverageLoadTime();
    const totalNavigations = this.metrics.length;
    const slowestRoutes = this.getSlowestRoutes();
    const fastestRoutes = this.getFastestRoutes();
    const recommendations = this.getPerformanceRecommendations();

    return {
      averageLoadTime,
      totalNavigations,
      slowestRoute: slowestRoutes[0]?.route || 'N/A',
      fastestRoute: fastestRoutes[0]?.route || 'N/A',
      webVitals: this.webVitals,
      recommendations
    };
  }

  // Get fastest routes
  getFastestRoutes(): PerformanceMetrics[] {
    return this.metrics
      .sort((a, b) => a.loadTime - b.loadTime)
      .slice(0, 10);
  }
}
