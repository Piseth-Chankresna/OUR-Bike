import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { SeedDataService } from '../../../core/services/seed-data.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isPasswordVisible = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private storageService: StorageService,
    private seedDataService: SeedDataService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.clearAndReseed();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const credentials = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    // Debug: Check what users are in storage
    const allUsers = this.storageService.getUsers() as any[] || [];
    console.log('All users in storage:', allUsers);
    console.log('Trying to login with:', credentials);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login response:', response);
        if (response.success && response.data) {
          // Check if user has admin role
          const session = response.data;
          if (session.role === 'admin') {
            this.successMessage = 'Admin login successful! Redirecting...';
            setTimeout(() => {
              this.router.navigate(['/admin']);
            }, 1500);
          } else {
            this.errorMessage = 'Access denied. Admin privileges required.';
            this.authService.logout();
          }
        } else {
          this.errorMessage = response.message || 'Login failed';
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage = error.message || 'Login failed. Please try again.';
        this.isLoading = false;
      }
    });
  }

  getEmailErrorMessage(): string {
    if (this.email?.errors?.['required']) {
      return 'Email is required';
    }
    if (this.email?.errors?.['email']) {
      return 'Please enter a valid email';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.password?.errors?.['required']) {
      return 'Password is required';
    }
    if (this.password?.errors?.['minlength']) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  clearAndReseed(): void {
    console.log('🔄 Clearing old data and reseeding admin account...');
    // Clear all existing users
    this.storageService.setUsers([]);
    // Force reseed data (this will add the admin account)
    this.seedDataService.initializeSeedData();
    this.successMessage = 'Admin account reseeded! Please try logging in again.';
    this.errorMessage = '';
  }

  togglePasswordVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  getDemoCredentials(): { email: string; password: string }[] {
    return [
      { email: 'pisethchankresna@gmail.com', password: 'Sna#123$123$' }
    ];
  }
}
