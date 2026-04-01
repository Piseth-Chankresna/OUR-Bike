import { ApplicationConfig, provideBrowserGlobalErrorListeners, ErrorHandler } from '@angular/core';
import { provideRouter, withPreloading } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { routes } from './app.routes';
import { NetworkAwarePreloadingStrategy } from './core/strategies/selective-preloading.strategy';
import { ErrorTrackingService } from './core/services/error-tracking.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withPreloading(NetworkAwarePreloadingStrategy)),
    provideHttpClient(withFetch()),
    // Comment out hydration for development to avoid NG0505 error
    // provideClientHydration(withEventReplay()),
    { provide: ErrorHandler, useClass: ErrorTrackingService }
  ]
};
