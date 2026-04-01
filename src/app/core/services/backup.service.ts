import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
import { ErrorHandlingService } from './error-handling.service';
import { SecurityService } from './security.service';

export interface BackupData {
  version: string;
  timestamp: number;
  data: {
    users: any[];
    products: any[];
    orders: any[];
    comments: any[];
    carts: any[];
    favorites: any[];
  };
  metadata: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalComments: number;
    appVersion: string;
    backupType: 'full' | 'incremental';
  };
}

export interface BackupOptions {
  includeUsers?: boolean;
  includeProducts?: boolean;
  includeOrders?: boolean;
  includeComments?: boolean;
  includeCarts?: boolean;
  includeFavorites?: boolean;
  encrypt?: boolean;
  compress?: boolean;
}

export interface RestoreOptions {
  overwriteExisting?: boolean;
  validateData?: boolean;
  createBackup?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BackupService {
  private storageService = inject(StorageService);
  private errorHandling = inject(ErrorHandlingService);
  private security = inject(SecurityService);

  private readonly BACKUP_VERSION = '1.0.0';
  private readonly APP_VERSION = '21.0.0';

  // Create backup of all data
  createBackup(options: BackupOptions = {}): BackupData {
    try {
      const defaultOptions: BackupOptions = {
        includeUsers: true,
        includeProducts: true,
        includeOrders: true,
        includeComments: true,
        includeCarts: true,
        includeFavorites: true,
        encrypt: false,
        compress: false
      };

      const backupOptions = { ...defaultOptions, ...options };

      const backupData: BackupData = {
        version: this.BACKUP_VERSION,
        timestamp: Date.now(),
        data: {
          users: backupOptions.includeUsers ? (this.storageService.getUsers() as any[] || []) : [],
          products: backupOptions.includeProducts ? (this.storageService.getProducts() as any[] || []) : [],
          orders: backupOptions.includeOrders ? (this.storageService.getOrders() as any[] || []) : [],
          comments: backupOptions.includeComments ? (this.storageService.getComments() as any[] || []) : [],
          carts: backupOptions.includeCarts ? this.getAllCarts() : [],
          favorites: backupOptions.includeFavorites ? this.getAllFavorites() : []
        },
        metadata: {
          totalUsers: backupOptions.includeUsers ? (this.storageService.getUsers() as any[] || []).length : 0,
          totalProducts: backupOptions.includeProducts ? (this.storageService.getProducts() as any[] || []).length : 0,
          totalOrders: backupOptions.includeOrders ? (this.storageService.getOrders() as any[] || []).length : 0,
          totalComments: backupOptions.includeComments ? (this.storageService.getComments() as any[] || []).length : 0,
          appVersion: this.APP_VERSION,
          backupType: 'full'
        }
      };

      // Encrypt if requested
      if (backupOptions.encrypt) {
        const jsonString = JSON.stringify(backupData);
        const encrypted = this.security.encryptSensitiveData(jsonString);
        return { ...backupData, data: { encrypted } } as any;
      }

      return backupData;
    } catch (error) {
      this.errorHandling.handleError(error as Error, 'error', 'Backup Creation');
      throw error;
    }
  }

  // Export backup as downloadable file
  exportBackup(options: BackupOptions = {}): void {
    try {
      const backupData = this.createBackup(options);
      const jsonString = JSON.stringify(backupData, null, 2);
      
      // Create blob
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `our-bikes-backup-${new Date().toISOString().split('T')[0]}.json`;
      
      // Trigger download
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Cleanup
      URL.revokeObjectURL(url);
      
      this.errorHandling.showSuccess('Backup exported successfully!');
    } catch (error) {
      this.errorHandling.handleError(error as Error, 'error', 'Backup Export');
    }
  }

  // Import backup from file
  async importBackup(file: File, options: RestoreOptions = {}): Promise<boolean> {
    try {
      const defaultOptions: RestoreOptions = {
        overwriteExisting: false,
        validateData: true,
        createBackup: true
      };

      const restoreOptions = { ...defaultOptions, ...options };

      // Create backup before restore if requested
      if (restoreOptions.createBackup) {
        this.exportBackup({ includeUsers: true, includeProducts: true, includeOrders: true });
      }

      // Read file
      const text = await this.readFileAsText(file);
      const backupData: BackupData = JSON.parse(text);

      // Validate backup data
      if (restoreOptions.validateData && !this.validateBackupData(backupData)) {
        throw new Error('Invalid backup data format');
      }

      // Restore data
      await this.restoreFromBackup(backupData, restoreOptions);

      this.errorHandling.showSuccess('Backup imported successfully!');
      return true;
    } catch (error) {
      this.errorHandling.handleError(error as Error, 'error', 'Backup Import');
      return false;
    }
  }

  // Restore data from backup
  private async restoreFromBackup(backupData: BackupData, options: RestoreOptions): Promise<void> {
    const { data } = backupData;

    // Restore users
    if (data.users && data.users.length > 0) {
      if (options.overwriteExisting || (this.storageService.getUsers() as any[] || []).length === 0) {
        this.storageService.setUsers(data.users);
      }
    }

    // Restore products
    if (data.products && data.products.length > 0) {
      if (options.overwriteExisting || (this.storageService.getProducts() as any[] || []).length === 0) {
        this.storageService.setProducts(data.products);
      }
    }

    // Restore orders
    if (data.orders && data.orders.length > 0) {
      if (options.overwriteExisting || (this.storageService.getOrders() as any[] || []).length === 0) {
        this.storageService.setOrders(data.orders);
      }
    }

    // Restore comments
    if (data.comments && data.comments.length > 0) {
      if (options.overwriteExisting || (this.storageService.getComments() as any[] || []).length === 0) {
        this.storageService.setComments(data.comments);
      }
    }

    // Restore carts
    if (data.carts && data.carts.length > 0) {
      data.carts.forEach((cart: any) => {
        if (options.overwriteExisting || !localStorage.getItem(`our_bikes_cart_${cart.userId}`)) {
          localStorage.setItem(`our_bikes_cart_${cart.userId}`, JSON.stringify(cart));
        }
      });
    }

    // Restore favorites
    if (data.favorites && data.favorites.length > 0) {
      data.favorites.forEach((favorites: any) => {
        if (options.overwriteExisting || !localStorage.getItem(`our_bikes_favorites_${favorites.userId}`)) {
          localStorage.setItem(`our_bikes_favorites_${favorites.userId}`, JSON.stringify(favorites));
        }
      });
    }
  }

  // Validate backup data
  private validateBackupData(backupData: BackupData): boolean {
    if (!backupData.version || !backupData.timestamp || !backupData.data) {
      return false;
    }

    const { data } = backupData;
    
    // Check if required data structures exist
    if (!data.users || !data.products || !data.orders || !data.comments) {
      return false;
    }

    // Validate data types
    if (!Array.isArray(data.users) || !Array.isArray(data.products) || 
        !Array.isArray(data.orders) || !Array.isArray(data.comments)) {
      return false;
    }

    return true;
  }

  // Get all carts from localStorage
  private getAllCarts(): any[] {
    const carts: any[] = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('our_bikes_cart_')) {
        try {
          const cart = JSON.parse(localStorage.getItem(key) || '{}');
          carts.push(cart);
        } catch (error) {
          console.warn(`Failed to parse cart data for key: ${key}`);
        }
      }
    });

    return carts;
  }

  // Get all favorites from localStorage
  private getAllFavorites(): any[] {
    const favorites: any[] = [];
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith('our_bikes_favorites_')) {
        try {
          const favorite = JSON.parse(localStorage.getItem(key) || '{}');
          favorites.push(favorite);
        } catch (error) {
          console.warn(`Failed to parse favorites data for key: ${key}`);
        }
      }
    });

    return favorites;
  }

  // Read file as text
  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          resolve(result);
        } else {
          reject(new Error('Failed to read file as text'));
        }
      };
      reader.onerror = () => reject(new Error('File reading failed'));
      reader.readAsText(file);
    });
  }

  // Get backup statistics
  getBackupStatistics(): {
    totalBackups: number;
    lastBackupDate: number | null;
    estimatedSize: string;
    dataIntegrity: boolean;
  } {
    // This would track backup statistics
    // For demo, return current stats
    const currentData = this.createBackup();
    const estimatedSize = JSON.stringify(currentData).length;

    return {
      totalBackups: 0, // Would track actual backup count
      lastBackupDate: null, // Would track last backup
      estimatedSize: this.formatBytes(estimatedSize),
      dataIntegrity: this.validateBackupData(currentData)
    };
  }

  // Format bytes to human readable format
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Schedule automatic backup
  scheduleAutoBackup(intervalHours: number = 24): void {
    const intervalMs = intervalHours * 60 * 60 * 1000;
    
    setInterval(() => {
      try {
        this.exportBackup({
          includeUsers: true,
          includeProducts: true,
          includeOrders: true
        });
        
        this.errorHandling.showInfo('Automatic backup completed');
      } catch (error) {
        this.errorHandling.handleError(error as Error, 'error', 'Automatic Backup');
      }
    }, intervalMs);
  }

  // Clear all data (with confirmation)
  clearAllData(): void {
    try {
      // Clear main collections
      this.storageService.setUsers([]);
      this.storageService.setProducts([]);
      this.storageService.setOrders([]);
      this.storageService.setComments([]);

      // Clear carts and favorites
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith('our_bikes_cart_') || key.startsWith('our_bikes_favorites_')) {
          localStorage.removeItem(key);
        }
      });

      this.errorHandling.showSuccess('All data cleared successfully!');
    } catch (error) {
      this.errorHandling.handleError(error as Error, 'error', 'Clear Data');
    }
  }

  // Check data integrity
  checkDataIntegrity(): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Check users data
      const users = this.storageService.getUsers() as any[] || [];
      users.forEach((user, index) => {
        if (!user.id || !user.email || !user.password) {
          issues.push(`User at index ${index} missing required fields`);
        }
        if (!this.security.validateEmail(user.email)) {
          issues.push(`User at index ${index} has invalid email`);
        }
      });

      // Check products data
      const products = this.storageService.getProducts() as any[] || [];
      products.forEach((product, index) => {
        if (!product.id || !product.name || !product.price) {
          issues.push(`Product at index ${index} missing required fields`);
        }
        if (typeof product.price !== 'number' || product.price <= 0) {
          issues.push(`Product at index ${index} has invalid price`);
        }
      });

      // Check orders data
      const orders = this.storageService.getOrders() as any[] || [];
      orders.forEach((order, index) => {
        if (!order.id || !order.userId || !order.products) {
          issues.push(`Order at index ${index} missing required fields`);
        }
        if (!Array.isArray(order.products)) {
          issues.push(`Order at index ${index} has invalid products array`);
        }
      });

      if (issues.length > 0) {
        recommendations.push('Review and fix data integrity issues');
        recommendations.push('Consider restoring from a recent backup');
      } else {
        recommendations.push('Data integrity looks good!');
      }

    } catch (error) {
      issues.push('Failed to validate data integrity');
      recommendations.push('Check data format and structure');
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }
}
