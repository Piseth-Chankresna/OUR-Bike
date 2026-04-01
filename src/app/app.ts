import { Component, signal, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SeedDataService } from './core/services/seed-data-fixed.service';
import { HeaderComponent } from './shared/components/header/header.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { AdminHeaderComponent } from './features/admin/shared/admin-header/admin-header.component';
import { ToastContainerComponent } from './shared/components/toast-container/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    HeaderComponent,
    FooterComponent,
    AdminHeaderComponent,
    ToastContainerComponent
  ],
  schemas: [], // Add schemas to suppress custom element warnings
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected readonly title = signal('our-bikes-store');

  constructor(
    private seedDataService: SeedDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize seed data when app starts
    this.seedDataService.initializeSeedData();
  }

  // Check if current route is an admin route
  isAdminRoute(): boolean {
    return this.router.url.startsWith('/admin');
  }
}
