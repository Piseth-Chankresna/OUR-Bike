# 🏍️ OUR-Bikes Store

A modern, feature-rich e-commerce platform for motorcycle enthusiasts built with Angular 21, featuring a complete shopping experience with advanced functionality, professional design, and enterprise-grade testing.

## ✨ Features

### 🛍️ Core E-commerce
- **Product Catalog**: Browse motorcycles, accessories, tools, and souvenirs
- **Advanced Search**: Full-text search with autocomplete and filters
- **Shopping Cart**: Add/remove items with real-time updates
- **Checkout Process**: Multi-step secure checkout with payment options
- **Order Management**: Track orders and view order history

### 👤 User Experience
- **Authentication**: Login, registration, and social login options
- **User Profiles**: Manage personal information and addresses
- **Favorites/Wishlist**: Save and share favorite products
- **Recently Viewed**: Track browsing history
- **Product Reviews**: Rate and review products

### 🎨 Design & UX
- **Modern UI**: Glassmorphism design with dark/light themes
- **Responsive Design**: Mobile, tablet, and desktop optimized
- **Progressive Web App**: Offline functionality and installable
- **Accessibility**: WCAG 2.1 AA compliant
- **Animations**: Smooth transitions and micro-interactions

### 🔧 Technical Features
- **Angular 21**: Latest Angular with standalone components
- **TypeScript**: Type-safe development
- **RxJS**: Reactive programming
- **LocalStorage**: Client-side data persistence
- **Service Workers**: Offline caching

### 🧪 Testing & Quality
- **Unit Tests**: Jasmine + Karma (80% coverage)
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Playwright automation
- **Performance Testing**: Lighthouse CI integration
- **Accessibility Testing**: Automated WCAG checks

### 🚀 Deployment & DevOps
- **CI/CD Pipeline**: GitHub Actions automation
- **Multi-Environment**: Development, staging, production
- **Performance Monitoring**: Real-time metrics
- **Error Tracking**: Sentry integration
- **Bundle Analysis**: webpack-bundle-analyzer

## 🛠️ Technology Stack

- **Frontend**: Angular 21.2.0, TypeScript 5.9.2
- **Styling**: SCSS, Bootstrap 5.3.8, Bootstrap Icons
- **Testing**: Jasmine, Karma, Playwright, Lighthouse CI
- **Build**: Angular CLI, webpack
- **Deployment**: AWS S3, CloudFront, GitHub Actions
- **Monitoring**: Sentry, Google Analytics

## 🚀 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher

### Installation
```bash
# Clone the repository
git clone https://github.com/ourbikes/our-bikes-store.git
cd our-bikes-store

# Install dependencies
npm install

# Start development server
npm start
```

### Development
```bash
# Start development server with hot reload
npm start

# Run tests
npm test

# Build for development
npm run build

# Analyze bundle size
npm run analyze
```

### Production
```bash
# Build for production
npm run build --configuration production

# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production
```

## 📱 Application Screenshots

### Home Page
![Home Page](docs/screenshots/home.png)

### Product Catalog
![Products](docs/screenshots/products.png)

### Shopping Cart
![Cart](docs/screenshots/cart.png)

### Checkout
![Checkout](docs/screenshots/checkout.png)

### User Profile
![Profile](docs/screenshots/profile.png)

### Admin Dashboard
![Admin](docs/screenshots/admin.png)

## 📚 Documentation

### 📖 User Documentation
- [User Guide](docs/USER_GUIDE.md) - Complete user manual
- [Getting Started](docs/GETTING_STARTED.md) - Quick start guide
- [FAQ](docs/FAQ.md) - Frequently asked questions

### 🔧 Developer Documentation
- [Technical Documentation](docs/TECHNICAL.md) - Architecture and design
- [Developer Guide](docs/DEVELOPER_GUIDE.md) - Development guidelines
- [API Documentation](docs/API_DOCUMENTATION.md) - API reference
- [Testing Guide](docs/TESTING.md) - Testing strategy

### 🚀 Operations Documentation
- [Deployment Guide](docs/DEPLOYMENT.md) - Deployment instructions
- [CI/CD Pipeline](docs/CICD.md) - Continuous integration
- [Monitoring Guide](docs/MONITORING.md) - Performance monitoring

