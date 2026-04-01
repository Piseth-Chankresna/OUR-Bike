import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { StorageService } from '../../../core/services/storage.service';
import { AuthService } from '../../../core/services/auth.service';
import { ComparisonService } from '../../../core/services/comparison.service';

@Component({
  selector: 'app-comparison',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './comparison.component.html',
  styleUrls: ['./comparison.component.scss']
})
export class ComparisonComponent implements OnInit, OnDestroy {
  comparisonProducts: any[] = [];
  isLoading = true;
  currentUser: any = null;
  
  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private comparisonService: ComparisonService
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private initializeComponent(): void {
    // Check authentication
    this.currentUser = this.authService.getCurrentUserValue();
    
    if (!this.currentUser) {
      window.location.href = '/auth/login';
      return;
    }

    // Load comparison products
    this.loadComparisonProducts();
  }

  private loadComparisonProducts(): void {
    try {
      this.comparisonProducts = this.comparisonService.getComparisonProducts(this.currentUser.userId);
    } catch (error) {
      console.error('Error loading comparison products:', error);
    } finally {
      this.isLoading = false;
    }
  }

  removeFromComparison(productId: string): void {
    try {
      this.comparisonService.removeFromComparison(this.currentUser.userId, productId);
      this.loadComparisonProducts();
    } catch (error) {
      console.error('Error removing from comparison:', error);
    }
  }

  clearComparison(): void {
    if (confirm('Are you sure you want to clear all products from comparison?')) {
      try {
        this.comparisonService.clearComparison(this.currentUser.userId);
        this.loadComparisonProducts();
      } catch (error) {
        console.error('Error clearing comparison:', error);
      }
    }
  }

  goToProduct(productId: string): void {
    window.location.href = `/products/${productId}`;
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  getSpecValue(product: any, specName: string): string {
    if (!product.specifications) return 'N/A';
    
    const spec = product.specifications.find((s: any) => s.name === specName);
    return spec ? spec.value : 'N/A';
  }

  getCommonSpecs(): string[] {
    if (this.comparisonProducts.length === 0) return [];
    
    // Get all unique spec names from all products
    const allSpecs = new Set<string>();
    this.comparisonProducts.forEach(product => {
      if (product.specifications) {
        product.specifications.forEach((spec: any) => {
          allSpecs.add(spec.name);
        });
      }
    });
    
    // Return common specs that most products have
    const commonSpecs = ['Brand', 'Model', 'Year', 'Engine', 'Weight', 'Price'];
    return commonSpecs.filter(spec => Array.from(allSpecs).includes(spec));
  }

  getBestValue(specName: string): string {
    if (this.comparisonProducts.length === 0) return '';
    
    const values = this.comparisonProducts.map(product => {
      const value = this.getSpecValue(product, specName);
      // For numeric values, parse as number
      const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
      return isNaN(numValue) ? value : numValue;
    });
    
    // Find the best value (highest for most specs, lowest for price/weight)
    const isLowerBetter = specName.toLowerCase().includes('price') || 
                        specName.toLowerCase().includes('weight');
    
    let bestIndex = 0;
    if (typeof values[0] === 'number') {
      bestIndex = isLowerBetter ? 
        values.indexOf(Math.min(...values as number[])) :
        values.indexOf(Math.max(...values as number[]));
    }
    
    return this.comparisonProducts[bestIndex]?.id || '';
  }
}
