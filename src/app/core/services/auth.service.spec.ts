import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let storageServiceSpy: any;

  const mockUser = {
    userId: 'test-user-123',
    email: 'test@example.com',
    role: 'user' as const,
    fullName: 'Test User',
    loginTime: Date.now()
  };

  beforeEach(() => {
    const storageSpy = {
      get: vi.fn().mockReturnValue(null),
      set: vi.fn().mockReturnValue(true)
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: StorageService, useValue: storageSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    storageServiceSpy = TestBed.inject(StorageService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  describe('register', () => {
    it('should register a new user successfully', () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        confirmPassword: 'password123',
        phoneNumber: '+1234567890',
        address: '123 Test St, Test City, TS 12345, USA'
      };

      const result = service.register(userData);

      expect(result).toBeTruthy();
      expect(storageServiceSpy.set).toHaveBeenCalledWith('USERS', expect.any(Object));
    });

    it('should not register user with existing email', () => {
      const existingUsers = [mockUser];
      storageServiceSpy.get.and.returnValue(existingUsers);

      const userData = {
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User',
        confirmPassword: 'password123',
        phoneNumber: '+1234567890',
        address: '123 Test St, Test City, TS 12345, USA'
      };

      const result = service.register(userData);

      expect(result).toBeFalsy();
    });

    it('should hash password before storing', () => {
      const userData = {
        email: 'new@example.com',
        password: 'password123',
        fullName: 'New User',
        confirmPassword: 'password123',
        phoneNumber: '+1234567890',
        address: '123 Test St, Test City, TS 12345, USA'
      };

      service.register(userData);

      const storedUsers = storageServiceSpy.set.mock.calls[0][1];
      const storedUser = storedUsers.find((u: any) => u.email === userData.email);
      
      expect(storedUser?.password).not.toBe(userData.password);
      expect(storedUser?.password).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hash
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const users = [mockUser];
      storageServiceSpy.get.and.returnValue(users);

      const loginData = { email: 'test@example.com', password: 'password123' };
      const result = await new Promise(resolve => {
        service.login(loginData).subscribe(response => {
          resolve(response);
        });
      });

      expect((result as any).success).toBeTruthy();
      expect(storageServiceSpy.set).toHaveBeenCalledWith('CURRENT_SESSION', expect.objectContaining({
        userId: mockUser.userId,
        email: mockUser.email,
        role: mockUser.role,
        fullName: mockUser.fullName,
        loginTime: expect.any(Number)
      }));
    });

    it('should not login user with invalid credentials', async () => {
      const users = [mockUser];
      storageServiceSpy.get.and.returnValue(users);

      const loginData = { email: 'test@example.com', password: 'wrongpassword' };
      const result = await new Promise(resolve => {
        service.login(loginData).subscribe(response => {
          resolve(response);
        });
      });

      expect((result as any).success).toBeFalsy();
    });

    it('should not login non-existent user', async () => {
      const users = [mockUser];
      storageServiceSpy.get.and.returnValue(users);

      const loginData = { email: 'nonexistent@example.com', password: 'password123' };
      const result = await new Promise(resolve => {
        service.login(loginData).subscribe(response => {
          resolve(response);
        });
      });

      expect((result as any).success).toBeFalsy();
    });
  });

  describe('logout', () => {
    it('should clear current session', () => {
      service.logout();

      expect(storageServiceSpy.set).toHaveBeenCalledWith('CURRENT_SESSION', null);
    });
  });

  describe('getCurrentUser', () => {
    it('should return current user session', () => {
      storageServiceSpy.get.and.returnValue(mockUser);

      const currentUser = service.getCurrentUser();

      expect(currentUser).toEqual(mockUser);
    });

    it('should return null if no session exists', () => {
      storageServiceSpy.get.and.returnValue(null);

      const currentUser = service.getCurrentUser();

      expect(currentUser).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true if user is logged in', () => {
      storageServiceSpy.get.and.returnValue(mockUser);

      const isAuthenticated = service.isAuthenticated();

      expect(isAuthenticated).toBeTruthy();
    });

    it('should return false if user is not logged in', () => {
      storageServiceSpy.get.and.returnValue(null);

      const isAuthenticated = service.isAuthenticated();

      expect(isAuthenticated).toBeFalsy();
    });
  });

  describe('isAdmin', () => {
    it('should return true if current user is admin', () => {
      const adminUser = { ...mockUser, role: 'admin' as const };
      storageServiceSpy.get.and.returnValue(adminUser);

      const isAdmin = service.isAdmin();

      expect(isAdmin).toBeTruthy();
    });

    it('should return false if current user is not admin', () => {
      storageServiceSpy.get.and.returnValue(mockUser);

      const isAdmin = service.isAdmin();

      expect(isAdmin).toBeFalsy();
    });

    it('should return false if no user is logged in', () => {
      storageServiceSpy.get.and.returnValue(null);

      const isAdmin = service.isAdmin();

      expect(isAdmin).toBeFalsy();
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', () => {
      const password = 'password123';
      const hashedPassword = service.hashPassword(password);

      const isVerified = service.verifyPassword('test@example.com', password);

      expect(isVerified).toBeTruthy();
    });

    it('should not verify incorrect password', () => {
      const password = 'password123';
      service.hashPassword(password);

      const isVerified = service.verifyPassword('test@example.com', 'wrongpassword');

      expect(isVerified).toBeFalsy();
    });
  });

  describe('hashPassword', () => {
    it('should hash password with salt', () => {
      const password = 'password123';
      const hashedPassword = service.hashPassword(password);

      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hash
    });

    it('should generate different hashes for same password with different salts', () => {
      const password = 'password123';
      const hash1 = service.hashPassword(password);
      const hash2 = service.hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });
});
