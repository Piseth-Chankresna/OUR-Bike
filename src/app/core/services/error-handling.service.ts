import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, BehaviorSubject, Observable } from 'rxjs';

export interface ErrorInfo {
  id: string;
  message: string;
  type: 'error' | 'warning' | 'info' | 'success';
  timestamp: number;
  stack?: string;
  context?: string;
  userAction?: string;
  component?: string;
  statusCode?: number;
}

export interface ErrorHandlingConfig {
  enableConsoleLogging: boolean;
  enableUserNotifications: boolean;
  enableErrorTracking: boolean;
  maxErrorHistory: number;
  enableAutoRetry: boolean;
  retryAttempts: number;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {
  private router = inject(Router);
  
  private errorSubject = new Subject<ErrorInfo>();
  private errorHistorySubject = new BehaviorSubject<ErrorInfo[]>([]);
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  
  public errors$ = this.errorSubject.asObservable();
  public errorHistory$ = this.errorHistorySubject.asObservable();
  public isLoading$ = this.isLoadingSubject.asObservable();
  
  private errorHistory: ErrorInfo[] = [];
  private config: ErrorHandlingConfig = {
    enableConsoleLogging: true,
    enableUserNotifications: true,
    enableErrorTracking: true,
    maxErrorHistory: 50,
    enableAutoRetry: false,
    retryAttempts: 3
  };

  constructor() {
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  // Configure error handling settings
  configure(config: Partial<ErrorHandlingConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Handle application errors
  handleError(
    error: Error | string,
    type: ErrorInfo['type'] = 'error',
    context?: string,
    userAction?: string,
    component?: string
  ): void {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      message: typeof error === 'string' ? error : error.message,
      type,
      timestamp: Date.now(),
      stack: typeof error === 'string' ? undefined : error.stack,
      context,
      userAction,
      component,
      statusCode: this.extractStatusCode(error)
    };

    // Log to console
    if (this.config.enableConsoleLogging) {
      this.logToConsole(errorInfo);
    }

    // Add to error history
    this.addToErrorHistory(errorInfo);

    // Show user notification
    if (this.config.enableUserNotifications) {
      this.notifyUser(errorInfo);
    }

    // Track error for analytics
    if (this.config.enableErrorTracking) {
      this.trackError(errorInfo);
    }

    // Emit error for components to handle
    this.errorSubject.next(errorInfo);
  }

  // Handle HTTP errors
  handleHttpError(error: any, context?: string): void {
    let message = 'An unexpected error occurred';
    let type: ErrorInfo['type'] = 'error';

    if (error.status === 0) {
      message = 'Network connection failed. Please check your internet connection.';
      type = 'error';
    } else if (error.status >= 400 && error.status < 500) {
      message = this.getClientErrorMessage(error.status);
      type = 'error';
    } else if (error.status >= 500) {
      message = 'Server error occurred. Please try again later.';
      type = 'error';
    } else if (error.error?.message) {
      message = error.error.message;
    } else if (error.message) {
      message = error.message;
    }

    this.handleError(error, type, context, 'HTTP Request', 'HttpClient');
  }

  // Handle form validation errors
  handleFormErrors(formErrors: any, formName: string): void {
    const errorMessages = Object.keys(formErrors).map(field => {
      const errors = formErrors[field];
      const message = this.getFormErrorMessage(field, errors);
      return `${field}: ${message}`;
    });

    const combinedMessage = errorMessages.join(', ');
    this.handleError(combinedMessage, 'warning', 'Form Validation', 'Form Submit', formName);
  }

  // Handle LocalStorage errors
  handleStorageError(error: any, operation: string): void {
    let message = 'Storage operation failed';
    
    if (error.name === 'QuotaExceededError') {
      message = 'Storage quota exceeded. Please clear some data.';
    } else if (error.name === 'SecurityError') {
      message = 'Storage access denied. Please check your browser settings.';
    } else if (error.name === 'TypeError') {
      message = 'Storage is not available in this browser.';
    }

    this.handleError(error, 'error', `LocalStorage: ${operation}`, 'Storage Operation', 'StorageService');
  }

  // Show success message
  showSuccess(message: string, context?: string): void {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      message,
      type: 'success',
      timestamp: Date.now(),
      context
    };

    this.errorSubject.next(errorInfo);
    this.addToErrorHistory(errorInfo);
  }

  // Show warning message
  showWarning(message: string, context?: string): void {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      message,
      type: 'warning',
      timestamp: Date.now(),
      context
    };

    this.errorSubject.next(errorInfo);
    this.addToErrorHistory(errorInfo);
  }

