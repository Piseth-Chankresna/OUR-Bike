import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { PerformanceService, PerformanceMetrics, WebVitalsMetrics } from '../../../core/services/performance.service';

@Component({
  selector: 'app-performance-monitor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './performance-monitor.component.html',
  styleUrls: ['./performance-monitor.component.scss']
})
export class PerformanceMonitorComponent implements OnInit, OnDestroy {
  metrics: PerformanceMetrics[] = [];
  webVitals: WebVitalsMetrics | null = null;
  performanceScore = 0;
  averageLoadTime = 0;
  memoryUsage: any = null;
  networkInfo: any = null;
  
  isMonitoring = false;
  refreshInterval: any;
  
  settingsForm!: FormGroup;
  
  private destroy$ = new Subject<void>();

  constructor(
    private performanceService: PerformanceService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadPerformanceData();
    this.startMonitoring();
    
    this.performanceService.performance$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadPerformanceData();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopMonitoring();
  }

  private initializeForm(): void {
    this.settingsForm = this.fb.group({
      autoRefresh: [true],
      refreshInterval: [5000],
      showDetails: [false]
    });

    this.settingsForm.get('autoRefresh')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(autoRefresh => {
        if (autoRefresh) {
          this.startMonitoring();
        } else {
          this.stopMonitoring();
        }
      });

    this.settingsForm.get('refreshInterval')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.isMonitoring) {
          this.stopMonitoring();
          this.startMonitoring();
        }
      });
  }

  private loadPerformanceData(): void {
    this.metrics = this.performanceService.getMetrics();
    this.webVitals = this.performanceService.getWebVitals();
    this.performanceScore = this.performanceService.getPerformanceScore();
    this.averageLoadTime = this.performanceService.getAverageLoadTime();
    this.memoryUsage = this.performanceService.getMemoryUsage();
    this.networkInfo = this.performanceService.getNetworkInfo();
  }

  private startMonitoring(): void {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    const interval = this.settingsForm.get('refreshInterval')?.value || 5000;
    
    this.refreshInterval = setInterval(() => {
      this.loadPerformanceData();
    }, interval);
  }

  private stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  // Helper methods
  getScoreColor(score: number): string {
    if (score >= 90) return '#28a745'; // Green
    if (score >= 70) return '#ffc107'; // Yellow
    return '#dc3545'; // Red
  }

  getScoreGrade(score: number): string {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }

  formatTime(ms: number): string {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  }

  formatMemory(bytes: number): string {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  getNetworkQuality(): string {
    if (!this.networkInfo) return 'Unknown';
    
    const { effectiveType, downlink, rtt } = this.networkInfo;
    
    if (effectiveType === '4g' && downlink >= 10 && rtt <= 100) return 'Excellent';
    if (effectiveType === '4g' || (effectiveType === '3g' && downlink >= 1.5)) return 'Good';
    if (effectiveType === '3g') return 'Fair';
    return 'Poor';
  }

  getNetworkQualityColor(): string {
    const quality = this.getNetworkQuality();
    switch (quality) {
      case 'Excellent': return '#28a745';
      case 'Good': return '#17a2b8';
      case 'Fair': return '#ffc107';
      case 'Poor': return '#dc3545';
      default: return '#6c757d';
    }
  }

  getMemoryStatus(): string {
    if (!this.memoryUsage) return 'Unknown';
    
    const percentage = this.memoryUsage.usedPercentage;
    if (percentage < 50) return 'Good';
    if (percentage < 80) return 'Moderate';
    return 'High';
  }

  getMemoryStatusColor(): string {
    const status = this.getMemoryStatus();
    switch (status) {
      case 'Good': return '#28a745';
      case 'Moderate': return '#ffc107';
      case 'High': return '#dc3545';
      default: return '#6c757d';
    }
  }

  // Actions
  refreshData(): void {
    this.loadPerformanceData();
  }

  clearMetrics(): void {
    this.performanceService.clearMetrics();
    this.loadPerformanceData();
  }

  exportData(): void {
    const data = this.performanceService.exportMetrics();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  getRecommendations(): string[] {
    return this.performanceService.getPerformanceRecommendations();
  }

  getSlowestRoutes(): PerformanceMetrics[] {
    return this.performanceService.getSlowestRoutes();
  }

  isPerformanceGood(): boolean {
    return this.performanceService.isPerformanceGood();
  }

  // Web Vitals helpers
  getWebVitalsColor(metric: keyof WebVitalsMetrics): string {
    if (!this.webVitals) return '#6c757d';
    
    const value = this.webVitals[metric];
    
    switch (metric) {
      case 'FCP':
        return value <= 1800 ? '#28a745' : value <= 2500 ? '#ffc107' : '#dc3545';
      case 'LCP':
        return value <= 2500 ? '#28a745' : value <= 4000 ? '#ffc107' : '#dc3545';
      case 'FID':
        return value <= 100 ? '#28a745' : value <= 300 ? '#ffc107' : '#dc3545';
      case 'CLS':
        return value <= 0.1 ? '#28a745' : value <= 0.25 ? '#ffc107' : '#dc3545';
      case 'TTFB':
        return value <= 600 ? '#28a745' : value <= 1000 ? '#ffc107' : '#dc3545';
      default:
        return '#6c757d';
    }
  }

  getWebVitalsStatus(metric: keyof WebVitalsMetrics): string {
    if (!this.webVitals) return 'Unknown';
    
    const value = this.webVitals[metric];
    
    switch (metric) {
      case 'FCP':
        return value <= 1800 ? 'Good' : value <= 2500 ? 'Needs Improvement' : 'Poor';
      case 'LCP':
        return value <= 2500 ? 'Good' : value <= 4000 ? 'Needs Improvement' : 'Poor';
      case 'FID':
        return value <= 100 ? 'Good' : value <= 300 ? 'Needs Improvement' : 'Poor';
      case 'CLS':
        return value <= 0.1 ? 'Good' : value <= 0.25 ? 'Needs Improvement' : 'Poor';
      case 'TTFB':
        return value <= 600 ? 'Good' : value <= 1000 ? 'Needs Improvement' : 'Poor';
      default:
        return 'Unknown';
    }
  }
}
