import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, interval } from 'rxjs';
import { map, filter } from 'rxjs/operators';

export interface PWAInstallPrompt {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface NetworkStatus {
  online: boolean;
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PWAService {
  private installPromptSubject = new BehaviorSubject<PWAInstallPrompt | null>(null);
  private networkStatusSubject = new BehaviorSubject<NetworkStatus>({
    online: navigator.onLine
  });
  
  public installPrompt$ = this.installPromptSubject.asObservable();
  public networkStatus$ = this.networkStatusSubject.asObservable();
  
  public isInstallable = false;
  public isInstalled = false;
  public isStandalone = false;

  constructor() {
    this.initializePWA();
    this.initializeNetworkMonitoring();
    this.checkInstallStatus();
  }

  private initializePWA(): void {
    // Check if running as standalone PWA
    this.isStandalone = this.isStandaloneMode();
    
    // Listen for beforeinstallprompt event
    fromEvent(window, 'beforeinstallprompt')
      .pipe(
        map((event: any) => event as PWAInstallPrompt),
        filter(prompt => prompt !== null)
      )
      .subscribe(prompt => {
        this.installPromptSubject.next(prompt);
        this.isInstallable = true;
      });

    // Listen for appinstalled event
    fromEvent(window, 'appinstalled')
      .subscribe(() => {
        this.isInstalled = true;
        this.isInstallable = false;
        this.installPromptSubject.next(null);
      });
  }

  private initializeNetworkMonitoring(): void {
    // Listen for online/offline events
    fromEvent(window, 'online')
      .subscribe(() => {
        this.updateNetworkStatus(true);
      });

    fromEvent(window, 'offline')
      .subscribe(() => {
        this.updateNetworkStatus(false);
      });

    // Get network information if available
    this.updateNetworkStatus(navigator.onLine);
  }

  private updateNetworkStatus(online: boolean): void {
    const connection = (navigator as any).connection;
    const networkInfo: NetworkStatus = {
      online,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt,
      saveData: connection?.saveData
    };

    this.networkStatusSubject.next(networkInfo);
  }

  private checkInstallStatus(): void {
    // Check if app is already installed
    if (this.isStandaloneMode()) {
      this.isInstalled = true;
      this.isInstallable = false;
    }
  }

  private isStandaloneMode(): boolean {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      ('standalone' in navigator && (navigator as any).standalone) ||
      (window.navigator as any).standalone === true
    );
  }

  // Public methods
  async promptInstall(): Promise<boolean> {
    const prompt = this.installPromptSubject.value;
    if (!prompt) {
      return false;
    }

    try {
      await prompt.prompt();
      const choiceResult = await prompt.userChoice;
      
      if (choiceResult.outcome === 'accepted') {
        this.isInstalled = true;
        this.isInstallable = false;
        this.installPromptSubject.next(null);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error prompting install:', error);
      return false;
    }
  }

  // Network information
  getNetworkStatus(): NetworkStatus {
    return this.networkStatusSubject.value;
  }

  isOnline(): boolean {
    return this.networkStatusSubject.value.online;
  }

  getNetworkQuality(): 'excellent' | 'good' | 'fair' | 'poor' {
    const status = this.getNetworkStatus();
    if (!status.online) return 'poor';
    
    if (!status.effectiveType) return 'good';
    
    switch (status.effectiveType) {
      case '4g':
        return status.downlink && status.downlink >= 10 ? 'excellent' : 'good';
      case '3g':
        return status.downlink && status.downlink >= 1.5 ? 'good' : 'fair';
      case '2g':
        return 'fair';
      case 'slow-2g':
        return 'poor';
      default:
        return 'good';
    }
  }

  // PWA capabilities
  isPWASupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  isInstallPromptAvailable(): boolean {
    return this.installPromptSubject.value !== null;
  }

  // Push notification methods (placeholder for future implementation)
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    const permission = await this.requestNotificationPermission();
    
    if (permission === 'granted') {
      new Notification(title, {
        icon: '/assets/icons/icon-192x192.png',
        badge: '/assets/icons/icon-72x72.png',
        ...options
      });
    }
  }

  // Storage and caching
  async clearCache(): Promise<boolean> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  async getCacheSize(): Promise<number> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        return estimate.usage || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error getting cache size:', error);
      return 0;
    }
  }

  // App information
  getAppVersion(): string {
    return '1.0.0'; // This should be dynamic from package.json
  }

  getDeviceInfo(): any {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      vendor: navigator.vendor
    };
  }
}
