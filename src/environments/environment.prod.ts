export const environment = {
  production: true,
  apiUrl: 'https://api.ourbikes-store.com',
  cdnUrl: 'https://cdn.ourbikes-store.com',
  analytics: {
    googleAnalyticsId: 'GA-XXXXXXXXX',
    enableTracking: true
  },
  features: {
    enableAnalytics: true,
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    enablePWA: true,
    enableServiceWorker: true
  },
  cache: {
    version: '1.0.0',
    maxAge: 3600, // 1 hour
    enableCaching: true
  },
  security: {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
    enableFrameProtection: true
  },
  performance: {
    enableBundleAnalysis: false,
    enableServiceWorker: true,
    enablePreloading: true
  },
  seo: {
    defaultTitle: 'OUR-Bikes Store - Professional Motorcycle E-Commerce',
    defaultDescription: 'Professional motorcycle e-commerce platform with advanced features',
    siteUrl: 'https://ourbikes-store.com',
    siteName: 'OUR-Bikes Store',
    ogImage: '/assets/images/og-image.jpg'
  },
  deployment: {
    environment: 'production',
    buildTime: new Date().toISOString(),
    version: '1.0.0'
  }
};
