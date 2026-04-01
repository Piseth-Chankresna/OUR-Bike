# Testing & Deployment Guide

## 🧪 Testing Strategy

### Overview
The OUR-Bikes Store implements a comprehensive testing strategy covering unit tests, integration tests, end-to-end tests, performance testing, and accessibility testing.

## 📋 Test Types

### 1. Unit Testing
**Framework**: Jasmine + Karma
**Location**: `src/**/*.spec.ts`
**Coverage Target**: 80%

#### Running Unit Tests
```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:unit --code-coverage

# Run specific test file
ng test --include="**/auth.service.spec.ts"
```

#### Test Structure
- **Services**: Test all business logic
- **Components**: Test component behavior
- **Pipes**: Test data transformation
- **Guards**: Test route protection
- **Interceptors**: Test HTTP interception

#### Coverage Reports
- **HTML Report**: `coverage/index.html`
- **LCOV Report**: `coverage/lcov.info`
- **Text Summary**: `coverage/coverage.txt`

### 2. Integration Testing
**Framework**: Jasmine + Karma
**Location**: `src/integration/**/*.spec.ts`
**Focus**: Component interactions

#### Running Integration Tests
```bash
npm run test:integration
```

#### Test Scenarios
- **User Authentication Flow**
- **Product Management**
- **Shopping Cart Operations**
- **Order Processing**
- **Admin Functions**

### 3. End-to-End Testing
**Framework**: Playwright
**Location**: `src/e2e/**/*.e2e-spec.ts`
**Browsers**: Chrome, Firefox, Safari, Mobile

#### Running E2E Tests
```bash
# Run all E2E tests
npm run test:e2e

# Run specific test
npx playwright test --grep="Login Flow"

# Run in headed mode
npx playwright test --headed

# Run on specific browser
npx playwright test --project=mobile-chrome
```

#### E2E Test Scenarios
- **Complete User Journey**: Registration → Login → Browse → Add to Cart → Checkout
- **Admin Workflow**: Admin Login → Manage Products → Process Orders
- **Responsive Design**: Mobile, Tablet, Desktop views
- **Accessibility**: Screen reader, keyboard navigation
- **Performance**: Page load times, interaction delays

### 4. Performance Testing
**Tools**: Lighthouse CI
**Metrics**: Performance, Accessibility, Best Practices, SEO

#### Running Performance Tests
```bash
npm run test:performance
```

#### Performance Budgets
- **Performance Score**: ≥ 85
- **Accessibility Score**: ≥ 90
- **Best Practices**: ≥ 85
- **SEO Score**: ≥ 85

#### Bundle Analysis
```bash
npm run analyze
```

### 5. Accessibility Testing
**Tools**: pa11y-ci
**Standards**: WCAG 2.1 AA

#### Running Accessibility Tests
```bash
npm run test:accessibility
```

#### Accessibility Checks
- **Color Contrast**: 4.5:1 ratio
- **Keyboard Navigation**: All interactive elements
- **Screen Reader**: Proper ARIA labels
- **Focus Management**: Logical tab order
- **Alternative Text**: All meaningful images

## 🚀 Deployment Strategy

### Environments

#### 1. Development
- **URL**: `http://localhost:4200`
- **Features**: Hot reload, source maps, debug mode
- **Database**: LocalStorage mock

#### 2. Staging
- **URL**: `https://staging.ourbikes.com`
- **Features**: Production build, CDN, monitoring
- **Database**: Test data

#### 3. Production
- **URL**: `https://ourbikes.com`
- **Features**: Optimized build, CDN, monitoring
- **Database**: Live data

### Deployment Process

#### 1. Build Application
```bash
# Development build
npm run build

# Production build
npm run build --configuration production
```

#### 2. Quality Gates
- **All tests pass**: ✅
- **Coverage ≥ 80%**: ✅
- **Performance ≥ 85**: ✅
- **No critical vulnerabilities**: ✅

#### 3. Deploy to Staging
```bash
npm run deploy:staging
```

