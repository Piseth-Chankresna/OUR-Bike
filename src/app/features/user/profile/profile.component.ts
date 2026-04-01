import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { StorageService } from '../../../core/services/storage.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserSession } from '../../../core/models';

interface User {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  avatar?: string;
  addresses?: Address[];
  preferences?: UserPreferences;
  createdAt: number;
  lastLoginAt: number;
}

interface Address {
  id: string;
  type: 'shipping' | 'billing';
  firstName: string;
  lastName: string;
  company?: string;
  address: string;
  apartment?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault: boolean;
}

interface UserPreferences {
  newsletter: boolean;
  notifications: boolean;
  marketing: boolean;
  language: string;
  currency: string;
}

interface Order {
  id: string;
  userId: string;
  products: any[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: number;
  customerName: string;
  customerEmail: string;
  shippingAddress: string;
  trackingNumber?: string;
  estimatedDelivery?: number;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  currentUser: User | null = null;
  isLoading = true;
  
  // Make Object and Date available in template
  Object = Object;
  Date = Date;
  
  // Forms
  profileForm!: FormGroup;
  addressForm!: FormGroup;
  passwordForm!: FormGroup;
  preferencesForm!: FormGroup;
  
  // UI States
  activeTab = 'overview';
  showEditProfile = false;
  showAddAddress = false;
  showEditAddress = false;
  showPasswordChange = false;
  showAccountDeletion = false;
  showProfilePictureUpload = false;
  
  // Profile Picture
  profilePictureUrl: string | null = null;
  uploadingPicture = false;
  
  // Data
  userOrders: Order[] = [];
  userAddresses: Address[] = [];
  editingAddress: Address | null = null;
  
  // Statistics
  totalOrders = 0;
  totalSpent = 0;
  pendingOrders = 0;
  completedOrders = 0;
  
  // Form Options
  genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
  countryOptions = ['Cambodia', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'China', 'India'];
  languageOptions = ['English', 'Khmer', 'Chinese', 'French', 'German', 'Japanese', 'Spanish'];
  currencyOptions = ['USD', 'KHR', 'EUR', 'GBP', 'JPY', 'CNY'];

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private initializeComponent(): void {
    // Check authentication
    const userSession = this.authService.getCurrentUserValue();
    
    if (!userSession) {
      window.location.href = '/auth/login';
      return;
    }

    // Get full user data from storage
    const users = this.storageService.getUsers() as User[] || [];
    const fullUser = users.find(u => u.userId === userSession.userId);
    
    if (fullUser) {
      this.currentUser = fullUser;
    } else {
      window.location.href = '/auth/login';
      return;
    }

    // Initialize forms
    this.initializeForms();
    
    // Load user data
    this.loadUserData();
    
    // Load user orders
    this.loadUserOrders();
    
    // Load user addresses
    this.loadUserAddresses();
  }

  private initializeForms(): void {
    // Profile Form
    this.profileForm = this.fb.group({
      firstName: [this.currentUser?.firstName || '', [Validators.required]],
      lastName: [this.currentUser?.lastName || '', [Validators.required]],
      phone: [this.currentUser?.phone || ''],
      dateOfBirth: [this.currentUser?.dateOfBirth || ''],
      gender: [this.currentUser?.gender || '']
    });

    // Address Form
    this.addressForm = this.fb.group({
      type: ['shipping', Validators.required],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      company: [''],
      address: ['', Validators.required],
      apartment: [''],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['Cambodia', Validators.required],
      isDefault: [false]
    });

    // Password Form
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });

