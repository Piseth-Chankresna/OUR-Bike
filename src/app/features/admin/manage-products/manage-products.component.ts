import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-manage-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-custom py-5">
      <h2 class="heading-2 mb-4">Manage Products</h2>
      <div class="alert alert-info">
        <i class="bi bi-info-circle me-2"></i>
        Product management page is under construction.
      </div>
    </div>
  `,
  styles: []
})
export class ManageProductsComponent {}
