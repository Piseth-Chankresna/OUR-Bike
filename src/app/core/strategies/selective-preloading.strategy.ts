import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SelectivePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Check if route has preload data
    if (route.data && route.data['preload']) {
      // Delay preloading to avoid blocking initial render
      return timer(2000).pipe(
        mergeMap(() => load())
      );
    }
    
    return of(null);
  }
}

@Injectable({
  providedIn: 'root'
})
export class NetworkAwarePreloadingStrategy implements PreloadingStrategy {
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Check network conditions
    const connection = (navigator as any).connection;
    
    // Don't preload on slow connections or save-data mode
    if (connection && (connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g')) {
      return of(null);
    }
    
    // Check if route has preload data
    if (route.data && route.data['preload']) {
      // Delay preloading based on network speed
      const delay = this.getPreloadDelay(connection);
      return timer(delay).pipe(
        mergeMap(() => load())
      );
    }
    
    return of(null);
  }
  
  private getPreloadDelay(connection: any): number {
    if (!connection) return 2000;
    
    switch (connection.effectiveType) {
      case '4g':
        return 1000;
      case '3g':
        return 2000;
      case '2g':
        return 4000;
      case 'slow-2g':
        return 6000;
      default:
        return 2000;
    }
  }
}
