# OUR-Bikes Store - Developer Guide

## 📋 Table of Contents
1. [Getting Started](#getting-started)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Coding Standards](#coding-standards)
5. [Component Development](#component-development)
6. [Service Development](#service-development)
7. [Testing Guidelines](#testing-guidelines)
8. [Build & Deployment](#build--deployment)
9. [Contributing](#contributing)
10. [Troubleshooting](#troubleshooting)

## 🚀 Getting Started

### Prerequisites
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **Angular CLI**: 21.x or higher
- **Git**: Latest version
- **VS Code**: Recommended IDE with Angular extensions

### Quick Start
```bash
# Clone the repository
git clone https://github.com/ourbikes/our-bikes-store.git
cd our-bikes-store

# Install dependencies
npm install

# Start development server
npm start

# Run tests
npm test
```

### Environment Setup
```bash
# Set up environment variables
cp .env.example .env

# Edit .env file
NODE_ENV=development
API_URL=http://localhost:4200/api
CDN_URL=http://localhost:4200/assets
```

## 🛠️ Development Setup

### IDE Configuration
Install these VS Code extensions:
- **Angular Language Service**: Angular support
- **TypeScript Importer**: Auto imports
- **Prettier**: Code formatting
- **ESLint**: Code linting
- **Angular Schematics**: Code generation

### VS Code Settings
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "angular.enable-strict-mode-prompt": false
}
```

### Git Configuration
```bash
# Set up git hooks
npx husky install

# Configure pre-commit hooks
npx husky add .husky/pre-commit "npx lint-staged"
```

## 📁 Project Structure

### Architecture Overview
```
src/
├── app/                    # Application root
│   ├── core/             # Core functionality
│   │   ├── services/     # Business logic
│   │   ├── models/       # Data models
│   │   ├── guards/       # Route guards
│   │   └── interceptors/ # HTTP interceptors
│   ├── shared/           # Shared components
│   │   └── components/  # Reusable UI
│   ├── features/         # Feature modules
│   │   ├── auth/        # Authentication
│   │   ├── user/        # User features
│   │   └── admin/       # Admin features
│   └── assets/           # Static assets
├── docs/                # Documentation
├── tests/               # Test files
└── public/              # Public assets
```

### Naming Conventions
- **Files**: kebab-case (`user-profile.component.ts`)
- **Folders**: kebab-case (`user-profile/`)
- **Classes**: PascalCase (`UserProfileComponent`)
- **Methods**: camelCase (`getUserProfile()`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS`)
- **Interfaces**: PascalCase with 'I' prefix (`IUserProfile`)

## 📝 Coding Standards

### TypeScript Guidelines

#### Type Safety
```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  name: string;
  email: string;
}

// Use enums for constants
enum UserRole {
  Admin = 'admin',
  User = 'user'
}

// Use generic types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}
```

#### Function Signatures
```typescript
// Use explicit return types
function getUserById(id: string): Promise<User | null> {
  // Implementation
}

// Use optional parameters
function updateUser(id: string, updates?: Partial<User>): Promise<User> {
  // Implementation
}
```

### Angular Best Practices

#### Component Structure
```typescript
@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  // Public properties for template
  user: User | null = null;
  
  // Private properties
  private destroy$ = new Subject<void>();
  
  constructor(
    private userService: UserService,
    private route: ActivatedRoute
  ) {}
  
  ngOnInit(): void {
    this.loadUser();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private loadUser(): void {
    // Implementation
  }
}
```

#### Reactive Forms
```typescript
// Form setup
profileForm = this.fb.group({
  name: ['', [Validators.required]],
  email: ['', [Validators.required, Validators.email]],
  phone: ['', Validators.pattern(/^\d{10}$/)]
});

// Form submission
onSubmit(): void {
  if (this.profileForm.valid) {
    const formData = this.profileForm.value;
    this.userService.updateProfile(formData);
  }
}

// Form validation
get nameControl(): FormControl {
  return this.profileForm.get('name') as FormControl;
}

get nameError(): string | null {
  const control = this.nameControl;
  return control?.touched && control?.invalid ? control.errors?.['required'] : null;
}
```

#### Service Development
```typescript
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private users$ = new BehaviorSubject<User[]>([]);
  
  constructor(private storageService: StorageService) {}
  
  // Observable pattern
  getUsers(): Observable<User[]> {
    return this.users$.asObservable();
  }
  
  // CRUD operations
  createUser(user: Omit<User, 'id'>): Observable<User> {
    const newUser = { ...user, id: this.generateId() };
    const users = [...this.users$.value, newUser];
    this.users$.next(users);
    this.storageService.set('USERS', users);
    return of(newUser);
  }
  
  // Error handling
  updateUser(id: string, updates: Partial<User>): Observable<User> {
    try {
      const users = this.users$.value;
      const userIndex = users.findIndex(u => u.id === id);
      
      if (userIndex === -1) {
        throw new Error(`User with id ${id} not found`);
      }
      
      const updatedUser = { ...users[userIndex], ...updates };
      users[userIndex] = updatedUser;
      this.users$.next(users);
      this.storageService.set('USERS', users);
      return of(updatedUser);
    } catch (error) {
      return throwError(() => error);
    }
  }
}
```

## 🧩 Component Development

### Creating a New Component

#### Using Angular CLI
```bash
# Generate standalone component
ng generate component components/user-profile --standalone

# Generate with tests
ng generate component components/user-profile --standalone --skip-tests=false
```

#### Manual Component Creation
```typescript
// user-profile.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit, OnDestroy {
  // Component logic here
}
```

#### Component Template
```html
<!-- user-profile.component.html -->
<div class="user-profile">
  <header class="profile-header">
    <h1>{{ user?.name || 'Guest' }}</h1>
    <p *ngIf="user?.email">{{ user.email }}</p>
  </header>
  
  <main class="profile-content">
    <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
      <!-- Form fields -->
    </form>
  </main>
  
  <footer class="profile-actions">
    <button type="button" (click)="onCancel()">Cancel</button>
    <button type="submit" [disabled]="!profileForm.valid">Save</button>
  </footer>
</div>
```

#### Component Styles
```scss
// user-profile.component.scss
.user-profile {
  padding: 2rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  
  .profile-header {
    margin-bottom: 2rem;
    text-align: center;
    
    h1 {
      font-size: 2rem;
      font-weight: 600;
      color: #007bff;
    }
  }
  
  .profile-content {
    margin-bottom: 2rem;
  }
  
  .profile-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    
    button {
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      transition: all 0.3s ease;
      
      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }
    }
  }
}
```

### Component Communication

#### Input/Output Pattern
```typescript
@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule]
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Input() showActions = true;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() viewDetails = new EventEmitter<string>();
  
  onAddToCart(): void {
    this.addToCart.emit(this.product);
  }
  
  onViewDetails(): void {
    this.viewDetails.emit(this.product.id);
  }
}
```

#### Service Communication
```typescript
// Using BehaviorSubject for state
export class CartService {
  private cartItems$ = new BehaviorSubject<CartItem[]>([]);
  
  get cartItems(): Observable<CartItem[]> {
    return this.cartItems$.asObservable();
  }
  
  addToCart(item: CartItem): void {
    const items = [...this.cartItems$.value, item];
    this.cartItems$.next(items);
  }
}
```

## 🔧 Service Development

### Service Patterns

#### Singleton Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config$ = new BehaviorSubject<AppConfig>(defaultConfig);
  
  constructor() {
    this.loadConfig();
  }
  
  getConfig(): Observable<AppConfig> {
    return this.config$.asObservable();
  }
  
  updateConfig(updates: Partial<AppConfig>): void {
    const current = this.config$.value;
    const newConfig = { ...current, ...updates };
    this.config$.next(newConfig);
    this.saveConfig(newConfig);
  }
}
```

#### HTTP Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}
  
  get<T>(endpoint: string): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`);
  }
  
  post<T>(endpoint: string, data: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, data);
  }
  
  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, data);
  }
  
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`);
  }
}
```

