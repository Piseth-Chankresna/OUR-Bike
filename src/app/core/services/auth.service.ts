import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { 
  User, 
  UserSession, 
  UserRegistration, 
  UserLogin, 
  UserProfileUpdate,
  ApiResponse 
} from '../models';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSignal = signal<UserSession | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);
  private isAdminSignal = signal<boolean>(false);

  private currentUserSubject = new BehaviorSubject<UserSession | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private storageService: StorageService,
    private router: Router
  ) {
    // Check for existing session on service initialization
    this.initializeAuth();
  }

  // Initialize authentication state
  private initializeAuth(): void {
    const session = this.storageService.getSession() as UserSession | null;
    if (session && this.isSessionValid(session)) {
      this.currentUserSignal.set(session);
      this.currentUserSubject.next(session);
      this.isAuthenticatedSignal.set(true);
      this.isAdminSignal.set(session.role === 'admin');
    } else {
      this.storageService.removeSession();
      this.currentUserSignal.set(null);
      this.currentUserSubject.next(null);
      this.isAuthenticatedSignal.set(false);
      this.isAdminSignal.set(false);
    }
  }

  // Check if session is still valid (24 hours)
  private isSessionValid(session: UserSession): boolean {
    const sessionAge = Date.now() - session.loginTime;
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    return sessionAge < maxAge;
  }

  // Simple password hashing (Base64 for demo - in production use proper hashing)
  public hashPassword(password: string): string {
    return btoa(password + 'our_bikes_salt');
  }

  // Verify password
  public verifyPassword(email: string, password: string): boolean {
    const users = this.storageService.getUsers() as User[] || [];
    const user = users.find(u => u.email === email);
    if (!user) return false;
    
    return this.hashPassword(password) === user.password;
  }

  // Register new user
  register(userData: UserRegistration): Observable<ApiResponse<User>> {
    return new Observable<ApiResponse<User>>((observer) => {
      try {
        const users = this.storageService.getUsers() as User[] || [];

        // Check if email already exists
        if (users.some((user: User) => user.email === userData.email)) {
          observer.next({
            success: false,
            error: 'Email already exists',
            message: 'An account with this email already exists'
          });
          observer.complete();
          return;
        }

        // Validate passwords match
        if (userData.password !== userData.confirmPassword) {
          observer.next({
            success: false,
            error: 'Passwords do not match',
            message: 'Password and confirm password must be the same'
          });
          observer.complete();
          return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
          observer.next({
            success: false,
            error: 'Invalid email format',
            message: 'Please enter a valid email address'
          });
          observer.complete();
          return;
        }

        // Validate password strength
        if (userData.password.length < 6) {
          observer.next({
            success: false,
            error: 'Password too short',
            message: 'Password must be at least 6 characters long'
          });
          observer.complete();
          return;
        }

        // Create new user
        const newUser: User = {
          id: this.storageService.generateId(),
          email: userData.email,
          password: this.hashPassword(userData.password),
          role: userData.role || 'user',
          fullName: userData.fullName,
          phoneNumber: userData.phoneNumber,
          address: userData.address,
          registeredDate: Date.now()
        };

        // Save user
        users.push(newUser);
        this.storageService.setUsers(users);

        // Auto-login after registration
        const session: UserSession = {
          userId: newUser.id,
          email: newUser.email,
          role: newUser.role,
          fullName: newUser.fullName,
          loginTime: Date.now()
        };

        this.storageService.setSession(session);
        this.currentUserSignal.set(session);
        this.currentUserSubject.next(session);
        this.isAuthenticatedSignal.set(true);
        this.isAdminSignal.set(newUser.role === 'admin');

        observer.next({
          success: true,
          data: newUser,
          message: 'Registration successful'
        });
        observer.complete();

      } catch (error) {
        observer.next({
          success: false,
          error: 'Registration failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        observer.complete();
      }
    });
  }

  // Login user
  login(credentials: UserLogin): Observable<ApiResponse<UserSession>> {
    return new Observable<ApiResponse<UserSession>>((observer) => {
      try {
        const users = this.storageService.getUsers() as User[] || [];
        const user = users.find((u: User) => u.email === credentials.email);

        if (!user) {
          observer.next({
            success: false,
            error: 'User not found',
            message: 'No account found with this email address'
          });
          observer.complete();
          return;
        }

        if (!this.verifyPassword(user.email, credentials.password)) {
          observer.next({
            success: false,
            error: 'Invalid password',
            message: 'The password you entered is incorrect'
          });
          observer.complete();
          return;
        }

        // Create session
        const session: UserSession = {
          userId: user.id,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
          profileImage: user.profileImage,
          loginTime: Date.now()
        };

        this.storageService.setSession(session);
        this.currentUserSignal.set(session);
        this.currentUserSubject.next(session);
        this.isAuthenticatedSignal.set(true);
        this.isAdminSignal.set(user.role === 'admin');

        observer.next({
          success: true,
          data: session,
          message: 'Login successful'
        });
        observer.complete();

      } catch (error) {
        observer.next({
          success: false,
          error: 'Login failed',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
        observer.complete();
      }
    });
  }

  // Logout user
  logout(): void {
    this.storageService.removeSession();
    this.currentUserSignal.set(null);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSignal.set(false);
    this.isAdminSignal.set(false);
    this.router.navigate(['/auth/login']);
  }

  // Update user profile
  updateProfile(updates: UserProfileUpdate): ApiResponse<User> {
    try {
      const currentSession = this.currentUserSignal();
      if (!currentSession) {
        return {
          success: false,
          error: 'Not authenticated',
          message: 'You must be logged in to update your profile'
        };
      }

      const users = this.storageService.getUsers() as User[] || [];
      const userIndex = users.findIndex((u: User) => u.id === currentSession.userId);

      if (userIndex === -1) {
        return {
          success: false,
          error: 'User not found',
          message: 'User account not found'
        };
      }

      // Update user data
      const updatedUser = { ...users[userIndex], ...updates };
      (users as User[])[userIndex] = updatedUser;
      this.storageService.setUsers(users);

      // Update session if profile image changed
      if (updates.profileImage) {
        const updatedSession = { ...currentSession, profileImage: updates.profileImage };
        this.storageService.setSession(updatedSession);
        this.currentUserSignal.set(updatedSession);
        this.currentUserSubject.next(updatedSession);
      }

      return {
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: 'Profile update failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string, confirmPassword: string): ApiResponse<boolean> {
    try {
      const currentSession = this.currentUserSignal();
      if (!currentSession) {
        return {
          success: false,
          error: 'Not authenticated',
          message: 'You must be logged in to change your password'
        };
      }

      if (newPassword !== confirmPassword) {
        return {
          success: false,
          error: 'Passwords do not match',
          message: 'New password and confirm password must be the same'
        };
      }

      if (newPassword.length < 6) {
        return {
          success: false,
          error: 'Password too short',
          message: 'Password must be at least 6 characters long'
        };
      }

      const users = this.storageService.getUsers() as User[] || [];
      const user = users.find((u: User) => u.id === currentSession.userId);

      if (!user || !this.verifyPassword(user.email, currentPassword)) {
        return {
          success: false,
          error: 'Current password incorrect',
          message: 'The current password you entered is incorrect'
        };
      }

      // Update password
      (user as User).password = this.hashPassword(newPassword);
      this.storageService.setUsers(users);

      return {
        success: true,
        data: true,
        message: 'Password changed successfully'
      };

    } catch (error) {
      return {
        success: false,
        error: 'Password change failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get current user as signal
  getCurrentUserSignal() {
    return this.currentUserSignal;
  }

  // Get authentication status as signal
  getIsAuthenticatedSignal() {
    return this.isAuthenticatedSignal;
  }

  // Get admin status as signal
  getIsAdminSignal() {
    return this.isAdminSignal;
  }

  // Get current user as observable
  getCurrentUser(): Observable<UserSession | null> {
    return this.currentUser$;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.isAuthenticatedSignal();
  }

  // Check if user is admin
  isAdmin(): boolean {
    return this.isAdminSignal();
  }

  // Get current user value
  getCurrentUserValue(): UserSession | null {
    return this.currentUserSignal();
  }

  // Force refresh of authentication state
  refreshAuth(): void {
    this.initializeAuth();
  }
}
