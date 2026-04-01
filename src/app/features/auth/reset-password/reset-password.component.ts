import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  email = '';
  otp = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getQueryParams();
  }

  private initForm(): void {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, { validator: this.passwordMatchValidator });
  }

  private getQueryParams(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.otp = params['otp'] || '';
      
      // If no email or OTP, redirect to forgot password
      if (!this.email || !this.otp) {
        this.router.navigate(['/auth/forgot-password']);
      }
    });
  }

  passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword !== confirmPassword) {
      return { passwordMismatch: true };
    }
    return null;
  }

  get newPassword() {
    return this.resetPasswordForm.get('newPassword');
  }

  get confirmPassword() {
    return this.resetPasswordForm.get('confirmPassword');
  }

  onSubmit(): void {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const newPassword = this.resetPasswordForm.value.newPassword;

    // Simulate password reset
    setTimeout(() => {
      this.successMessage = 'Password reset successfully! Redirecting to login...';
      this.isLoading = false;
      
      setTimeout(() => {
        this.router.navigate(['/auth/user/login']);
      }, 2000);
    }, 2000);
  }

  getNewPasswordErrorMessage(): string {
    if (this.newPassword?.errors?.['required']) {
      return 'New password is required';
    }
    if (this.newPassword?.errors?.['minlength']) {
      return 'Password must be at least 6 characters';
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    if (this.confirmPassword?.errors?.['required']) {
      return 'Confirm password is required';
    }
    if (this.confirmPassword?.errors?.['minlength']) {
      return 'Password must be at least 6 characters';
    }
    if (this.resetPasswordForm.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }
    return '';
  }

  goBack(): void {
    this.router.navigate(['/auth/otp-verification'], { 
      queryParams: { email: this.email } 
    });
  }
}
