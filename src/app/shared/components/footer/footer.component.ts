import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  newsletterForm: FormGroup;
  showBackToTop = false;
  currentYear = new Date().getFullYear();

  constructor(private fb: FormBuilder) {
    this.newsletterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit(): void {
    // Back to top button scroll detection
    window.addEventListener('scroll', () => {
      this.showBackToTop = window.pageYOffset > 300;
    });
  }

  onNewsletterSubmit(): void {
    if (this.newsletterForm.valid) {
      const email = this.newsletterForm.value.email;
      // Store newsletter subscription in localStorage
      const subscriptions = JSON.parse(localStorage.getItem('newsletter_subscriptions') || '[]');
      if (!subscriptions.includes(email)) {
        subscriptions.push(email);
        localStorage.setItem('newsletter_subscriptions', JSON.stringify(subscriptions));
        alert('Thank you for subscribing to our newsletter!');
        this.newsletterForm.reset();
      } else {
        alert('This email is already subscribed!');
      }
    }
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
