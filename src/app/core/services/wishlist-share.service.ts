import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface WishlistShareData {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  productIds: string[];
  shareUrl: string;
  isPublic: boolean;
  expiresAt?: number;
  createdAt: number;
  updatedAt: number;
  viewCount: number;
  message?: string;
}

export interface ShareSettings {
  allowPublic: boolean;
  requireEmail: boolean;
  expireInDays: number;
  includeMessage: boolean;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class WishlistShareService {
  private readonly STORAGE_KEY = 'our_bikes_wishlist_shares';

  constructor(private storageService: StorageService) {}

  // Create a shareable wishlist
  createShare(userId: string, productIds: string[], settings: ShareSettings): WishlistShareData | null {
    try {
      const users = this.storageService.getUsers() as any[];
      const user = users.find(u => u.id === userId);
      if (!user) {
        return null;
      }

      const shareId = this.generateShareId();
      const now = Date.now();
      const expiresAt = settings.expireInDays > 0 
        ? now + (settings.expireInDays * 24 * 60 * 60 * 1000)
        : undefined;

      const shareData: WishlistShareData = {
        id: shareId,
        userId,
        userName: user.fullName,
        userEmail: user.email,
        productIds,
        shareUrl: `${window.location.origin}/wishlist/shared/${shareId}`,
        isPublic: settings.allowPublic,
        expiresAt,
        createdAt: now,
        updatedAt: now,
        viewCount: 0,
        message: settings.includeMessage ? settings.message : undefined
      };

      // Save to storage
      const shares = this.getAllShares();
      shares[shareId] = shareData;
      this.storageService.set(this.STORAGE_KEY, shares);

      return shareData;
    } catch (error) {
      console.error('Error creating wishlist share:', error);
      return null;
    }
  }

  // Get share by ID
  getShare(shareId: string): WishlistShareData | null {
    try {
      const shares = this.getAllShares();
      const share = shares[shareId];

      if (!share) {
        return null;
      }

      // Check if share has expired
      if (share.expiresAt && Date.now() > share.expiresAt) {
        return null;
      }

      // Increment view count
      share.viewCount++;
      this.storageService.set(this.STORAGE_KEY, shares);

      return share;
    } catch (error) {
      console.error('Error getting share:', error);
      return null;
    }
  }

  // Get all shares
  getAllShares(): Record<string, WishlistShareData> {
    try {
      return this.storageService.get(this.STORAGE_KEY) as Record<string, WishlistShareData> || {};
    } catch (error) {
      console.error('Error getting all shares:', error);
      return {};
    }
  }

  // Get user's shares
  getUserShares(userId: string): WishlistShareData[] {
    try {
      const shares = this.getAllShares();
      return Object.values(shares).filter(share => share.userId === userId);
    } catch (error) {
      console.error('Error getting user shares:', error);
      return [];
    }
  }

  // Update share settings
  updateShare(shareId: string, updates: Partial<WishlistShareData>): boolean {
    try {
      const shares = this.getAllShares();
      const share = shares[shareId];

      if (!share) {
        return false;
      }

      // Update share
      const updatedShare = { ...share, ...updates, updatedAt: Date.now() };
      shares[shareId] = updatedShare;
      this.storageService.set(this.STORAGE_KEY, shares);

      return true;
    } catch (error) {
      console.error('Error updating share:', error);
      return false;
    }
  }

  // Delete share
  deleteShare(shareId: string): boolean {
    try {
      const shares = this.getAllShares();
      
      if (!shares[shareId]) {
        return false;
      }

      delete shares[shareId];
      this.storageService.set(this.STORAGE_KEY, shares);

      return true;
    } catch (error) {
      console.error('Error deleting share:', error);
      return false;
    }
  }

  // Generate share ID
  private generateShareId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Get share products with full details
  getShareProducts(shareId: string): any[] {
    try {
      const share = this.getShare(shareId);
      if (!share) {
        return [];
      }

      const allProducts = this.storageService.getProducts() as any[] || [];
      return share.productIds
        .map(id => allProducts.find(p => p.id === id))
        .filter(product => product !== undefined);
    } catch (error) {
      console.error('Error getting share products:', error);
      return [];
    }
  }

  // Check if share is valid
  isShareValid(shareId: string): boolean {
    try {
      const share = this.getShare(shareId);
      return share !== null;
    } catch (error) {
      console.error('Error checking share validity:', error);
      return false;
    }
  }

  // Get share statistics
  getShareStats(userId: string): {
    totalShares: number;
    totalViews: number;
    activeShares: number;
    expiredShares: number;
  } {
    try {
      const userShares = this.getUserShares(userId);
      const now = Date.now();
      
      const activeShares = userShares.filter(share => 
        !share.expiresAt || share.expiresAt > now
      );
      
      const expiredShares = userShares.filter(share => 
        share.expiresAt && share.expiresAt <= now
      );

      const totalViews = userShares.reduce((sum, share) => sum + share.viewCount, 0);

      return {
        totalShares: userShares.length,
        totalViews,
        activeShares: activeShares.length,
        expiredShares: expiredShares.length
      };
    } catch (error) {
      console.error('Error getting share stats:', error);
      return {
        totalShares: 0,
        totalViews: 0,
        activeShares: 0,
        expiredShares: 0
      };
    }
  }

  // Cleanup expired shares
  cleanupExpiredShares(): number {
    try {
      const shares = this.getAllShares();
      const now = Date.now();
      let deletedCount = 0;

      for (const [shareId, share] of Object.entries(shares)) {
        if (share.expiresAt && share.expiresAt <= now) {
          delete shares[shareId];
          deletedCount++;
        }
      }

      if (deletedCount > 0) {
        this.storageService.set(this.STORAGE_KEY, shares);
      }

      return deletedCount;
    } catch (error) {
      console.error('Error cleaning up expired shares:', error);
      return 0;
    }
  }
}
