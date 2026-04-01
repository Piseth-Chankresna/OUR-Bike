module.exports = {
  // Lighthouse performance testing configuration
  lighthouse: {
    // Performance budgets
    budgets: [
      {
        type: 'performance',
        name: 'Performance Budget',
        maxNumericValue: 85,
        warningNumericValue: 90
      },
      {
        type: 'accessibility',
        name: 'Accessibility Score',
        maxNumericValue: 90,
        warningNumericValue: 95
      },
      {
        type: 'best-practices',
        name: 'Best Practices',
        maxNumericValue: 85,
        warningNumericValue: 90
      },
      {
        type: 'seo',
        name: 'SEO Score',
        maxNumericValue: 85,
        warningNumericValue: 90
      }
    ],
    
    // Custom thresholds
    thresholds: {
      performance: 85,
      accessibility: 90,
      'best-practices': 85,
      seo: 85,
      pwa: 80
    },
    
    // Audits to ignore
    skipAudits: [
      'uses-http2',
      'uses-text-compression',
      'uses-responsive-images'
    ]
  },
  
  // Bundle analysis configuration
  bundleAnalyzer: {
    analyzerMode: 'static',
    openAnalyzer: false,
    generateStatsFile: true,
    statsFilename: 'bundle-stats.json',
    excludeAssets: /\/node_modules\//
  },
  
  // Load testing configuration
  loadTesting: {
    scenarios: [
      {
        name: 'Home Page Load',
        url: 'http://localhost:4200',
        concurrentUsers: 10,
        duration: 30,
        rampUpTime: 5
      },
      {
        name: 'Products Page Load',
        url: 'http://localhost:4200/products',
        concurrentUsers: 15,
        duration: 30,
        rampUpTime: 5
      },
      {
        name: 'Product Detail Load',
        url: 'http://localhost:4200/product/1',
        concurrentUsers: 20,
        duration: 30,
        rampUpTime: 5
      }
    ],
    thresholds: {
      responseTime: 2000, // 2 seconds
      errorRate: 0.01, // 1%
      throughput: 10 // requests per second
    }
  },
  
  // Memory testing configuration
  memoryTesting: {
    maxHeapSize: 50 * 1024 * 1024, // 50MB
    maxJSHeapSize: 30 * 1024 * 1024, // 30MB
    leakThreshold: 5 // MB
  },
  
  // Network testing configuration
  networkTesting: {
    slow3G: {
      'offline': false,
      'downloadThroughput': 50 * 1024 / 8,
      'uploadThroughput': 20 * 1024 / 8,
      'latency': 400
    },
    regular3G: {
      'offline': false,
      'downloadThroughput': 750 * 1024 / 8,
      'uploadThroughput': 250 * 1024 / 8,
      'latency': 100
    },
    broadband: {
      'offline': false,
      'downloadThroughput': 2 * 1024 * 1024 / 8,
      'uploadThroughput': 750 * 1024 / 8,
      'latency': 20
    }
  }
};