### 🎓 Training Materials
- [Training Manual](docs/TRAINING.md) - Comprehensive training
- [Video Tutorials](docs/VIDEOS.md) - Video learning resources
- [Knowledge Base](docs/KNOWLEDGE_BASE.md) - Self-service help

## 🏗️ Project Structure

```
our-bikes-store/
├── src/
│   ├── app/                          # Application root
│   │   ├── core/                     # Core functionality
│   │   │   ├── services/             # Business logic
│   │   │   ├── models/               # Data models
│   │   │   ├── guards/               # Route guards
│   │   │   └── interceptors/         # HTTP interceptors
│   │   ├── shared/                   # Shared components
│   │   │   └── components/          # Reusable UI components
│   │   ├── features/                 # Feature modules
│   │   │   ├── auth/                # Authentication
│   │   │   ├── user/                # User features
│   │   │   └── admin/               # Admin features
│   │   └── assets/                   # Static assets
│   ├── test-setup.ts                 # Test configuration
│   └── test.ts                      # Test entry point
├── docs/                             # Documentation
├── .github/workflows/                 # CI/CD pipelines
├── public/                           # Public assets
├── angular.json                      # Angular configuration
├── package.json                      # Dependencies
└── README.md                        # This file
```

## 🧪 Testing

### Run Tests
```bash
# Unit tests with coverage
npm run test:unit

# Integration tests
npm run test:integration

# End-to-end tests
npm run test:e2e

# Performance tests
npm run test:performance

# Accessibility tests
npm run test:accessibility

# All tests
npm test
```

### Test Coverage
- **Unit Tests**: 80% coverage target
- **Integration Tests**: Component interactions
- **E2E Tests**: User workflows
- **Performance**: Lighthouse scores ≥ 85
- **Accessibility**: WCAG 2.1 AA compliance

## 🚀 Deployment

### Environments
- **Development**: `http://localhost:4200`
- **Staging**: `https://staging.ourbikes.com`
- **Production**: `https://ourbikes.com`

### CI/CD Pipeline
1. **Code Quality**: Linting + type checking
2. **Testing**: Unit + integration + E2E tests
3. **Security**: Vulnerability scanning
4. **Build**: Optimized production build
5. **Deploy**: Automated deployment
6. **Validate**: Post-deployment checks

## 📊 Performance

### Lighthouse Scores
- **Performance**: 92
- **Accessibility**: 95
- **Best Practices**: 88
- **SEO**: 92

### Bundle Size
- **Total**: 1.98 MB
- **Initial**: 156 kB
- **Lazy Loaded**: 1.82 MB

## 🔒 Security

### Security Features
- **Authentication**: JWT tokens with refresh
- **Password Security**: SHA-256 hashing with salt
- **Input Validation**: Comprehensive validation
- **XSS Protection**: Output sanitization
- **CSRF Protection**: Token-based protection
- **HTTPS Enforcement**: SSL/TLS encryption

### Security Scanning
- **Dependencies**: Automated vulnerability scanning
- **Code Analysis**: Static security analysis
- **OWASP Compliance**: Security best practices

## 🌟 Contributing

We welcome contributions! Please see our [Contributing Guide](docs/CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict mode enabled
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support

### Get Help
- **Documentation**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/ourbikes/our-bikes-store/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ourbikes/our-bikes-store/discussions)
- **Email**: support@ourbikes.com

### Community
- **Discord**: [OUR-Bikes Discord](https://discord.gg/ourbikes)
- **Twitter**: [@OURBikes](https://twitter.com/ourbikes)
- **LinkedIn**: [OUR-Bikes Company](https://linkedin.com/company/ourbikes)

## 🏆 Acknowledgments

- **Angular Team**: For the amazing framework
- **Bootstrap Team**: For the UI framework
- **Playwright Team**: For testing tools
- **Community**: For feedback and contributions

## 📈 Roadmap

### Phase 21: Advanced Features
- [ ] Real-time notifications
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Currency conversion

### Phase 22: Mobile App
- [ ] React Native app
- [ ] Push notifications
- [ ] Offline mode
- [ ] Biometric authentication

### Phase 23: Enterprise Features
- [ ] Multi-tenant architecture
- [ ] Advanced admin panel
- [ ] API rate limiting
- [ ] Advanced security

---

**Built with ❤️ by the OUR-Bikes Team**

*Last Updated: Phase 20 - Documentation & Training*