    // Preferences Form
    this.preferencesForm = this.fb.group({
      newsletter: [this.currentUser?.preferences?.newsletter ?? true],
      notifications: [this.currentUser?.preferences?.notifications ?? true],
      marketing: [this.currentUser?.preferences?.marketing ?? false],
      language: [this.currentUser?.preferences?.language ?? 'English'],
      currency: [this.currentUser?.preferences?.currency ?? 'USD']
    });
  }

  private passwordMatchValidator(g: FormGroup): any {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  private loadUserData(): void {
    try {
      const users = this.storageService.getUsers() as User[] || [];
      const user = users.find(u => u.userId === this.currentUser?.userId) as any;
      
      if (user) {
        this.currentUser = user;
        this.profilePictureUrl = user.avatar || null;
        
        this.profileForm.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender
        });
        
        this.preferencesForm.patchValue({
          newsletter: user.preferences?.newsletter ?? true,
          notifications: user.preferences?.notifications ?? true,
          marketing: user.preferences?.marketing ?? false,
          language: user.preferences?.language ?? 'English',
          currency: user.preferences?.currency ?? 'USD'
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  private loadUserOrders(): void {
    try {
      const allOrders = this.storageService.getOrders() as any[] || [];
      this.userOrders = allOrders
        .filter(order => order.userId === this.currentUser?.userId)
        .sort((a, b) => b.orderDate - a.orderDate);
      
      // Calculate statistics
      this.calculateOrderStatistics();
    } catch (error) {
      console.error('Error loading user orders:', error);
    }
  }

  private loadUserAddresses(): void {
    try {
      if (this.currentUser?.userId) {
        const addresses = this.storageService.getUserAddresses(this.currentUser.userId) || [];
        this.userAddresses = addresses;
      }
    } catch (error) {
      console.error('Error loading user addresses:', error);
    }
  }

  private calculateOrderStatistics(): void {
    this.totalOrders = this.userOrders.length;
    this.totalSpent = this.userOrders
      .filter(order => order.status !== 'cancelled')
      .reduce((sum, order) => sum + order.totalAmount, 0);
    this.pendingOrders = this.userOrders.filter(order => 
      ['pending', 'processing', 'shipped'].includes(order.status)
    ).length;
    this.completedOrders = this.userOrders.filter(order => 
      ['delivered'].includes(order.status)
    ).length;
  }

  // Tab Management
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Profile Management
  toggleEditProfile(): void {
    this.showEditProfile = !this.showEditProfile;
    if (this.showEditProfile) {
      this.profileForm.patchValue({
        firstName: this.currentUser?.firstName,
        lastName: this.currentUser?.lastName,
        phone: this.currentUser?.phone,
        dateOfBirth: this.currentUser?.dateOfBirth,
        gender: this.currentUser?.gender
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.valid) {
      try {
        const users = this.storageService.getUsers() as User[] || [];
        const userIndex = users.findIndex(u => u.userId === this.currentUser?.userId);
        
        if (userIndex !== -1) {
          users[userIndex] = {
            ...users[userIndex],
            ...this.profileForm.value
          };
          
          this.storageService.setUsers(users);
          this.currentUser = users[userIndex];
          this.showEditProfile = false;
          alert('Profile updated successfully!');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Failed to update profile');
      }
    }
  }

  cancelEditProfile(): void {
    this.showEditProfile = false;
    this.profileForm.reset();
  }

  // Address Management
  toggleAddAddress(): void {
    this.showAddAddress = !this.showAddAddress;
    this.editingAddress = null;
    this.addressForm.reset({
      type: 'shipping',
      country: 'Cambodia',
      isDefault: false
    });
  }

  editAddress(address: Address): void {
    this.editingAddress = address;
    this.showEditAddress = true;
    this.addressForm.patchValue(address);
  }

  saveAddress(): void {
    if (this.addressForm.valid) {
      try {
        const addressData = this.addressForm.value;
        
        if (this.editingAddress) {
          // Update existing address
          const index = this.userAddresses.findIndex(a => a.id === this.editingAddress?.id);
          if (index !== -1) {
            this.userAddresses[index] = { ...addressData, id: this.editingAddress.id };
          }
        } else {
          // Add new address
          const newAddress: Address = {
            ...addressData,
            id: this.storageService.generateId()
          };
          this.userAddresses.push(newAddress);
        }
        
        // Save to storage
        if (this.currentUser?.userId) {
          this.storageService.setUserAddresses(this.currentUser.userId, this.userAddresses);
        }
        
        // Reset forms
        this.showAddAddress = false;
        this.showEditAddress = false;
        this.editingAddress = null;
        this.addressForm.reset();
        
        alert('Address saved successfully!');
      } catch (error) {
        console.error('Error saving address:', error);
        alert('Failed to save address');
      }
    }
  }

  deleteAddress(addressId: string): void {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        this.userAddresses = this.userAddresses.filter(a => a.id !== addressId);
        if (this.currentUser?.userId) {
          this.storageService.setUserAddresses(this.currentUser.userId, this.userAddresses);
        }
        alert('Address deleted successfully!');
      } catch (error) {
        console.error('Error deleting address:', error);
        alert('Failed to delete address');
      }
    }
  }

  setDefaultAddress(addressId: string): void {
    try {
      if (this.currentUser?.userId) {
        this.userAddresses.forEach(address => {
          address.isDefault = address.id === addressId;
        });
        
        this.storageService.setUserAddresses(this.currentUser.userId, this.userAddresses);
        alert('Default address updated!');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to set default address');
    }
  }

  cancelAddress(): void {
    this.showAddAddress = false;
    this.showEditAddress = false;
    this.editingAddress = null;
    this.addressForm.reset();
  }

  // Password Management
  togglePasswordChange(): void {
    this.showPasswordChange = !this.showPasswordChange;
    this.passwordForm.reset();
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      try {
        const { currentPassword, newPassword } = this.passwordForm.value;
        
        // Verify current password (in real app, this would be server-side)
        if (this.currentUser?.email && this.authService.verifyPassword(this.currentUser.email, currentPassword)) {
          // Update password
          const users = this.storageService.getUsers() as User[] || [];
          const userIndex = users.findIndex(u => u.userId === this.currentUser?.userId);
          
          if (userIndex !== -1) {
            users[userIndex] = {
              ...users[userIndex],
              password: this.authService.hashPassword(newPassword)
            } as any;
            
            this.storageService.setUsers(users);
            this.showPasswordChange = false;
            this.passwordForm.reset();
            alert('Password changed successfully!');
          }
        } else {
          alert('Current password is incorrect');
        }
      } catch (error) {
        console.error('Error changing password:', error);
        alert('Failed to change password');
      }
    }
  }

  cancelPasswordChange(): void {
    this.showPasswordChange = false;
    this.passwordForm.reset();
  }

  // Preferences Management
  savePreferences(): void {
    if (this.preferencesForm.valid) {
      try {
        const users = this.storageService.getUsers() as User[] || [];
        const userIndex = users.findIndex(u => u.userId === this.currentUser?.userId);
        
        if (userIndex !== -1) {
          users[userIndex] = {
            ...users[userIndex],
            preferences: this.preferencesForm.value
          };
          
          this.storageService.setUsers(users);
          this.currentUser = users[userIndex];
          alert('Preferences saved successfully!');
        }
      } catch (error) {
        console.error('Error saving preferences:', error);
        alert('Failed to save preferences');
      }
    }
  }

  // Account Management
  toggleAccountDeletion(): void {
    this.showAccountDeletion = !this.showAccountDeletion;
  }

  deleteAccount(): void {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (confirm('This will permanently delete all your data including orders, addresses, and preferences. Are you absolutely sure?')) {
        try {
          // Remove user from users list
          const users = this.storageService.getUsers() as User[] || [];
          const filteredUsers = users.filter(u => u.userId !== this.currentUser?.userId);
          this.storageService.setUsers(filteredUsers);
          
          // Clear user session
          this.authService.logout();
          
          // Redirect to home
          window.location.href = '/';
        } catch (error) {
          console.error('Error deleting account:', error);
          alert('Failed to delete account');
        }
      }
    }
  }

  // Utility Methods
  formatDate(date: number): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  getOrderStatusColor(status: string): string {
    const colors = {
      pending: 'warning',
      processing: 'info',
      shipped: 'primary',
      delivered: 'success',
      cancelled: 'danger'
    };
    return colors[status as keyof typeof colors] || 'secondary';
  }

  getOrderStatusText(status: string): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  // Navigation
  goToOrder(orderId: string): void {
    // Navigate to order detail
    window.location.href = `/orders/${orderId}`;
  }

  goToProduct(productId: string): void {
    window.location.href = `/products/${productId}`;
  }

  // Profile Picture Management
  toggleProfilePictureUpload(): void {
    this.showProfilePictureUpload = !this.showProfilePictureUpload;
  }

  onProfilePictureSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.match('image.*')) {
        alert('Please select an image file (JPEG, PNG, etc.)');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }
      
      this.uploadProfilePicture(file);
    }
  }

  uploadProfilePicture(file: File): void {
    this.uploadingPicture = true;
    
    // Create a FileReader to read the file
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        // Convert to base64 and save
        const base64Image = e.target.result as string;
        this.saveProfilePicture(base64Image);
      }
    };
    
    reader.onerror = () => {
      alert('Failed to read the image file');
      this.uploadingPicture = false;
    };
    
    reader.readAsDataURL(file);
  }

  saveProfilePicture(base64Image: string): void {
    try {
      if (this.currentUser?.userId) {
        // Save to user data
        const users = this.storageService.getUsers() as any[] || [];
        const userIndex = users.findIndex(u => u.userId === this.currentUser?.userId);
        
        if (userIndex !== -1) {
          users[userIndex].avatar = base64Image;
          this.storageService.setUsers(users);
          
          // Update local state
          this.currentUser = users[userIndex];
          this.profilePictureUrl = base64Image;
          
          this.showProfilePictureUpload = false;
          this.uploadingPicture = false;
          alert('Profile picture updated successfully!');
        }
      }
    } catch (error) {
      console.error('Error saving profile picture:', error);
      alert('Failed to save profile picture');
      this.uploadingPicture = false;
    }
  }

  removeProfilePicture(): void {
    if (confirm('Are you sure you want to remove your profile picture?')) {
      try {
        if (this.currentUser?.userId) {
          const users = this.storageService.getUsers() as any[] || [];
          const userIndex = users.findIndex(u => u.userId === this.currentUser?.userId);
          
          if (userIndex !== -1) {
            users[userIndex].avatar = null;
            this.storageService.setUsers(users);
            
            // Update local state
            this.currentUser = users[userIndex];
            this.profilePictureUrl = null;
            
            alert('Profile picture removed successfully!');
          }
        }
      } catch (error) {
        console.error('Error removing profile picture:', error);
        alert('Failed to remove profile picture');
      }
    }
  }

  // Modal Management
  closeProfilePictureUpload(): void {
    this.showProfilePictureUpload = false;
  }

  triggerFileInput(): void {
    const input = document.getElementById('profilePictureInput') as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  // Logout functionality
  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.router.navigate(['/auth']);
    }
  }
}
