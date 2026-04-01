import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './otp-verification.component.html',
  styleUrls: ['./otp-verification.component.scss']
})
export class OtpVerificationComponent implements OnInit {
  otpForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  email = '';
  timeLeft = 300; // 5 minutes in seconds
  canResend = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.getEmailFromRoute();
    this.startTimer();
  }

  private initForm(): void {
    this.otpForm = this.fb.group({
      otp: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]]
    });
  }

  private getEmailFromRoute(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
    });
  }

  private startTimer(): void {
    const timer = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        clearInterval(timer);
        this.canResend = true;
      }
    }, 1000);
  }

  get otp() {
    return this.otpForm.get('otp');
  }

  onSubmit(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const otpCode = this.otpForm.value.otp;

    // Simulate OTP verification
    setTimeout(() => {
      if (otpCode === '123456') { // Demo OTP for testing
        this.successMessage = 'OTP verified successfully! Redirecting to reset password...';
        setTimeout(() => {
          this.router.navigate(['/auth/reset-password'], { 
            queryParams: { email: this.email, otp: otpCode } 
          });
        }, 2000);
      } else {
        this.errorMessage = 'Invalid OTP. Please try again.';
      }
      this.isLoading = false;
    }, 1500);
  }

  resendOTP(): void {
    if (!this.canResend) return;

    this.canResend = false;
    this.timeLeft = 300;
    this.errorMessage = '';
    this.successMessage = 'New OTP sent to your email.';
    this.startTimer();
  }

  getOtpErrorMessage(): string {
    if (this.otp?.errors?.['required']) {
      return 'OTP is required';
    }
    if (this.otp?.errors?.['pattern']) {
      return 'OTP must be 6 digits';
    }
    return '';
  }

  formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  getOtpDigit(index: number): string {
    const otpValue = this.otp?.value || '';
    return otpValue[index] || '•';
  }

  goBack(): void {
    this.router.navigate(['/auth/forgot-password']);
  }
}
