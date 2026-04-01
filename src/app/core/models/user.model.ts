export interface User {
  id: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  fullName: string;
  phoneNumber: string;
  address: string;
  profileImage?: string;
  registeredDate: number;
}

export interface UserSession {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  fullName: string;
  profileImage?: string;
  loginTime: number;
}

export interface UserRegistration {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  role?: 'admin' | 'user';
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserProfileUpdate {
  fullName?: string;
  phoneNumber?: string;
  address?: string;
  profileImage?: string;
}
