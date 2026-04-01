import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SocialAuthService } from '../../../core/services/social-auth.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-social-login',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './social-login.component.html',
  styleUrls: ['./social-login.component.scss']
})
export class SocialLoginComponent implements OnInit {
  isLoading = false;
  linkedAccounts: string[] = [];
  
  // Available providers
  providers = [
    { id: 'google', name: 'Google', icon: 'bi-google', color: '#4285f4' },
    { id: 'facebook', name: 'Facebook', icon: 'bi-facebook', color: '#1877f2' },
    { id: 'github', name: 'GitHub', icon: 'bi-github', color: '#333333' }
  ];

  private socialAuthService = inject(SocialAuthService);
  private authService = inject(AuthService);

  ngOnInit(): void {
    this.loadLinkedAccounts();
  }

  // Load connected social accounts
  private loadLinkedAccounts(): void {
    this.linkedAccounts = this.socialAuthService.getConnectedAccounts();
  }

  // Sign in with social provider
  async signInWithProvider(provider: string): Promise<void> {
    this.isLoading = true;
    
    try {
      let response;
      
      switch (provider) {
        case 'google':
          response = await this.socialAuthService.authenticateWithGoogle();
          break;
        case 'facebook':
          response = await this.socialAuthService.authenticateWithFacebook();
          break;
        case 'github':
          response = await this.socialAuthService.authenticateWithGitHub();
          break;
        default:
          console.warn('Unknown provider:', provider);
          return;
      }

      if (response.success) {
        // Reload linked accounts
        this.loadLinkedAccounts();
      } else {
        console.error('Social auth failed:', response.error);
      }
    } catch (error) {
      console.error('Error during social authentication:', error);
    } finally {
      this.isLoading = false;
    }
  }

  // Check if user is logged in
  get isLoggedIn(): boolean {
    return this.authService.getCurrentUserSignal()() !== null;
  }

  // Check if provider is linked
  isProviderLinked(provider: string): boolean {
    return this.linkedAccounts.includes(provider);
  }

  // Disconnect social account
  disconnectAccount(provider: string): void {
    const success = this.socialAuthService.disconnectSocialAccount(provider as 'google' | 'facebook' | 'github');
    if (success) {
      this.loadLinkedAccounts();
    }
  }

  // Get provider icon
  getProviderIcon(provider: string): string {
    const providerInfo = this.providers.find(p => p.id === provider);
    return providerInfo?.icon || 'bi-question-circle';
  }

  // Get provider color
  getProviderColor(provider: string): string {
    const providerInfo = this.providers.find(p => p.id === provider);
    return providerInfo?.color || '#6c757d';
  }

  // Get provider name
  getProviderName(provider: string): string {
    const providerInfo = this.providers.find(p => p.id === provider);
    return providerInfo?.name || provider;
  }
}
