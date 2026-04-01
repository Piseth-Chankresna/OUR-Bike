import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';

export interface SocialAuthConfig {
  google?: {
    clientId: string;
    scope?: string;
  };
  facebook?: {
    appId: string;
    scope?: string;
  };
  github?: {
    clientId: string;
    scope?: string;
  };
}

export interface SocialAuthUser {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  provider: 'google' | 'facebook' | 'github';
  providerId: string;
  accessToken?: string;
}

export interface SocialAuthResponse {
  success: boolean;
  user?: SocialAuthUser;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SocialAuthService {
  private readonly STORAGE_KEY = 'our_bikes_social_auth_config';
  
  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) {}

  // Get social auth configuration
  getConfig(): SocialAuthConfig {
    return this.storageService.get(this.STORAGE_KEY) as SocialAuthConfig || {
      google: {
        clientId: 'your-google-client-id.apps.googleusercontent.com',
        scope: 'email profile'
      },
      facebook: {
        appId: 'your-facebook-app-id',
        scope: 'email public_profile'
      },
      github: {
        clientId: 'your-github-client-id',
        scope: 'user:email'
      }
    };
  }

  // Update social auth configuration
  updateConfig(config: SocialAuthConfig): void {
    this.storageService.set(this.STORAGE_KEY, config);
  }

  // Authenticate with Google
  async authenticateWithGoogle(): Promise<SocialAuthResponse> {
    try {
      // In a real implementation, this would use Google's OAuth 2.0 flow
      // For demo purposes, we'll simulate the response
      const mockUser: SocialAuthUser = {
        id: 'google_' + Date.now(),
        email: 'user@gmail.com',
        name: 'Google User',
        firstName: 'Google',
        lastName: 'User',
        avatar: 'https://picsum.photos/seed/google-avatar/200/200.jpg',
        provider: 'google',
        providerId: 'google_' + Date.now()
      };

      return await this.handleSocialAuth(mockUser);
    } catch (error) {
      return {
        success: false,
        error: 'Google authentication failed'
      };
    }
  }

  // Authenticate with Facebook
  async authenticateWithFacebook(): Promise<SocialAuthResponse> {
    try {
      // In a real implementation, this would use Facebook's OAuth 2.0 flow
      // For demo purposes, we'll simulate the response
      const mockUser: SocialAuthUser = {
        id: 'facebook_' + Date.now(),
        email: 'user@facebook.com',
        name: 'Facebook User',
        firstName: 'Facebook',
        lastName: 'User',
        avatar: 'https://picsum.photos/seed/facebook-avatar/200/200.jpg',
        provider: 'facebook',
        providerId: 'facebook_' + Date.now()
      };

      return await this.handleSocialAuth(mockUser);
    } catch (error) {
      return {
        success: false,
        error: 'Facebook authentication failed'
      };
    }
  }

  // Authenticate with GitHub
  async authenticateWithGitHub(): Promise<SocialAuthResponse> {
    try {
      // In a real implementation, this would use GitHub's OAuth 2.0 flow
      // For demo purposes, we'll simulate the response
      const mockUser: SocialAuthUser = {
        id: 'github_' + Date.now(),
        email: 'user@github.com',
        name: 'GitHub User',
        firstName: 'GitHub',
        lastName: 'User',
        avatar: 'https://picsum.photos/seed/github-avatar/200/200.jpg',
        provider: 'github',
        providerId: 'github_' + Date.now()
      };

      return await this.handleSocialAuth(mockUser);
    } catch (error) {
      return {
        success: false,
        error: 'GitHub authentication failed'
      };
    }
  }

  // Handle social authentication response
  private async handleSocialAuth(socialUser: SocialAuthUser): Promise<SocialAuthResponse> {
    try {
      // Check if user already exists with this email
      const users = this.storageService.get('USERS') as any[] || [];
      const existingUser = users.find(u => u.email === socialUser.email);
      
      if (existingUser) {
        // User exists, log them in
        const loginSuccess = this.authService.login(existingUser.email);
        if (loginSuccess) {
          // Update user's social auth info
          this.updateUserSocialInfo(existingUser.id, socialUser);
          return { success: true, user: socialUser };
        } else {
          return {
            success: false,
            error: 'Login failed'
          };
        }
      } else {
        // Create new user from social auth
        const newUser = this.createUserFromSocialAuth(socialUser);
        if (newUser) {
          const loginSuccess = this.authService.login(newUser.email);
          if (loginSuccess) {
            return { success: true, user: socialUser };
          }
        }
        return {
          success: false,
          error: 'Failed to create user account'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Authentication processing failed'
      };
    }
  }

  // Create user from social authentication
  private createUserFromSocialAuth(socialUser: SocialAuthUser): any {
    try {
      const newUser = {
        id: this.storageService.generateId(),
        email: socialUser.email,
        password: 'social-auth-' + Date.now(), // Random password for social auth
        firstName: socialUser.firstName,
        lastName: socialUser.lastName,
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        },
        preferences: {
          newsletter: true,
          marketingEmails: false,
          notifications: true,
          language: 'en',
          currency: 'USD'
        },
        registeredDate: Date.now(),
        lastLogin: Date.now(),
        isActive: true,
        role: 'user',
        profilePicture: socialUser.avatar,
        socialAuth: {
          provider: socialUser.provider,
          providerId: socialUser.providerId,
          accessToken: socialUser.accessToken
        }
      };

      // Save user to storage
      const users = this.storageService.get('USERS') as any[] || [];
      users.push(newUser);
      this.storageService.set('USERS', users);

      return newUser;
    } catch (error) {
      console.error('Error creating user from social auth:', error);
      return null;
    }
  }

