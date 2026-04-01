import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-selection',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-selection.component.html',
  styleUrls: ['./auth-selection.component.scss']
})
export class AuthSelectionComponent {
  constructor(private router: Router) {}

  selectAdmin(): void {
    this.router.navigate(['/auth/admin/login']);
  }

  selectUser(): void {
    this.router.navigate(['/auth/user/login']);
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
