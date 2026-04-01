import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserLogin, ApiResponse, UserSession } from '../../../core/models';
import { CustomValidators } from '../../../core/validators/custom-validators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required, 
        CustomValidators.emailValidator(),
        CustomValidators.maxLength(100, 'Email address is too long')
      ]],
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        CustomValidators.maxLength(50, 'Password is too long')
      ]]
    });
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to home
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const loginData: UserLogin = {
      email: this.loginForm.value.email?.trim(),
      password: this.loginForm.value.password
    };

    this.authService.login(loginData).subscribe({
      next: (response: ApiResponse<UserSession>) => {
        this.isLoading = false;
        
        if (response.success && response.data) {
          // Redirect based on user role
          if (response.data.role === 'admin') {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate([this.returnUrl]);
          }
        } else {
          this.errorMessage = response.message || 'Login failed';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'An unexpected error occurred. Please try again.';
        console.error('Login error:', error);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // Helper method to mark all controls as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Get form control for easier access in template
  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  // Get error messages using CustomValidators
  getEmailErrorMessage(): string {
    if (this.email?.errors) {
      return CustomValidators.getErrorMessage(this.email.errors);
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.password?.errors) {
      return CustomValidators.getErrorMessage(this.password.errors);
    }
    return '';
  }
}
