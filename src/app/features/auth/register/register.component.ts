import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UserRegistration, ApiResponse, User } from '../../../core/models';
import { CustomValidators } from '../../../core/validators/custom-validators';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  returnUrl = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [
        Validators.required, 
        CustomValidators.minLength(2, 'Full name must be at least 2 characters'),
        CustomValidators.maxLength(50, 'Full name is too long'),
        Validators.pattern(/^[a-zA-Z\s]+$/) // Only letters and spaces
      ]],
      email: '',
      phoneNumber: '',
      address: '',
      password: '',
      confirmPassword: '',
      role: ['user']
    });

    // Set individual field validators
    this.registerForm.get('email')?.setValidators([
      Validators.required, 
      CustomValidators.emailValidator(),
      CustomValidators.maxLength(100, 'Email address is too long')
    ]);
    
    this.registerForm.get('phoneNumber')?.setValidators([
      Validators.required, 
      CustomValidators.phoneValidator(),
      CustomValidators.maxLength(20, 'Phone number is too long')
    ]);
    
    this.registerForm.get('address')?.setValidators([
      Validators.required, 
      CustomValidators.minLength(5, 'Address must be at least 5 characters'),
      CustomValidators.maxLength(200, 'Address is too long')
    ]);
    
    this.registerForm.get('password')?.setValidators([
      Validators.required, 
      Validators.minLength(8),
      CustomValidators.passwordStrengthValidator(),
      CustomValidators.maxLength(50, 'Password is too long')
    ]);
    
    this.registerForm.get('confirmPassword')?.setValidators([
      Validators.required,
      CustomValidators.passwordMatchValidator('password')
    ]);
  }

  ngOnInit(): void {
    // Get return URL from route parameters or default to home
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
    
    // Redirect if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  // Custom validator for password matching
  passwordMatchValidator(formGroup: FormGroup): Record<string, boolean> | null {
    const password = formGroup.get('password');
    const confirmPassword = formGroup.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword && confirmPassword.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const registrationData: UserRegistration = {
      fullName: this.registerForm.value.fullName?.trim(),
      email: this.registerForm.value.email?.trim().toLowerCase(),
      phoneNumber: this.registerForm.value.phoneNumber?.trim(),
      address: this.registerForm.value.address?.trim(),
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword,
      role: this.registerForm.value.role
    };

    this.authService.register(registrationData).subscribe({
      next: (response: ApiResponse<User>) => {
        this.isLoading = false;
        
        if (response.success && response.data) {
          this.successMessage = 'Registration successful! Redirecting to your dashboard...';
          
          // Redirect after successful registration
          setTimeout(() => {
            const userRole = response.data?.role || 'user';
            if (userRole === 'admin') {
              this.router.navigate(['/admin']);
            } else {
              this.router.navigate([this.returnUrl]);
            }
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Registration failed';
        }
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = 'An unexpected error occurred. Please try again.';
        console.error('Registration error:', error);
      }
    });
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
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

  // Get form controls for easier access in template
  get fullName() { return this.registerForm.get('fullName'); }
  get email() { return this.registerForm.get('email'); }
  get phoneNumber() { return this.registerForm.get('phoneNumber'); }
  get address() { return this.registerForm.get('address'); }
  get password() { return this.registerForm.get('password'); }
  get confirmPassword() { return this.registerForm.get('confirmPassword'); }
  get role() { return this.registerForm.get('role'); }

  // Get error messages using CustomValidators
  getFullNameErrorMessage(): string {
    if (this.fullName?.errors) {
      return CustomValidators.getErrorMessage(this.fullName.errors);
    }
    return '';
  }

  getEmailErrorMessage(): string {
    if (this.email?.errors) {
      return CustomValidators.getErrorMessage(this.email.errors);
    }
    return '';
  }

  getPhoneNumberErrorMessage(): string {
    if (this.phoneNumber?.errors) {
      return CustomValidators.getErrorMessage(this.phoneNumber.errors);
    }
    return '';
  }

  getAddressErrorMessage(): string {
    if (this.address?.errors) {
      return CustomValidators.getErrorMessage(this.address.errors);
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.password?.errors) {
      return CustomValidators.getErrorMessage(this.password.errors);
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    if (this.confirmPassword?.errors) {
      return CustomValidators.getErrorMessage(this.confirmPassword.errors);
    }
    return '';
  }
}