#### 4. Staging Validation
- **Smoke tests**: Basic functionality
- **Integration tests**: Key workflows
- **Performance tests**: Load testing
- **Security scan**: Vulnerability assessment

#### 5. Deploy to Production
```bash
npm run deploy:production
```

### CI/CD Pipeline

#### Triggers
- **Push to main**: Production deployment
- **Push to develop**: Staging deployment
- **Pull requests**: Full test suite

#### Pipeline Stages
1. **Test**: Unit, Integration, E2E tests
2. **Build**: Application compilation
3. **Security**: Vulnerability scanning
4. **Performance**: Lighthouse analysis
5. **Deploy Staging**: Staging environment
6. **Validate**: Smoke tests on staging
7. **Deploy Production**: Production environment

#### Quality Gates
- **Test Coverage**: 80% minimum
- **Performance Score**: 85 minimum
- **Security Scan**: No critical vulnerabilities
- **Build Success**: All artifacts generated

## 📊 Monitoring & Analytics

### Application Monitoring
- **Error Tracking**: Sentry integration
- **Performance**: Google Analytics
- **Uptime**: Pingdom monitoring
- **User Behavior**: Hotjar analytics

### Infrastructure Monitoring
- **Server Metrics**: CPU, Memory, Disk
- **Network Performance**: Response times
- **Database Performance**: Query times
- **CDN Performance**: Cache hit rates

## 🔧 Development Workflow

### Local Development
```bash
# Start development server
npm start

# Run tests in watch mode
npm run test:unit --watch

# Run linting
npm run lint

# Type checking
npm run type-check
```

### Pre-commit Hooks
- **Linting**: Code quality checks
- **Type checking**: TypeScript validation
- **Unit tests**: Fast test suite
- **Formatting**: Prettier formatting

### Branch Strategy
- **main**: Production-ready code
- **develop**: Integration branch
- **feature/***: Feature development
- **hotfix/***: Critical fixes

## 📋 Testing Checklist

### Before Deployment
- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Performance score ≥ 85
- [ ] Accessibility score ≥ 90
- [ ] Security scan passes
- [ ] Bundle size within limits
- [ ] No TypeScript errors
- [ ] No linting errors

### After Deployment
- [ ] Smoke tests pass
- [ ] Health check passes
- [ ] Monitoring is active
- [ ] Error tracking works
- [ ] Performance monitoring active
- [ ] User analytics active

## 🚨 Troubleshooting

### Common Issues
1. **Test Failures**: Check test data and mocks
2. **Build Errors**: Verify TypeScript configuration
3. **Performance Issues**: Check bundle analysis
4. **Deployment Failures**: Check environment variables
5. **Monitoring Alerts**: Check system resources

### Debug Commands
```bash
# Debug specific test
ng test --include="**/auth.service.spec.ts" --watch

# Debug build
ng build --verbose

# Debug E2E
npx playwright test --debug

# Performance debug
npx lighthouse http://localhost:4200 --view
```

## 📚 Resources

### Documentation
- **Angular Testing Guide**: https://angular.io/guide/testing
- **Playwright Documentation**: https://playwright.dev/
- **Lighthouse Guide**: https://developers.google.com/web/tools/lighthouse/
- **Accessibility Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/

### Tools
- **Test Runner**: Karma, Playwright
- **Coverage**: Istanbul, Codecov
- **Performance**: Lighthouse, WebPageTest
- **Accessibility**: axe-core, pa11y
- **Security**: Snyk, OWASP ZAP

## 🎯 Best Practices

### Testing
1. **Test early, test often**
2. **Write maintainable tests**
3. **Use descriptive test names**
4. **Mock external dependencies**
5. **Test edge cases**
6. **Keep tests independent**
7. **Use page objects for E2E**

### Deployment
1. **Automate everything possible**
2. **Use environment-specific configs**
3. **Implement rollback strategy**
4. **Monitor everything**
5. **Document processes**

---

*Last Updated: Phase 19 - Testing & Deployment*