#### Storage Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private readonly STORAGE_PREFIX = 'ourbikes_';
  
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(`${this.STORAGE_PREFIX}${key}`);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }
  
  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(`${this.STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
    }
  }
  
  remove(key: string): void {
    try {
      localStorage.removeItem(`${this.STORAGE_PREFIX}${key}`);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }
}
```

## 🧪 Testing Guidelines

### Unit Testing

#### Component Testing
```typescript
// user-profile.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { UserProfileComponent } from './user-profile.component';

describe('UserProfileComponent', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileComponent, ReactiveFormsModule]
    }).compileComponents();
    
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
  it('should display user name', () => {
    component.user = { id: '1', name: 'John Doe', email: 'john@example.com' };
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('John Doe');
  });
  
  it('should emit event on form submit', () => {
    spyOn(component.formSubmit, 'emit');
    
    component.profileForm.setValue({
      name: 'Jane Doe',
      email: 'jane@example.com'
    });
    
    fixture.nativeElement.querySelector('form')?.dispatchEvent(new Event('submit'));
    
    expect(component.formSubmit.emit).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com'
    });
  });
});
```

#### Service Testing
```typescript
// user.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserService } from './user.service';
import { StorageService } from '../storage.service';

describe('UserService', () => {
  let service: UserService;
  let storageServiceSpy: jasmine.SpyObj<StorageService>;
  
  beforeEach(() => {
    storageServiceSpy = jasmine.createSpyObj('StorageService');
    storageServiceSpy.get.and.returnValue(null);
    storageServiceSpy.set.and.returnValue(true);
    
    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: StorageService, useValue: storageServiceSpy }
      ]
    });
    
    service = TestBed.inject(UserService);
  });
  
  it('should create user successfully', () => {
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    };
    
    service.createUser(userData).subscribe(result => {
      expect(result.id).toBeDefined();
      expect(result.name).toBe(userData.name);
      expect(result.email).toBe(userData.email);
    });
    
    expect(storageServiceSpy.set).toHaveBeenCalledWith('USERS', jasmine.any(Array));
  });
  
  it('should handle errors gracefully', () => {
    storageServiceSpy.set.and.throwError('Storage error');
    
    const userData = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123'
    };
    
    service.createUser(userData).subscribe(
      () => fail('Should have failed'),
      error => expect(error.message).toBe('Storage error')
    );
  });
});
```

### Integration Testing
```typescript
// user-profile.integration.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { UserProfileComponent } from './user-profile.component';
import { UserService } from '../services/user.service';

describe('UserProfileComponent Integration', () => {
  let component: UserProfileComponent;
  let fixture: ComponentFixture<UserProfileComponent>;
  let userService: UserService;
  let router: Router;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserProfileComponent],
      providers: [UserService, Router]
    }).compileComponents();
    
    fixture = TestBed.createComponent(UserProfileComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });
  
  it('should navigate after successful update', () => {
    spyOn(router, 'navigate');
    
    component.profileForm.setValue({
      name: 'Updated Name',
      email: 'updated@example.com'
    });
    
    component.onSubmit();
    
    expect(router.navigate).toHaveBeenCalledWith(['/profile']);
  });
});
```

### E2E Testing
```typescript
// user-profile.e2e-spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Profile', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile');
  });
  
  test('should display user information', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('User Profile');
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-email"]')).toBeVisible();
  });
  
  test('should update profile successfully', async ({ page }) => {
    await page.fill('[data-testid="user-name"]', 'Updated Name');
    await page.fill('[data-testid="user-email"]', 'updated@example.com');
    await page.click('[data-testid="save-button"]');
    
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page.locator('[data-testid="user-name"]')).toHaveValue('Updated Name');
  });
});
```

## 🏗️ Build & Deployment

### Development Build
```bash
# Start development server
npm start

# Build for development
npm run build

# Build with watch mode
npm run build --watch
```

### Production Build
```bash
# Build for production
npm run build --configuration production

# Build with bundle analysis
npm run build --configuration production --stats-json

# Analyze bundle
npx webpack-bundle-analyzer dist/our-bikes-store/stats.json
```

### Environment Configuration
```typescript
// environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4200/api',
  cdnUrl: 'http://localhost:4200/assets'
};

// environments/environment.production.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.ourbikes.com',
  cdnUrl: 'https://cdn.ourbikes.com/assets'
};
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build --configuration production
FROM nginx:alpine
COPY --from=0 /app/dist/our-bikes-store /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🤝 Contributing

### Pull Request Process
1. **Fork Repository**: Create your fork
2. **Create Branch**: `feature/your-feature-name`
3. **Make Changes**: Follow coding standards
4. **Test Thoroughly**: Unit, integration, E2E tests
5. **Submit PR**: Detailed description and testing notes

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes
- [ ] Performance impact considered
- [ ] Security implications reviewed

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Code style
- refactor: Code refactoring
- test: Testing
- chore: Build process
```

## 🔧 Troubleshooting

### Common Issues

#### Build Errors
- **TypeScript Errors**: Check types and interfaces
- **Import Errors**: Verify module paths
- **Bundle Size**: Analyze with webpack-bundle-analyzer
- **Memory Leaks**: Check for unsubscribed observables

#### Runtime Errors
- **Null Reference**: Add null checks
- **Async Issues**: Use proper RxJS operators
- **State Management**: Verify BehaviorSubject usage
- **Route Guards**: Check authentication flow

#### Performance Issues
- **Slow Rendering**: Use OnPush change detection
- **Memory Usage**: Implement proper cleanup
- **Bundle Size**: Implement code splitting
- **Network Requests**: Implement caching

### Debug Tools
```bash
# Debug with source maps
ng serve --source-map

# Profile memory usage
ng build --stats-json
npx webpack-bundle-analyzer dist/our-bikes-store/stats.json

# Run specific test
ng test --include="**/user.service.spec.ts"

# Debug E2E tests
npx playwright test --debug --headed
```

### Performance Monitoring
```typescript
// Performance monitoring service
@Injectable({ providedIn: 'root' })
export class PerformanceService {
  mark(name: string): void {
    performance.mark(`${name}-start`);
  }
  
  measure(name: string): void {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }
  
  getMetrics(): PerformanceEntry[] {
    return performance.getEntriesByType('measure');
  }
}
```

---

*Last Updated: Phase 20 - Documentation & Training*