  // Show info message
  showInfo(message: string, context?: string): void {
    const errorInfo: ErrorInfo = {
      id: this.generateErrorId(),
      message,
      type: 'info',
      timestamp: Date.now(),
      context
    };

    this.errorSubject.next(errorInfo);
    this.addToErrorHistory(errorInfo);
  }

  // Clear error history
  clearErrorHistory(): void {
    this.errorHistory = [];
    this.errorHistorySubject.next([]);
  }

  // Get recent errors
  getRecentErrors(count: number = 10): ErrorInfo[] {
    return this.errorHistory.slice(-count);
  }

  // Get errors by type
  getErrorsByType(type: ErrorInfo['type']): ErrorInfo[] {
    return this.errorHistory.filter(error => error.type === type);
  }

  // Retry failed operation
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts: number = this.config.retryAttempts,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxAttempts) {
          this.handleError(error as Error, 'error', `Retry failed after ${attempt} attempts`, 'Retry Operation');
          throw error;
        }

        // Wait before retry
        await this.delay(delay * attempt);
        this.showInfo(`Retrying operation... Attempt ${attempt}/${maxAttempts}`, 'Retry Operation');
      }
    }

    throw lastError;
  }

  // Set loading state
  setLoading(isLoading: boolean): void {
    this.isLoadingSubject.next(isLoading);
  }

  // Private methods
  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private extractStatusCode(error: any): number | undefined {
    if (error?.status) return error.status;
    if (error?.statusCode) return error.statusCode;
    return undefined;
  }

  private getClientErrorMessage(status: number): string {
    const statusMessages: Record<number, string> = {
      400: 'Bad request. Please check your input.',
      401: 'Unauthorized. Please log in.',
      403: 'Access denied. You don\'t have permission.',
      404: 'Resource not found.',
      409: 'Conflict. The resource already exists.',
      422: 'Validation error. Please check your input.',
      429: 'Too many requests. Please try again later.'
    };

    return statusMessages[status] || `Request failed with status ${status}.`;
  }

  private getFormErrorMessage(field: string, errors: any): string {
    if (errors.required) return 'This field is required';
    if (errors.email) return 'Invalid email format';
    if (errors.minlength) return `Minimum length is ${errors.minlength.requiredLength}`;
    if (errors.maxlength) return `Maximum length is ${errors.maxlength.requiredLength}`;
    if (errors.pattern) return 'Invalid format';
    if (errors.passwordMismatch) return 'Passwords do not match';
    if (errors.invalidEmail) return 'Invalid email address';
    if (errors.invalidPhone) return 'Invalid phone number';
    if (errors.invalidPrice) return 'Invalid price format';
    return 'Invalid input';
  }

  private logToConsole(errorInfo: ErrorInfo): void {
    const logMethod = errorInfo.type === 'error' ? 'error' : 
                     errorInfo.type === 'warning' ? 'warn' : 'log';
    
    console[logMethod](`[${errorInfo.type.toUpperCase()}] ${errorInfo.message}`, {
      id: errorInfo.id,
      timestamp: new Date(errorInfo.timestamp).toISOString(),
      context: errorInfo.context,
      component: errorInfo.component,
      userAction: errorInfo.userAction,
      stack: errorInfo.stack
    });
  }

  private addToErrorHistory(errorInfo: ErrorInfo): void {
    this.errorHistory.push(errorInfo);
    
    // Limit history size
    if (this.errorHistory.length > this.config.maxErrorHistory) {
      this.errorHistory = this.errorHistory.slice(-this.config.maxErrorHistory);
    }
    
    this.errorHistorySubject.next([...this.errorHistory]);
  }

  private notifyUser(errorInfo: ErrorInfo): void {
    // This would integrate with a notification service
    // For now, we just emit the error for components to handle
    if (errorInfo.type === 'error' || errorInfo.type === 'warning') {
      console.warn('User notification needed:', errorInfo.message);
    }
  }

  private trackError(errorInfo: ErrorInfo): void {
    // This would integrate with analytics service
    // For now, we just log that tracking would happen
    console.log('Error tracked for analytics:', errorInfo.id);
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        event.reason as Error || String(event.reason),
        'error',
        'Unhandled Promise Rejection',
        'Global Error Handler',
        'Window'
      );
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.handleError(
        event.error || event.message,
        'error',
        'Uncaught Error',
        'Global Error Handler',
        'Window'
      );
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
