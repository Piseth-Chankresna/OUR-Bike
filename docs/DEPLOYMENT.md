# OUR-Bikes Store - Deployment Guide

## 📋 Table of Contents
1. [Overview](#overview)
2. [Environment Setup](#environment-setup)
3. [Local Development](#local-development)
4. [Staging Deployment](#staging-deployment)
5. [Production Deployment](#production-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Cloud Platforms](#cloud-platforms)
8. [Monitoring & Maintenance](#monitoring--maintenance)
9. [Troubleshooting](#troubleshooting)

## 🌐 Overview

### Deployment Strategy
OUR-Bikes Store follows a multi-environment deployment strategy:
- **Development**: Local development environment
- **Staging**: Pre-production testing environment
- **Production**: Live production environment

### Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │───▶│     Staging     │───▶│   Production   │
│   (localhost)   │    │  (staging URL)  │    │ (production URL)│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Environment Setup

### Prerequisites
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Git**: Latest version
- **Docker**: (optional) 20.x or higher

### Environment Variables
Create `.env` files for each environment:

#### Development (.env.development)
```bash
NODE_ENV=development
API_URL=http://localhost:4200/api
CDN_URL=http://localhost:4200/assets
ENABLE_LOGGING=true
ENABLE_DEBUG=true
```

#### Staging (.env.staging)
```bash
NODE_ENV=staging
API_URL=https://staging-api.ourbikes.com
CDN_URL=https://staging-cdn.ourbikes.com/assets
ENABLE_LOGGING=true
ENABLE_DEBUG=false
SENTRY_DSN=https://your-staging-sentry-dsn
```

#### Production (.env.production)
```bash
NODE_ENV=production
API_URL=https://api.ourbikes.com
CDN_URL=https://cdn.ourbikes.com/assets
ENABLE_LOGGING=false
ENABLE_DEBUG=false
SENTRY_DSN=https://your-production-sentry-dsn
```

## 💻 Local Development

### Quick Start
```bash
# Clone repository
git clone https://github.com/ourbikes/our-bikes-store.git
cd our-bikes-store

# Install dependencies
npm install

# Set up environment
cp .env.example .env.development

# Start development server
npm start
```

### Development Commands
```bash
# Start development server
npm start

# Run tests
npm test

# Build for development
npm run build

# Serve build locally
npm run serve:dist

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Local Build Process
```bash
# Development build
npm run build

# Build with analysis
npm run build --stats-json

# Analyze bundle
npx webpack-bundle-analyzer dist/our-bikes-store/stats.json
```

## 🚀 Staging Deployment

### Automated Deployment (GitHub Actions)
The staging deployment is automatically triggered when:
- Code is pushed to `develop` branch
- Pull requests are created/updated

#### CI/CD Pipeline Steps
1. **Code Quality**: Linting and type checking
2. **Testing**: Unit, integration, and E2E tests
3. **Security**: Vulnerability scanning
4. **Build**: Optimized staging build
5. **Deploy**: Automatic staging deployment
6. **Validate**: Post-deployment smoke tests

### Manual Staging Deployment
```bash
# Build for staging
npm run build --configuration staging

# Deploy to staging
npm run deploy:staging

# Verify deployment
curl https://staging.ourbikes.com/health
```

### Staging Environment Configuration
```typescript
// environments/environment.staging.ts
export const environment = {
  production: false,
  apiUrl: 'https://staging-api.ourbikes.com',
  cdnUrl: 'https://staging-cdn.ourbikes.com/assets',
  enableLogging: true,
  enableDebug: false,
  sentryDsn: 'https://your-staging-sentry-dsn'
};
```

### Staging Features
- **Database**: Staging database (separate from production)
- **CDN**: Staging CDN with cache busting
- **Monitoring**: Full monitoring and alerting
- **Testing**: Automated smoke tests
- **Rollback**: Quick rollback capability

## 🌍 Production Deployment

### Automated Deployment
Production deployment requires manual approval and follows these steps:

1. **Merge to Main**: Code merged to `main` branch
2. **Quality Gates**: All tests pass, security scan clear
3. **Manual Review**: Team reviews deployment plan
4. **Approval**: Manual approval in GitHub Actions
5. **Blue-Green Deploy**: Zero-downtime deployment
6. **Health Check**: Post-deployment validation
7. **Traffic Switch**: Gradual traffic increase

### Production Build Process
```bash
# Production build with optimization
npm run build --configuration production

# Performance testing
npm run test:performance

# Accessibility testing
npm run test:accessibility

# Security audit
npm audit --audit-level high
```

### Production Deployment Commands
```bash
# Deploy to production
npm run deploy:production

# Deploy with specific version
npm run deploy:production -- --version=v1.0.0

# Rollback to previous version
npm run rollback:production
```

### Production Environment Configuration
```typescript
// environments/environment.production.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.ourbikes.com',
  cdnUrl: 'https://cdn.ourbikes.com/assets',
  enableLogging: false,
  enableDebug: false,
  sentryDsn: 'https://your-production-sentry-dsn',
  analyticsId: 'GA-XXXXXXXX-X'
};
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build --configuration production

# Production image
FROM nginx:alpine
COPY --from=builder /app/dist/our-bikes-store /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:80"
    environment:
      - NODE_ENV=production
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "443:443"
    volumes:
      - ./ssl:/etc/nginx/ssl
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - app
```

### Docker Commands
```bash
# Build Docker image
docker build -t ourbikes-store .

# Run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## ☁️ Cloud Platforms

### AWS Deployment
#### S3 + CloudFront Setup
```bash
# Deploy to S3
aws s3 sync dist/our-bikes-store s3://ourbikes-store-prod --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

#### AWS Amplify Configuration
```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build --configuration production
  artifacts:
    baseDirectory: dist/our-bikes-store
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

### Vercel Deployment
```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/our-bikes-store"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Netlify Deployment
```toml
# netlify.toml
[build]
  base = ""
  command = "npm run build --configuration production"
  publish = "dist/our-bikes-store"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 📊 Monitoring & Maintenance

### Health Checks
```typescript
// health-endpoint.ts
import { Controller, Get } from '@angular/common';
import { environment } from '../environments/environment';

@Controller('/health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: environment.production ? 'production' : 'development',
      version: process.env.npm_package_version
    };
  }
}
```

### Performance Monitoring
```bash
# Lighthouse CI
npm run lighthouse

# Bundle analysis
npm run analyze

# Performance budget check
npm run check:performance
```

### Error Tracking
```typescript
// error-tracking.ts
import * as Sentry from '@sentry/angular';

Sentry.init({
  dsn: environment.sentryDsn,
  environment: environment.production ? 'production' : 'development',
  tracesSampleRate: 0.1
});
```

### Log Management
```typescript
// logging.service.ts
@Injectable({ providedIn: 'root' })
export class LoggingService {
  log(level: 'info' | 'warn' | 'error', message: string, data?: any) {
    if (!environment.enableLogging) return;
    
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      environment: environment.production ? 'production' : 'development'
    };
    
    console[level](logEntry);
    
    // Send to logging service
    this.sendToLogService(logEntry);
  }
}
```

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules dist
npm install

# Check Node version
node --version  # Should be 18.x or higher
npm --version   # Should be 9.x or higher
```

#### Deployment Failures
```bash
# Check environment variables
printenv | grep NODE_ENV

# Verify build output
ls -la dist/our-bikes-store

# Test locally
npm run serve:dist
```

#### Performance Issues
```bash
# Analyze bundle size
npm run analyze

# Check Lighthouse scores
npm run lighthouse

# Monitor network requests
npm run analyze:network
```

### Debug Commands
```bash
# Development debugging
npm start --verbose

# Build debugging
npm run build --verbose

# Test debugging
npm test --verbose

# Deployment debugging
npm run deploy:staging --dry-run
```

### Rollback Procedures
```bash
# Quick rollback (Git)
git checkout previous-stable-tag
npm run build --configuration production
npm run deploy:production

# Blue-green rollback
npm run rollback:production

# Database rollback
npm run rollback:database
```

### Support & Escalation
1. **Check Logs**: Review application and server logs
2. **Health Check**: Verify system health endpoints
3. **Performance**: Check Lighthouse and bundle metrics
4. **Security**: Run security audit
5. **Team Escalation**: Contact DevOps team if needed

---

## 📋 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Security audit clear
- [ ] Performance budgets met
- [ ] Documentation updated
- [ ] Environment variables set
- [ ] Backup procedures ready

### Post-Deployment
- [ ] Health checks passing
- [ ] Monitoring active
- [ ] User acceptance testing
- [ ] Performance validation
- [ ] Error tracking configured
- [ ] Rollback plan tested

---

*Last Updated: Phase 20 - Documentation & Training*
