import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { ErrorHandlingService } from '../services/error-handling.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private errorHandlingService = inject(ErrorHandlingService);

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unexpected error occurred';
        let context = 'HTTP Request';

        // Handle specific HTTP errors
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Client error: ${error.error.message}`;
          context = 'Client-side HTTP Error';
        } else {
          // Server-side error
          errorMessage = this.getServerErrorMessage(error);
          context = `Server-side HTTP Error (${error.status})`;
        }

        // Log the error
        this.errorHandlingService.handleHttpError(error, context);

        // Return user-friendly error message
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Network connection failed. Please check your internet connection.';
      case 400:
        return error.error?.message || 'Bad request. Please check your input.';
      case 401:
        return 'Unauthorized. Please log in to continue.';
      case 403:
        return 'Access denied. You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'Conflict. The resource already exists.';
      case 422:
        return error.error?.message || 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Internal server error. Please try again later.';
      case 502:
        return 'Service temporarily unavailable. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      case 504:
        return 'Gateway timeout. Please try again later.';
      default:
        return error.error?.message || `Server error: ${error.status}`;
    }
  }
}
