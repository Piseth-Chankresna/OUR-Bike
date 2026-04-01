module.exports = {
  // Environment configurations
  environments: {
    development: {
      apiUrl: 'http://localhost:3000',
      cdnUrl: 'http://localhost:4200',
      enableAnalytics: false,
      enableErrorTracking: false,
      enablePerformanceMonitoring: true,
      enablePWA: false,
      enableServiceWorker: false,
      logLevel: 'debug'
    },
    staging: {
      apiUrl: 'https://api-staging.ourbikes-store.com',
      cdnUrl: 'https://cdn-staging.ourbikes-store.com',
      enableAnalytics: true,
      enableErrorTracking: true,
      enablePerformanceMonitoring: true,
      enablePWA: true,
      enableServiceWorker: true,
      logLevel: 'info'
    },
    production: {
      apiUrl: 'https://api.ourbikes-store.com',
      cdnUrl: 'https://cdn.ourbikes-store.com',
      enableAnalytics: true,
      enableErrorTracking: true,
      enablePerformanceMonitoring: true,
      enablePWA: true,
      enableServiceWorker: true,
      logLevel: 'error'
    }
  },

  // Deployment targets
  targets: {
    local: {
      type: 'file',
      path: './dist',
      command: 'npm run serve:ssr'
    },
    docker: {
      type: 'container',
      image: 'ourbikes-store:latest',
      port: 80,
      command: 'docker-compose up -d'
    },
    vercel: {
      type: 'platform',
      command: 'vercel --prod',
      env: {
        VERCEL_ORG_ID: process.env.VERCEL_ORG_ID,
        VERCEL_PROJECT_ID: process.env.VERCEL_PROJECT_ID
      }
    },
    netlify: {
      type: 'platform',
      command: 'netlify deploy --prod --dir=dist/our-bikes-store',
      env: {
        NETLIFY_AUTH_TOKEN: process.env.NETLIFY_AUTH_TOKEN,
        NETLIFY_SITE_ID: process.env.NETLIFY_SITE_ID
      }
    },
    aws: {
      type: 'cloud',
      command: 'aws s3 sync dist/our-bikes-store s3://ourbikes-store --delete',
      distribution: 'E1234567890ABC',
      env: {
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        AWS_DEFAULT_REGION: 'us-east-1'
      }
    }
  },

  // Build configurations
  builds: {
    development: {
      configuration: 'development',
      sourceMap: true,
      optimization: false,
      extractLicenses: false
    },
    staging: {
      configuration: 'staging',
      sourceMap: true,
      optimization: true,
      extractLicenses: true,
      budgets: [
        {
          type: 'initial',
          maximumWarning: '1MB',
          maximumError: '2MB'
        }
      ]
    },
    production: {
      configuration: 'production',
      sourceMap: false,
      optimization: true,
      extractLicenses: true,
      budgets: [
        {
          type: 'initial',
          maximumWarning: '500KB',
          maximumError: '1MB'
        },
        {
          type: 'anyComponentStyle',
          maximumWarning: '30KB',
          maximumError: '50KB'
        }
      ],
      outputHashing: 'all',
      namedChunks: false,
      extractI18n: false,
      buildOptimizer: true,
      vendorChunk: false
    }
  },

  // Performance monitoring
  performance: {
    budgets: {
      js: 250, // KB
      css: 100, // KB
      images: 500, // KB
      total: 1000 // KB
    },
    lighthouse: {
      performance: 90,
      accessibility: 95,
      bestPractices: 90,
      seo: 95
    }
  },

  // Security configurations
  security: {
    headers: {
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; media-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';"
    },
    https: true,
    hsts: true,
    certificateCheck: true
  },

  // Monitoring and analytics
  monitoring: {
    analytics: {
      googleAnalyticsId: 'GA-XXXXXXXXX',
      enableTracking: true,
      trackPageViews: true,
      trackEvents: true,
      trackUserTiming: true
    },
    errorTracking: {
      enableSentry: true,
      sentryDsn: process.env.SENTRY_DSN,
      enableConsoleLogging: true,
      enableUserTracking: true
    },
    performance: {
      enableWebVitals: true,
      enableResourceTiming: true,
      enableUserTiming: true,
      sampleRate: 0.1
    }
  },

  // Deployment hooks
  hooks: {
    preBuild: [
      'npm run lint',
      'npm run test',
      'npm audit'
    ],
    postBuild: [
      'npm run analyze-bundle',
      'npm run generate-sitemap',
      'npm run optimize-images'
    ],
    preDeploy: [
      'npm run e2e-tests',
      'npm run security-scan'
    ],
    postDeploy: [
      'npm run smoke-tests',
      'npm run performance-tests',
      'npm run accessibility-tests'
    ]
  },

  // Rollback configuration
  rollback: {
    enabled: true,
    maxVersions: 5,
    healthCheckUrl: '/health',
    healthCheckTimeout: 30000,
    rollbackOnFailure: true
  }
};
