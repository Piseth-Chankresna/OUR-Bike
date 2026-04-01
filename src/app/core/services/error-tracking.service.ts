import { Injectable } from '@angular/core';
import { ErrorHandler } from '@angular/core';
import { AnalyticsService } from './analytics.service';
import { AuthService } from './auth.service';

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  type: 'javascript' | 'network' | 'http' | 'promise' | 'custom';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  userId?: string;
  userAgent: string;
  url: string;
  context?: {
    component?: string;
    action?: string;
    data?: any;
    [key: string]: any;
  };
  solved: boolean;
  count: number;
  lastOccurred: string;
}

export interface ErrorTrackingConfig {
  enabled: boolean;
  maxErrors: number;
  enableConsoleLogging: boolean;
  enableRemoteReporting: boolean;
  remoteEndpoint?: string;
  enableUserFeedback: boolean;
  enableAutomaticRetry: boolean;
  retryAttempts: number;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorTrackingService implements ErrorHandler {
  private errors: ErrorReport[] = [];
  private config: ErrorTrackingConfig = {
    enabled: true,
    maxErrors: 100,
    enableConsoleLogging: true,
    enableRemoteReporting: false,
    enableUserFeedback: true,
    enableAutomaticRetry: false,
    retryAttempts: 3
  };

  constructor(
    private analyticsService: AnalyticsService,
    private authService: AuthService
  ) {
    this.initializeErrorTracking();
  }

  private initializeErrorTracking(): void {
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
    
    // Track user context
    this.trackUserContext();
    
    console.log('✅ Error tracking service initialized');
  }

  private setupGlobalErrorHandlers(): void {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message,
        stack: event.error?.stack,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        error: event.reason
      });
    });

    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.handleError({
          message: `Resource loading error: ${(event.target as any).src || (event.target as any).href}`,
          type: 'network',
          context: {
            elementType: (event.target as any).tagName,
            source: (event.target as any).src || (event.target as any).href
          }
        });
      }
    }, true);
  }

  private trackUserContext(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        console.log('👤 Error tracking: User context updated', user.userId);
      }
    });
  }

  // Angular ErrorHandler implementation
  handleError(error: any): void {
    if (!this.config.enabled) return;

    const errorReport = this.createErrorReport(error);
    this.addError(errorReport);
    
    // Log to console
    if (this.config.enableConsoleLogging) {
      this.logErrorToConsole(errorReport);
    }

    // Track in analytics
    this.trackErrorInAnalytics(errorReport);

    // Send to remote service
    if (this.config.enableRemoteReporting) {
      this.sendErrorToRemote(errorReport);
    }

    // Show user feedback for critical errors
    if (errorReport.severity === 'critical') {
      this.showCriticalErrorNotification(errorReport);
    }
  }

  private createErrorReport(error: any): ErrorReport {
    const timestamp = new Date().toISOString();
    const user = this.authService.getCurrentUserValue();
    
    return {
      id: this.generateErrorId(),
      message: error.message || error.toString(),
      stack: error.stack,
      type: this.getErrorType(error),
      severity: this.getErrorSeverity(error),
      timestamp,
      userId: user?.userId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      context: this.getErrorContext(error),
      solved: false,
      count: 1,
      lastOccurred: timestamp
    };
  }

  private getErrorType(error: any): ErrorReport['type'] {
    if (error instanceof TypeError) return 'javascript';
    if (error instanceof ReferenceError) return 'javascript';
    if (error instanceof SyntaxError) return 'javascript';
    if (error instanceof RangeError) return 'javascript';
    if (error.name === 'HttpErrorResponse') return 'http';
    if (error.type === 'network') return 'network';
    if (error.type === 'promise') return 'promise';
    return 'custom';
  }

  private getErrorSeverity(error: any): ErrorReport['severity'] {
    const message = (error.message || error.toString()).toLowerCase();
    
    // Reduce severity for image loading errors
    if (message.includes('failed to load resource') || 
        message.includes('net::err_name_not_resolved') ||
        message.includes('404') ||
        message.includes('img')) {
      return 'low';
    }
    
    // Critical errors
    if (message.includes('cannot read property') || 
        message.includes('is not a function') ||
        message.includes('uncaught') ||
        message.includes('chunk')) {
      return 'critical';
    }
    
    // High severity
    if (message.includes('undefined') ||
        message.includes('null') ||
        message.includes('failed to fetch')) {
      return 'high';
    }
    
    // Medium severity
    if (message.includes('warning') ||
        message.includes('deprecated')) {
      return 'medium';
    }
    
    return 'low';
  }

  private getErrorContext(error: any): any {
    return {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      online: navigator.onLine,
      cookieEnabled: navigator.cookieEnabled,
      localStorage: this.getStorageInfo(),
      sessionStorage: this.getSessionStorageInfo(),
      ...error.context
    };
  }

  private getStorageInfo(): any {
    try {
      return {
        available: !!localStorage,
        size: JSON.stringify(localStorage).length,
        keys: Object.keys(localStorage).length
      };
    } catch {
      return { available: false };
    }
  }

  private getSessionStorageInfo(): any {
    try {
      return {
        available: !!sessionStorage,
        size: JSON.stringify(sessionStorage).length,
        keys: Object.keys(sessionStorage).length
      };
    } catch {
      return { available: false };
    }
  }

  private addError(errorReport: ErrorReport): void {
    // Check if similar error already exists
    const existingError = this.errors.find(e => 
      e.message === errorReport.message && 
      e.type === errorReport.type &&
      !e.solved
    );

    if (existingError) {
      // Increment count and update timestamp
      existingError.count++;
      existingError.lastOccurred = errorReport.timestamp;
      existingError.severity = (['critical', 'high', 'medium', 'low'] as const)[Math.max(
        this.getSeverityLevel(existingError.severity),
        this.getSeverityLevel(errorReport.severity)
      )];
    } else {
      // Add new error
      this.errors.unshift(errorReport);
    }

    // Maintain max errors limit
    if (this.errors.length > this.config.maxErrors) {
      this.errors = this.errors.slice(0, this.config.maxErrors);
    }
  }

  private logErrorToConsole(errorReport: ErrorReport): void {
    const logMethod = this.getLogMethod(errorReport.severity);
    logMethod.call(console, `🚨 Error [${errorReport.severity.toUpperCase()}]:`, errorReport);
  }

  private getLogMethod(severity: ErrorReport['severity']): Console['log'] | Console['warn'] | Console['error'] {
    switch (severity) {
      case 'critical':
      case 'high':
        return console.error;
      case 'medium':
        return console.warn;
      default:
        return console.log;
    }
  }

  private trackErrorInAnalytics(errorReport: ErrorReport): void {
    this.analyticsService.trackError({
      message: errorReport.message,
      stack: errorReport.stack,
      filename: errorReport.context?.['filename'],
      lineno: errorReport.context?.['lineno'],
      colno: errorReport.context?.['colno'],
      userAgent: errorReport.userAgent,
      url: errorReport.url,
      userId: errorReport.userId,
      timestamp: errorReport.timestamp,
      context: errorReport.context
    });
  }

  private sendErrorToRemote(errorReport: ErrorReport): void {
    if (!this.config.remoteEndpoint) return;

    // In a real implementation, this would send to your error tracking service
    console.log('📡 Would send error to remote service:', errorReport);
  }

  private showCriticalErrorNotification(errorReport: ErrorReport): void {
    // Create user-friendly error notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="error-content">
        <h4>⚠️ Something went wrong</h4>
        <p>We're sorry, but an unexpected error occurred. Our team has been notified.</p>
        <button onclick="this.parentElement.parentElement.remove()">Dismiss</button>
      </div>
    `;
    
    // Add basic styling
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #f44336;
      color: white;
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 9999;
      max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  // Public API methods
  trackCustomError(message: string, context?: any, severity: ErrorReport['severity'] = 'medium'): void {
    this.handleError({
      message,
      type: 'custom',
      context,
      severity
    });
  }

  trackNetworkError(url: string, status: number, error: any): void {
    this.handleError({
      message: `Network error: ${status} ${url}`,
      type: 'network',
      context: {
        url,
        status,
        method: error.method || 'GET',
        headers: error.headers
      }
    });
  }

  trackUserAction(action: string, error: any): void {
    this.handleError({
      message: `Error during ${action}: ${error.message}`,
      type: 'custom',
      context: {
        action,
        userAction: true
      }
    });
  }

  getErrors(): ErrorReport[] {
    return [...this.errors];
  }

  getErrorsByType(type: ErrorReport['type']): ErrorReport[] {
    return this.errors.filter(e => e.type === type);
  }

  getErrorsBySeverity(severity: ErrorReport['severity']): ErrorReport[] {
    return this.errors.filter(e => e.severity === severity);
  }

  solveError(errorId: string): void {
    const error = this.errors.find(e => e.id === errorId);
    if (error) {
      error.solved = true;
      console.log(`✅ Error marked as solved: ${errorId}`);
    }
  }

  clearErrors(): void {
    this.errors = [];
    console.log('🧹 Error history cleared');
  }

  updateConfig(config: Partial<ErrorTrackingConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('⚙️ Error tracking config updated:', this.config);
  }

  getConfig(): ErrorTrackingConfig {
    return { ...this.config };
  }

  // Utility methods
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getSeverityLevel(severity: ErrorReport['severity']): number {
    switch (severity) {
      case 'critical': return 4;
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  // Performance monitoring
  trackPerformanceIssue(issue: string, metrics: any): void {
    this.handleError({
      message: `Performance issue: ${issue}`,
      type: 'custom',
      severity: 'medium',
      context: {
        performance: true,
        metrics
      }
    });
  }
}
