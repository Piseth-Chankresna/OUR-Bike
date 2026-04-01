import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-admin-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './admin-register.component.html',
  styleUrls: ['./admin-register.component.scss']
})
export class AdminRegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  adminKeyRequired = 'ADMIN2024';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$')]],
      confirmPassword: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,15}$')]],
      address: ['', [Validators.required, Validators.minLength(5)]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  get fullName() {
    return this.registerForm.get('fullName');
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }

  get phoneNumber() {
    return this.registerForm.get('phoneNumber');
  }

  get address() {
    return this.registerForm.get('address');
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const registrationData = {
      fullName: this.registerForm.value.fullName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      confirmPassword: this.registerForm.value.confirmPassword,
      phoneNumber: this.registerForm.value.phoneNumber,
      address: this.registerForm.value.address,
      role: 'admin' as const
    };

    this.authService.register(registrationData).subscribe({
      next: (response) => {
        if (response.success) {
          this.successMessage = 'Admin registration successful! Redirecting to login...';
          setTimeout(() => {
            this.router.navigate(['/auth/admin/login']);
          }, 2000);
        } else {
          this.errorMessage = response.message || 'Admin registration failed';
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = error.message || 'Admin registration failed. Please try again.';
        this.isLoading = false;
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

  getFullNameErrorMessage(): string {
    if (this.fullName?.errors?.['required']) {
      return 'Full name is required';
    }
    if (this.fullName?.errors?.['minlength']) {
      return 'Full name must be at least 2 characters';
    }
    return '';
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
      return 'Password must be at least 8 characters';
    }
    if (this.password?.errors?.['pattern']) {
      return 'Password must contain uppercase, lowercase, number, and special character';
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    if (this.confirmPassword?.errors?.['required']) {
      return 'Please confirm your password';
    }
    if (this.registerForm.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }
    return '';
  }

  getPhoneNumberErrorMessage(): string {
    if (this.phoneNumber?.errors?.['required']) {
      return 'Phone number is required';
    }
    if (this.phoneNumber?.errors?.['pattern']) {
      return 'Please enter a valid phone number';
    }
    return '';
  }

  getAddressErrorMessage(): string {
    if (this.address?.errors?.['required']) {
      return 'Address is required';
    }
    if (this.address?.errors?.['minlength']) {
      return 'Address must be at least 5 characters';
    }
    return '';
  }
}
