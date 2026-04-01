import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { PreloadAllModules } from '@angular/router';
import { SEOResolver } from './core/resolvers/seo.resolver';

export const routes: Routes = [
  // Auth routes - Separate for Admin and User
  {
    path: 'auth',
    children: [
      // Admin Authentication
      {
        path: 'admin',
        children: [
          {
            path: 'login',
            loadComponent: () => import('./features/admin-auth/login/admin-login.component').then(c => c.AdminLoginComponent),
            resolve: { seo: SEOResolver }
          }
        ],
        resolve: { seo: SEOResolver }
      },
      // User Authentication
      {
        path: 'user',
        children: [
          {
            path: 'login',
            loadComponent: () => import('./features/user-auth/login/user-login.component').then(c => c.UserLoginComponent),
            resolve: { seo: SEOResolver }
          },
          {
            path: 'register',
            loadComponent: () => import('./features/user-auth/register/user-register.component').then(c => c.UserRegisterComponent),
            resolve: { seo: SEOResolver }
          }
        ],
        resolve: { seo: SEOResolver }
      },
      // Forgot Password
      {
        path: 'forgot-password',
        loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(c => c.ForgotPasswordComponent),
        resolve: { seo: SEOResolver }
      },
      // OTP Verification
      {
        path: 'otp-verification',
        loadComponent: () => import('./features/auth/otp-verification/otp-verification.component').then(c => c.OtpVerificationComponent),
        resolve: { seo: SEOResolver }
      },
      // Reset Password
      {
        path: 'reset-password',
        loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(c => c.ResetPasswordComponent),
        resolve: { seo: SEOResolver }
      },
      // Auth Selection
      {
        path: '',
        loadComponent: () => import('./features/auth-selection/auth-selection.component').then(c => c.AuthSelectionComponent),
        resolve: { seo: SEOResolver }
      },
      // Legacy routes (redirect to new structure)
      {
        path: 'login',
        redirectTo: '',
        pathMatch: 'full'
      },
      {
        path: 'register',
        redirectTo: '',
        pathMatch: 'full'
      }
    ],
    resolve: { seo: SEOResolver }
  },
  
  // User routes - with strategic preloading and authentication
  {
    path: '',
    loadComponent: () => import('./features/user/home/home.component').then(c => c.HomeComponent),
    canActivate: [authGuard],
    resolve: { seo: SEOResolver }
  },
  {
    path: 'products',
    loadComponent: () => import('./features/user/product-list/product-list.component').then(c => c.ProductListComponent),
    canActivate: [authGuard],
    data: { preload: true }, // Preload this route
    resolve: { seo: SEOResolver }
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./features/user/product-detail/product-detail.component').then(c => c.ProductDetailComponent),
    canActivate: [authGuard],
    data: { preload: true }, // Preload this route
    resolve: { seo: SEOResolver }
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/user/cart/cart.component').then(c => c.CartComponent),
    canActivate: [authGuard],
    resolve: { seo: SEOResolver }
  },
  {
    path: 'favorites',
    loadComponent: () => import('./features/user/favorites/favorites.component').then(c => c.FavoritesComponent),
    canActivate: [authGuard],
    resolve: { seo: SEOResolver }
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/user/checkout/checkout.component').then(c => c.CheckoutComponent),
    canActivate: [authGuard],
    resolve: { seo: SEOResolver }
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/user/profile/profile.component').then(c => c.ProfileComponent),
    canActivate: [authGuard],
    resolve: { seo: SEOResolver }
  },
  {
    path: 'comparison',
    loadComponent: () => import('./features/user/comparison/comparison.component').then(c => c.ComparisonComponent),
    canActivate: [authGuard],
    resolve: { seo: SEOResolver }
  },
  {
    path: 'recently-viewed',
    loadComponent: () => import('./features/user/recently-viewed/recently-viewed.component').then(c => c.RecentlyViewedComponent),
    canActivate: [authGuard],
    resolve: { seo: SEOResolver }
  },
  {
    path: 'wishlist/shared/:shareId',
    loadComponent: () => import('./features/user/wishlist-shared/wishlist-shared.component').then(c => c.WishlistSharedComponent),
    resolve: { seo: SEOResolver }
  },
  {
    path: 'notification-preferences',
    loadComponent: () => import('./features/user/notification-preferences/notification-preferences.component').then(c => c.NotificationPreferencesComponent),
    canActivate: [authGuard],
    resolve: { seo: SEOResolver }
  },
  
  // Admin routes
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(c => c.DashboardComponent),
    canActivate: [adminGuard],
    data: { preload: false }, // Don't preload admin routes
    resolve: { seo: SEOResolver },
    children: [
      {
        path: 'products',
        loadComponent: () => import('./features/admin/manage-products/manage-products.component').then(c => c.ManageProductsComponent),
        resolve: { seo: SEOResolver }
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/manage-users/manage-users.component').then(c => c.ManageUsersComponent),
        resolve: { seo: SEOResolver }
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/manage-orders/manage-orders.component').then(c => c.ManageOrdersComponent),
        resolve: { seo: SEOResolver }
      }
    ]
  },
  
  // Redirect to home for any other route
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
    resolve: { seo: SEOResolver }
  }
];