  // Update user's social authentication info
  private updateUserSocialInfo(userId: string, socialUser: SocialAuthUser): void {
    try {
      const users = this.storageService.get('USERS') as any[] || [];
      const userIndex = users.findIndex(u => u.id === userId);
      
      if (userIndex !== -1) {
        users[userIndex].socialAuth = {
          provider: socialUser.provider,
          providerId: socialUser.providerId,
          accessToken: socialUser.accessToken
        };
        users[userIndex].profilePicture = socialUser.avatar;
        users[userIndex].lastLogin = Date.now();
        
        this.storageService.set('USERS', users);
      }
    } catch (error) {
      console.error('Error updating user social info:', error);
    }
  }

  // Disconnect social account
  disconnectSocialAccount(provider: 'google' | 'facebook' | 'github'): boolean {
    try {
      const currentUser = this.authService.getCurrentUserSignal()();
      if (!currentUser) return false;

      const users = this.storageService.get('USERS') as any[] || [];
      const userIndex = users.findIndex(u => u.id === currentUser.userId);
      
      if (userIndex !== -1) {
        delete users[userIndex].socialAuth;
        this.storageService.set('USERS', users);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error disconnecting social account:', error);
      return false;
    }
  }

  // Get connected social accounts
  getConnectedAccounts(): string[] {
    try {
      const currentUser = this.authService.getCurrentUserSignal()();
      if (!currentUser) return [];

      // Get user from storage to check social auth
      const users = this.storageService.get('USERS') as any[] || [];
      const user = users.find(u => u.email === currentUser.email);
      
      if (user && user.socialAuth) {
        return [user.socialAuth.provider];
      }
      
      return [];
    } catch (error) {
      console.error('Error getting connected accounts:', error);
      return [];
    }
  }

  // Check if social account is connected
  isSocialAccountConnected(provider: 'google' | 'facebook' | 'github'): boolean {
    const connectedAccounts = this.getConnectedAccounts();
    return connectedAccounts.includes(provider);
  }

  // Get social auth URL (for real OAuth implementation)
  getSocialAuthUrl(provider: 'google' | 'facebook' | 'github'): string {
    const config = this.getConfig();
    
    switch (provider) {
      case 'google':
        return `https://accounts.google.com/oauth/authorize?client_id=${config.google?.clientId}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/social/google')}&scope=${config.google?.scope}&response_type=code`;
      
      case 'facebook':
        return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${config.facebook?.appId}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/social/facebook')}&scope=${config.facebook?.scope}&response_type=code`;
      
      case 'github':
        return `https://github.com/login/oauth/authorize?client_id=${config.github?.clientId}&redirect_uri=${encodeURIComponent(window.location.origin + '/auth/social/github')}&scope=${config.github?.scope}&response_type=code`;
      
      default:
        return '';
    }
  }

  // Handle social auth callback (for real OAuth implementation)
  async handleSocialAuthCallback(provider: 'google' | 'facebook' | 'github', code: string): Promise<SocialAuthResponse> {
    try {
      // In a real implementation, this would exchange the code for an access token
      // and fetch user information from the provider's API
      // For demo purposes, we'll call the mock authentication methods
      
      switch (provider) {
        case 'google':
          return await this.authenticateWithGoogle();
        case 'facebook':
          return await this.authenticateWithFacebook();
        case 'github':
          return await this.authenticateWithGitHub();
        default:
          return {
            success: false,
            error: 'Unknown provider'
          };
      }
    } catch (error) {
      return {
        success: false,
        error: 'Social authentication callback failed'
      };
    }
  }

  // Validate social auth configuration
  validateConfig(config: SocialAuthConfig): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (config.google) {
      if (!config.google.clientId) {
        errors.push('Google client ID is required');
      }
    }
    
    if (config.facebook) {
      if (!config.facebook.appId) {
        errors.push('Facebook app ID is required');
      }
    }
    
    if (config.github) {
      if (!config.github.clientId) {
        errors.push('GitHub client ID is required');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
