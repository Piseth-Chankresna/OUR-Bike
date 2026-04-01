import { inject } from '@angular/core';
import { ResolveFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SEOService } from '../services/seo.service';
import { StorageService } from '../services/storage.service';

export const SEOResolver: ResolveFn<void> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  seoService = inject(SEOService),
  storageService = inject(StorageService)
) => {
  const url = state.url;
  
  // Handle different routes
  if (url === '/' || url === '') {
    // Homepage
    seoService.setHomepageSEO();
  } else if (url.startsWith('/products')) {
    // Products page or category
    const category = route.queryParamMap.get('category');
    if (category) {
      const products = storageService.getProducts() as any[];
      const filteredProducts = products.filter((p: any) => p.category === category);
      seoService.setCategorySEO(category, filteredProducts);
    } else {
      seoService.setSEO({
        title: 'Products - Browse Our Collection | OUR-Bikes Store',
        description: 'Browse our extensive collection of motorcycles, accessories, and gear. Find the perfect motorcycle for your needs.',
        keywords: 'motorcycles, motorcycle accessories, bike gear, motorcycle collection',
        url: '/products',
        type: 'website'
      });
    }
  } else if (url.startsWith('/product/')) {
    // Product detail page
    const productId = route.paramMap.get('id');
    if (productId) {
      const products = storageService.getProducts() as any[];
      const product = products.find((p: any) => p.id === productId);
      if (product) {
        seoService.setProductSEO(product);
      }
    }
  } else if (url.startsWith('/cart')) {
    seoService.setSEO({
      title: 'Shopping Cart | OUR-Bikes Store',
      description: 'Review your shopping cart and complete your purchase. Secure checkout with multiple payment options.',
      keywords: 'shopping cart, cart, purchase, checkout',
      url: '/cart',
      type: 'website',
      noIndex: true
    });
  } else if (url.startsWith('/checkout')) {
    seoService.setCheckoutSEO();
  } else if (url.startsWith('/favorites')) {
    seoService.setSEO({
      title: 'My Favorites | OUR-Bikes Store',
      description: 'View your favorite motorcycles and accessories. Save items for later and manage your wishlist.',
      keywords: 'favorites, wishlist, saved items',
      url: '/favorites',
      type: 'website',
      noIndex: true
    });
  } else if (url.startsWith('/profile')) {
    seoService.setSEO({
      title: 'My Profile | OUR-Bikes Store',
      description: 'Manage your account, view order history, and update your personal information.',
      keywords: 'profile, account, user settings',
      url: '/profile',
      type: 'website',
      noIndex: true
    });
  } else if (url.startsWith('/auth')) {
    seoService.setSEO({
      title: 'Login & Register | OUR-Bikes Store',
      description: 'Sign in to your account or create a new account to start shopping.',
      keywords: 'login, register, sign in, create account',
      url: '/auth',
      type: 'website',
      noIndex: true
    });
  } else if (url.startsWith('/admin')) {
    seoService.setSEO({
      title: 'Admin Dashboard | OUR-Bikes Store',
      description: 'Admin dashboard for managing products, users, and orders.',
      keywords: 'admin, dashboard, management',
      url: '/admin',
      type: 'website',
      noIndex: true,
      noFollow: true
    });
  } else {
    // Default SEO for other pages
    seoService.setSEO({
      title: 'Page Not Found | OUR-Bikes Store',
      description: 'The page you are looking for could not be found.',
      keywords: '404, not found, error',
      url: url,
      type: 'website',
      noIndex: true
    });
  }
};
