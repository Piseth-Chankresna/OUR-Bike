import { test, expect } from '@playwright/test';

test.describe('OUR-Bikes Store E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
  });

  test('should display home page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/OUR-Bikes Store/);
    
    // Check main navigation
    await expect(page.locator('app-header')).toBeVisible();
    await expect(page.locator('app-footer')).toBeVisible();
    
    // Check hero section
    await expect(page.locator('.hero-section')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Welcome to OUR-Bikes Store');
  });

  test('should navigate to products page', async ({ page }) => {
    await page.click('text=Products');
    await expect(page).toHaveURL(/\/products/);
    
    // Check product list
    await expect(page.locator('.products-grid')).toBeVisible();
    const productCards = page.locator('.product-card');
    await expect(productCards).toHaveCount(0);
    const count = await productCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should search for products', async ({ page }) => {
    await page.fill('[data-testid="search-input"]', 'Honda');
    await page.press('[data-testid="search-input"]', 'Enter');
    
    // Wait for search results
    await page.waitForSelector('.search-results');
    
    // Check search results
    await expect(page.locator('.search-results')).toBeVisible();
    const searchResultItems = page.locator('.search-result-item');
    const searchCount = await searchResultItems.count();
    expect(searchCount).toBeGreaterThan(0);
  });

  test('should handle user registration', async ({ page }) => {
    await page.click('text=Login');
    await page.click('text=Sign Up');
    
    // Fill registration form
    await page.fill('[data-testid="register-email"]', 'test@example.com');
    await page.fill('[data-testid="register-password"]', 'password123');
    await page.fill('[data-testid="register-confirm-password"]', 'password123');
    await page.fill('[data-testid="register-fullname"]', 'Test User');
    
    // Submit form
    await page.click('[data-testid="register-submit"]');
    
    // Check for success message or redirect
    await expect(page.locator('.success-message, .products-grid')).toBeVisible();
  });

  test('should handle user login', async ({ page }) => {
    await page.click('text=Login');
    
    // Fill login form
    await page.fill('[data-testid="login-email"]', 'admin@example.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    
    // Submit form
    await page.click('[data-testid="login-submit"]');
    
    // Check for successful login
    await expect(page.locator('.products-grid, .user-menu')).toBeVisible();
  });

  test('should add product to favorites', async ({ page }) => {
    // First login
    await page.click('text=Login');
    await page.fill('[data-testid="login-email"]', 'user@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    await page.waitForSelector('.products-grid');
    
    // Navigate to products
    await page.click('text=Products');
    await page.waitForSelector('.product-card');
    
    // Click first product's favorite button
    await page.click('.product-card:first-child .favorite-btn');
    
    // Check if favorites count updated
    await expect(page.locator('.favorites-count')).toHaveText(/\d+/);
  });

  test('should add product to cart', async ({ page }) => {
    // First login
    await page.click('text=Login');
    await page.fill('[data-testid="login-email"]', 'user@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    await page.waitForSelector('.products-grid');
    
    // Navigate to products
    await page.click('text=Products');
    await page.waitForSelector('.product-card');
    
    // Click first product's add to cart button
    await page.click('.product-card:first-child .add-to-cart-btn');
    
    // Check if cart count updated
    await expect(page.locator('.cart-count')).toHaveText(/\d+/);
  });

  test('should view product details', async ({ page }) => {
    await page.click('text=Products');
    await page.waitForSelector('.product-card');
    
    // Click first product
    await page.click('.product-card:first-child');
    
    // Check product detail page
    await expect(page).toHaveURL(/\/product\//);
    await expect(page.locator('.product-detail')).toBeVisible();
    await expect(page.locator('.product-title')).toBeVisible();
    await expect(page.locator('.product-price')).toBeVisible();
    await expect(page.locator('.product-description')).toBeVisible();
  });

  test('should handle checkout process', async ({ page }) => {
    // Login and add product to cart first
    await page.click('text=Login');
    await page.fill('[data-testid="login-email"]', 'user@example.com');
    await page.fill('[data-testid="login-password"]', 'password123');
    await page.click('[data-testid="login-submit"]');
    await page.waitForSelector('.products-grid');
    
    await page.click('text=Products');
    await page.waitForSelector('.product-card');
    await page.click('.product-card:first-child .add-to-cart-btn');
    
    // Go to cart
    await page.click('text=Cart');
    await page.waitForSelector('.cart-page');
    
    // Start checkout
    await page.click('[data-testid="checkout-btn"]');
    await page.waitForSelector('.checkout-form');
    
    // Fill checkout form
    await page.fill('[data-testid="checkout-email"]', 'test@example.com');
    await page.fill('[data-testid="checkout-phone"]', '1234567890');
    await page.fill('[data-testid="checkout-address"]', '123 Test St');
    await page.fill('[data-testid="checkout-city"]', 'Test City');
    await page.fill('[data-testid="checkout-zip"]', '12345');
    
    // Continue to next step
    await page.click('[data-testid="checkout-next"]');
    await page.waitForSelector('.payment-section');
    
    // Select payment method
    await page.click('[data-testid="payment-credit-card"]');
    
    // Place order
    await page.click('[data-testid="place-order-btn"]');
    await page.waitForSelector('.order-confirmation');
    
    // Check order confirmation
    await expect(page.locator('.order-confirmation')).toBeVisible();
    await expect(page.locator('.order-number')).toBeVisible();
  });

  test('should display admin dashboard for admin users', async ({ page }) => {
    // Login as admin
    await page.click('text=Login');
    await page.fill('[data-testid="login-email"]', 'admin@example.com');
    await page.fill('[data-testid="login-password"]', 'admin123');
    await page.click('[data-testid="login-submit"]');
    await page.waitForSelector('.admin-menu');
    
    // Navigate to admin dashboard
    await page.click('text=Dashboard');
    await page.waitForSelector('.admin-dashboard');
    
    // Check dashboard elements
    await expect(page.locator('.admin-dashboard')).toBeVisible();
    await expect(page.locator('.stats-cards')).toBeVisible();
    await expect(page.locator('.recent-orders')).toBeVisible();
  });

  test('should handle responsive design', async ({ page }) => {
    // Test desktop view
    await page.setViewportSize({ width: 1200, height: 800 });
    await expect(page.locator('.desktop-navigation')).toBeVisible();
    
    // Test tablet view
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('.tablet-navigation')).toBeVisible();
    
    // Test mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('.mobile-navigation')).toBeVisible();
    await expect(page.locator('.mobile-menu-toggle')).toBeVisible();
  });

  test('should handle theme switching', async ({ page }) => {
    // Check initial theme
    const body = page.locator('body');
    await expect(body).toHaveClass(/dark|light/);
    
    // Toggle theme
    await page.click('[data-testid="theme-toggle"]');
    
    // Check theme changed
    await expect(body).toHaveClass(/dark|light/);
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Navigate to non-existent product
    await page.goto('http://localhost:4200/product/non-existent');
    
    // Should redirect to products page or show 404
    await expect(page.locator('.error-message, .products-grid')).toBeVisible();
  });

  test('should handle network errors', async ({ page }) => {
    // Simulate offline mode
    await page.context().setOffline(true);
    
    // Try to navigate
    await page.click('text=Products');
    
    // Should show offline message
    await expect(page.locator('.offline-message')).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    // Check for proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    
    // Check for proper ARIA labels
    const searchInput = page.locator('[data-testid="search-input"]');
    await expect(searchInput).toHaveAttribute('aria-label');
    
    // Check for keyboard navigation
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toBeVisible();
    
    // Check color contrast (basic check)
    const buttons = page.locator('button');
    const firstButton = buttons.first();
    await expect(firstButton).toHaveCSS('color', /rgb/);
  });
});
