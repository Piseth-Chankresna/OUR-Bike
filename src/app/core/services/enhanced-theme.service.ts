import { Injectable, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ThemeVariant {
  id: string;
  name: string;
  displayName: string;
  isDark: boolean;
  colors: ThemeColors;
  custom: boolean;
}

export interface ThemeColors {
  // Primary colors
  '--primary-color': string;
  '--primary-hover': string;
  '--primary-light': string;
  '--primary-dark': string;
  
  // Background colors
  '--bg-primary': string;
  '--bg-secondary': string;
  '--bg-tertiary': string;
  '--bg-card': string;
  
  // Text colors
  '--text-primary': string;
  '--text-secondary': string;
  '--text-muted': string;
  '--text-inverse': string;
  
  // Border colors
  '--border-color': string;
  '--border-light': string;
  '--border-dark': string;
  
  // Status colors
  '--success-color': string;
  '--warning-color': string;
  '--danger-color': string;
  '--info-color': string;
  
  // Glassmorphism
  '--glass-bg': string;
  '--glass-border': string;
  '--glass-shadow': string;
  
  // Overlay colors
  '--overlay-bg': string;
  '--modal-bg': string;
  '--dropdown-bg': string;
}

export interface UserThemePreferences {
  preferredTheme: string;
  systemThemeDetection: boolean;
  autoSwitchSchedule: boolean;
  lightStartTime: string;
  darkStartTime: string;
  weekendsOnly: boolean;
  timezone: string;
  customThemes: ThemeVariant[];
  recentlyUsed: string[];
  favoriteThemes: string[];
}

export interface ThemeSchedule {
  enabled: boolean;
  lightTheme: string;
  darkTheme: string;
  lightTime: string; // HH:MM format
  darkTime: string;  // HH:MM format
  weekendsOnly: boolean;
  timezone: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnhancedThemeService implements OnDestroy {
  private readonly STORAGE_KEY = 'our_bikes_enhanced_theme_preferences';
  private readonly CURRENT_THEME_KEY = 'our_bikes_current_theme';
  
  private currentTheme$ = new BehaviorSubject<ThemeVariant>(this.getDefaultLightTheme());
  private themePreferences$ = new BehaviorSubject<UserThemePreferences>(this.getDefaultPreferences());
  private systemTheme$ = new BehaviorSubject<'light' | 'dark'>('light');
  
  private scheduleInterval: any;
  private mediaQuery: MediaQueryList | null = null;

  constructor(@Inject(PLATFORM_ID) private platformId: object) {
    this.initializeTheme();
  }

  // Get current theme as observable
  getCurrentTheme(): Observable<ThemeVariant> {
    return this.currentTheme$.asObservable();
  }

  // Get theme preferences as observable
  getThemePreferences(): Observable<UserThemePreferences> {
    return this.themePreferences$.asObservable();
  }

  // Get system theme as observable
  getSystemTheme(): Observable<'light' | 'dark'> {
    return this.systemTheme$.asObservable();
  }

  // Initialize theme system
  private initializeTheme(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.loadPreferences();
    this.setupSystemThemeDetection();
    this.setupThemeSchedule();
    this.applyTheme(this.getCurrentStoredTheme());
  }

  // Load user preferences
  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const preferences = stored ? JSON.parse(stored) : this.getDefaultPreferences();
      this.themePreferences$.next(preferences);
    } catch (error) {
      console.error('Error loading theme preferences:', error);
      this.themePreferences$.next(this.getDefaultPreferences());
    }
  }

  // Get default preferences
  private getDefaultPreferences(): UserThemePreferences {
    return {
      preferredTheme: 'light-default',
      systemThemeDetection: true,
      autoSwitchSchedule: false,
      lightStartTime: '06:00',
      darkStartTime: '20:00',
      weekendsOnly: false,
      timezone: 'UTC',
      customThemes: [],
      recentlyUsed: [],
      favoriteThemes: []
    };
  }

  // Setup system theme detection
  private setupSystemThemeDetection(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleThemeChange = (e: MediaQueryListEvent) => {
      this.systemTheme$.next(e.matches ? 'dark' : 'light');
      
      const preferences = this.themePreferences$.value;
      if (preferences.systemThemeDetection) {
        this.switchToSystemTheme();
      }
    };

    this.mediaQuery.addEventListener('change', handleThemeChange);
    
    // Set initial system theme
    this.systemTheme$.next(this.mediaQuery.matches ? 'dark' : 'light');
  }

  // Setup theme schedule
  private setupThemeSchedule(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    // Check every minute
    this.scheduleInterval = setInterval(() => {
      this.checkScheduledTheme();
    }, 60000);

    // Check immediately
    this.checkScheduledTheme();
  }

  // Check if scheduled theme should be applied
  private checkScheduledTheme(): void {
    const preferences = this.themePreferences$.value;
    
    if (!preferences.autoSwitchSchedule) {
      return;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const [lightHour, lightMin] = preferences.lightStartTime.split(':').map(Number);
    const [darkHour, darkMin] = preferences.darkStartTime.split(':').map(Number);
    
    const lightTime = lightHour * 60 + lightMin;
    const darkTime = darkHour * 60 + darkMin;

    // Check if it's weekend and weekends only is enabled
    if (preferences.weekendsOnly && now.getDay() !== 0 && now.getDay() !== 6) {
      return;
    }

    // Determine which theme should be active
    let targetTheme: string;
    
    if (lightTime < darkTime) {
      // Same day schedule (e.g., 06:00 to 20:00)
      targetTheme = currentTime >= lightTime && currentTime < darkTime ? 'light-default' : 'dark-default';
    } else {
      // Overnight schedule (e.g., 20:00 to 06:00)
      targetTheme = currentTime >= darkTime || currentTime < lightTime ? 'dark-default' : 'light-default';
    }

    // Apply theme if different from current
    const currentTheme = this.getCurrentStoredTheme();
    if (currentTheme !== targetTheme) {
      this.setTheme(targetTheme);
    }
  }

  // Get current stored theme
  private getCurrentStoredTheme(): string {
    try {
      return localStorage.getItem(this.CURRENT_THEME_KEY) || 'light-default';
    } catch (error) {
      return 'light-default';
    }
  }

  // Switch to system theme
  private switchToSystemTheme(): void {
    const systemTheme = this.systemTheme$.value;
    const targetTheme = systemTheme === 'dark' ? 'dark-default' : 'light-default';
    this.setTheme(targetTheme);
  }

  // Apply theme to document
  private applyTheme(themeId: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const theme = this.getThemeById(themeId);
    if (!theme) {
      console.error('Theme not found:', themeId);
      return;
    }

    const root = document.documentElement;
    
    // Apply all CSS custom properties
    Object.entries(theme.colors).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Update body class for theme
    root.setAttribute('data-theme', theme.id);
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    document.body.classList.add(`theme-${theme.id}`);

    // Update current theme
    this.currentTheme$.next(theme);
    
    // Save to localStorage
    localStorage.setItem(this.CURRENT_THEME_KEY, theme.id);

    // Update recently used
    this.updateRecentlyUsed(theme.id);
  }

  // Get theme by ID
  getThemeById(themeId: string): ThemeVariant | null {
    const builtInThemes = this.getBuiltInThemes();
    const preferences = this.themePreferences$.value;
    
    return [...builtInThemes, ...preferences.customThemes].find(theme => theme.id === themeId) || null;
  }

  // Get all available themes
  getAllThemes(): ThemeVariant[] {
    const builtInThemes = this.getBuiltInThemes();
    const preferences = this.themePreferences$.value;
    
    return [...builtInThemes, ...preferences.customThemes];
  }

  // Get built-in themes
  getBuiltInThemes(): ThemeVariant[] {
    return [
      this.getDefaultLightTheme(),
      this.getDefaultDarkTheme(),
      this.getBlueTheme(),
      this.getGreenTheme(),
      this.getPurpleTheme(),
      this.getSunsetTheme(),
      this.getOceanTheme(),
      this.getForestTheme()
    ];
  }

  // Default light theme
  private getDefaultLightTheme(): ThemeVariant {
    return {
      id: 'light-default',
      name: 'light-default',
      displayName: 'Light',
      isDark: false,
      custom: false,
      colors: {
        '--primary-color': '#ff6b35',
        '--primary-hover': '#ff5722',
        '--primary-light': '#ff8a65',
        '--primary-dark': '#e64a19',
        '--bg-primary': '#ffffff',
        '--bg-secondary': '#f8f9fa',
        '--bg-tertiary': '#e9ecef',
        '--bg-card': '#ffffff',
        '--text-primary': '#212529',
        '--text-secondary': '#6c757d',
        '--text-muted': '#adb5bd',
        '--text-inverse': '#ffffff',
        '--border-color': '#dee2e6',
        '--border-light': '#f8f9fa',
        '--border-dark': '#adb5bd',
        '--success-color': '#28a745',
        '--warning-color': '#ffc107',
        '--danger-color': '#dc3545',
        '--info-color': '#17a2b8',
        '--glass-bg': 'rgba(255, 255, 255, 0.85)',
        '--glass-border': 'rgba(255, 255, 255, 0.2)',
        '--glass-shadow': 'rgba(0, 0, 0, 0.1)',
        '--overlay-bg': 'rgba(0, 0, 0, 0.5)',
        '--modal-bg': 'rgba(255, 255, 255, 0.95)',
        '--dropdown-bg': 'rgba(255, 255, 255, 0.95)'
      }
    };
  }

  // Default dark theme
  private getDefaultDarkTheme(): ThemeVariant {
    return {
      id: 'dark-default',
      name: 'dark-default',
      displayName: 'Dark',
      isDark: true,
      custom: false,
      colors: {
        '--primary-color': '#ff6b35',
        '--primary-hover': '#ff8a65',
        '--primary-light': '#e64a19',
        '--primary-dark': '#ff5722',
        '--bg-primary': '#1a1a2e',
        '--bg-secondary': '#16213e',
        '--bg-tertiary': '#0f3460',
        '--bg-card': 'rgba(26, 26, 46, 0.95)',
        '--text-primary': '#ffffff',
        '--text-secondary': '#b8bcc8',
        '--text-muted': '#6c757d',
        '--text-inverse': '#000000',
        '--border-color': 'rgba(255, 255, 255, 0.1)',
        '--border-light': 'rgba(255, 255, 255, 0.05)',
        '--border-dark': 'rgba(255, 255, 255, 0.2)',
        '--success-color': '#28a745',
        '--warning-color': '#ffc107',
        '--danger-color': '#dc3545',
        '--info-color': '#17a2b8',
        '--glass-bg': 'rgba(26, 26, 46, 0.85)',
        '--glass-border': 'rgba(255, 255, 255, 0.1)',
        '--glass-shadow': 'rgba(0, 0, 0, 0.3)',
        '--overlay-bg': 'rgba(0, 0, 0, 0.7)',
        '--modal-bg': 'rgba(26, 26, 46, 0.95)',
        '--dropdown-bg': 'rgba(26, 26, 46, 0.95)'
      }
    };
  }

  // Blue theme
  private getBlueTheme(): ThemeVariant {
    return {
      id: 'blue-theme',
      name: 'blue-theme',
      displayName: 'Ocean Blue',
      isDark: false,
      custom: false,
      colors: {
        '--primary-color': '#007bff',
        '--primary-hover': '#0056b3',
        '--primary-light': '#66b3ff',
        '--primary-dark': '#004085',
        '--bg-primary': '#f8f9fa',
        '--bg-secondary': '#e3f2fd',
        '--bg-tertiary': '#bbdefb',
        '--bg-card': '#ffffff',
        '--text-primary': '#212529',
        '--text-secondary': '#495057',
        '--text-muted': '#6c757d',
        '--text-inverse': '#ffffff',
        '--border-color': '#dee2e6',
        '--border-light': '#e3f2fd',
        '--border-dark': '#90caf9',
        '--success-color': '#28a745',
        '--warning-color': '#ffc107',
        '--danger-color': '#dc3545',
        '--info-color': '#17a2b8',
        '--glass-bg': 'rgba(232, 244, 255, 0.85)',
        '--glass-border': 'rgba(0, 123, 255, 0.2)',
        '--glass-shadow': 'rgba(0, 123, 255, 0.1)',
        '--overlay-bg': 'rgba(0, 0, 0, 0.5)',
        '--modal-bg': 'rgba(255, 255, 255, 0.95)',
        '--dropdown-bg': 'rgba(255, 255, 255, 0.95)'
      }
    };
  }

  // Green theme
  private getGreenTheme(): ThemeVariant {
    return {
      id: 'green-theme',
      name: 'green-theme',
      displayName: 'Forest Green',
      isDark: false,
      custom: false,
      colors: {
        '--primary-color': '#28a745',
        '--primary-hover': '#1e7e34',
        '--primary-light': '#71dd8a',
        '--primary-dark': '#155724',
        '--bg-primary': '#f8f9fa',
        '--bg-secondary': '#f1f8f4',
        '--bg-tertiary': '#d4edda',
        '--bg-card': '#ffffff',
        '--text-primary': '#212529',
        '--text-secondary': '#495057',
        '--text-muted': '#6c757d',
        '--text-inverse': '#ffffff',
        '--border-color': '#dee2e6',
        '--border-light': '#f1f8f4',
        '--border-dark': '#a3d9a5',
        '--success-color': '#28a745',
        '--warning-color': '#ffc107',
        '--danger-color': '#dc3545',
        '--info-color': '#17a2b8',
        '--glass-bg': 'rgba(232, 245, 233, 0.85)',
        '--glass-border': 'rgba(40, 167, 69, 0.2)',
        '--glass-shadow': 'rgba(40, 167, 69, 0.1)',
        '--overlay-bg': 'rgba(0, 0, 0, 0.5)',
        '--modal-bg': 'rgba(255, 255, 255, 0.95)',
        '--dropdown-bg': 'rgba(255, 255, 255, 0.95)'
      }
    };
  }

  // Purple theme
  private getPurpleTheme(): ThemeVariant {
    return {
      id: 'purple-theme',
      name: 'purple-theme',
      displayName: 'Royal Purple',
      isDark: false,
      custom: false,
      colors: {
        '--primary-color': '#6f42c1',
        '--primary-hover': '#5a32a3',
        '--primary-light': '#9b7fd3',
        '--primary-dark': '#4a2c7d',
        '--bg-primary': '#f8f9fa',
        '--bg-secondary': '#f3e5f5',
        '--bg-tertiary': '#e1bee7',
        '--bg-card': '#ffffff',
        '--text-primary': '#212529',
        '--text-secondary': '#495057',
        '--text-muted': '#6c757d',
        '--text-inverse': '#ffffff',
        '--border-color': '#dee2e6',
        '--border-light': '#f3e5f5',
        '--border-dark': '#ce93d8',
        '--success-color': '#28a745',
        '--warning-color': '#ffc107',
        '--danger-color': '#dc3545',
        '--info-color': '#17a2b8',
        '--glass-bg': 'rgba(243, 229, 245, 0.85)',
        '--glass-border': 'rgba(111, 66, 193, 0.2)',
        '--glass-shadow': 'rgba(111, 66, 193, 0.1)',
        '--overlay-bg': 'rgba(0, 0, 0, 0.5)',
        '--modal-bg': 'rgba(255, 255, 255, 0.95)',
        '--dropdown-bg': 'rgba(255, 255, 255, 0.95)'
      }
    };
  }

  // Sunset theme
  private getSunsetTheme(): ThemeVariant {
    return {
      id: 'sunset-theme',
      name: 'sunset-theme',
      displayName: 'Sunset',
      isDark: false,
      custom: false,
      colors: {
        '--primary-color': '#ff6b35',
        '--primary-hover': '#ff5722',
        '--primary-light': '#ff8a65',
        '--primary-dark': '#e64a19',
        '--bg-primary': '#fff5f5',
        '--bg-secondary': '#ffe0e0',
        '--bg-tertiary': '#ffcccc',
        '--bg-card': '#ffffff',
        '--text-primary': '#2d1b1b',
        '--text-secondary': '#5d4037',
        '--text-muted': '#8d6e63',
        '--text-inverse': '#ffffff',
        '--border-color': '#ffccbc',
        '--border-light': '#ffe0e0',
        '--border-dark': '#ff8a65',
        '--success-color': '#4caf50',
        '--warning-color': '#ff9800',
        '--danger-color': '#f44336',
        '--info-color': '#2196f3',
        '--glass-bg': 'rgba(255, 245, 245, 0.85)',
        '--glass-border': 'rgba(255, 107, 53, 0.2)',
        '--glass-shadow': 'rgba(255, 107, 53, 0.1)',
        '--overlay-bg': 'rgba(0, 0, 0, 0.5)',
        '--modal-bg': 'rgba(255, 255, 255, 0.95)',
        '--dropdown-bg': 'rgba(255, 255, 255, 0.95)'
      }
    };
  }

  // Ocean theme
  private getOceanTheme(): ThemeVariant {
    return {
      id: 'ocean-theme',
      name: 'ocean-theme',
      displayName: 'Deep Ocean',
      isDark: true,
      custom: false,
      colors: {
        '--primary-color': '#00bcd4',
        '--primary-hover': '#00acc1',
        '--primary-light': '#4dd0e1',
        '--primary-dark': '#0097a7',
        '--bg-primary': '#0a1929',
        '--bg-secondary': '#1a2332',
        '--bg-tertiary': '#2a3f5f',
        '--bg-card': 'rgba(10, 25, 41, 0.95)',
        '--text-primary': '#e3f2fd',
        '--text-secondary': '#90caf9',
        '--text-muted': '#64b5f6',
        '--text-inverse': '#000000',
        '--border-color': 'rgba(144, 202, 249, 0.2)',
        '--border-light': 'rgba(144, 202, 249, 0.1)',
        '--border-dark': 'rgba(144, 202, 249, 0.3)',
        '--success-color': '#4caf50',
        '--warning-color': '#ff9800',
        '--danger-color': '#f44336',
        '--info-color': '#00bcd4',
        '--glass-bg': 'rgba(10, 25, 41, 0.85)',
        '--glass-border': 'rgba(0, 188, 212, 0.2)',
        '--glass-shadow': 'rgba(0, 188, 212, 0.1)',
        '--overlay-bg': 'rgba(0, 0, 0, 0.8)',
        '--modal-bg': 'rgba(10, 25, 41, 0.95)',
        '--dropdown-bg': 'rgba(10, 25, 41, 0.95)'
      }
    };
  }

  // Forest theme
  private getForestTheme(): ThemeVariant {
    return {
      id: 'forest-theme',
      name: 'forest-theme',
      displayName: 'Enchanted Forest',
      isDark: true,
      custom: false,
      colors: {
        '--primary-color': '#4caf50',
        '--primary-hover': '#45a049',
        '--primary-light': '#81c784',
        '--primary-dark': '#388e3c',
        '--bg-primary': '#1b2f1b',
        '--bg-secondary': '#2e4a2e',
        '--bg-tertiary': '#3d5a3d',
        '--bg-card': 'rgba(27, 47, 27, 0.95)',
        '--text-primary': '#e8f5e8',
        '--text-secondary': '#a5d6a7',
        '--text-muted': '#81c784',
        '--text-inverse': '#000000',
        '--border-color': 'rgba(165, 214, 167, 0.2)',
        '--border-light': 'rgba(165, 214, 167, 0.1)',
        '--border-dark': 'rgba(165, 214, 167, 0.3)',
        '--success-color': '#4caf50',
        '--warning-color': '#ff9800',
        '--danger-color': '#f44336',
        '--info-color': '#00bcd4',
        '--glass-bg': 'rgba(27, 47, 27, 0.85)',
        '--glass-border': 'rgba(76, 175, 80, 0.2)',
        '--glass-shadow': 'rgba(76, 175, 80, 0.1)',
        '--overlay-bg': 'rgba(0, 0, 0, 0.8)',
        '--modal-bg': 'rgba(27, 47, 27, 0.95)',
        '--dropdown-bg': 'rgba(27, 47, 27, 0.95)'
      }
    };
  }

  // Set theme by ID
  setTheme(themeId: string): void {
    this.applyTheme(themeId);
  }

  // Toggle between light and dark
  toggleTheme(): void {
    const currentTheme = this.currentTheme$.value;
    const targetTheme = currentTheme.isDark ? 'light-default' : 'dark-default';
    this.setTheme(targetTheme);
  }

  // Update recently used themes
  private updateRecentlyUsed(themeId: string): void {
    const preferences = this.themePreferences$.value;
    const recentlyUsed = preferences.recentlyUsed.filter(id => id !== themeId);
    recentlyUsed.unshift(themeId);
    
    // Keep only last 10
    if (recentlyUsed.length > 10) {
      recentlyUsed.splice(10);
    }

    preferences.recentlyUsed = recentlyUsed;
    this.savePreferences(preferences);
  }

  // Save preferences
  private savePreferences(preferences: UserThemePreferences): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(preferences));
      this.themePreferences$.next(preferences);
    } catch (error) {
      console.error('Error saving theme preferences:', error);
    }
  }

  // Update preferences
  updatePreferences(updates: Partial<UserThemePreferences>): void {
    const current = this.themePreferences$.value;
    const updated = { ...current, ...updates };
    this.savePreferences(updated);
  }

  // Add custom theme
  addCustomTheme(theme: Omit<ThemeVariant, 'custom'>): boolean {
    try {
      const preferences = this.themePreferences$.value;
      const customTheme = { ...theme, custom: true };
      
      // Check if theme already exists
      const existingIndex = preferences.customThemes.findIndex(t => t.id === theme.id);
      if (existingIndex >= 0) {
        preferences.customThemes[existingIndex] = customTheme;
      } else {
        preferences.customThemes.push(customTheme);
      }

      this.savePreferences(preferences);
      return true;
    } catch (error) {
      console.error('Error adding custom theme:', error);
      return false;
    }
  }

  // Remove custom theme
  removeCustomTheme(themeId: string): boolean {
    try {
      const preferences = this.themePreferences$.value;
      const filtered = preferences.customThemes.filter(t => t.id !== themeId);
      
      if (filtered.length === preferences.customThemes.length) {
        return false; // Theme not found
      }

      preferences.customThemes = filtered;
      this.savePreferences(preferences);
      return true;
    } catch (error) {
      console.error('Error removing custom theme:', error);
      return false;
    }
  }

  // Add to favorites
  addToFavorites(themeId: string): void {
    const preferences = this.themePreferences$.value;
    if (!preferences.favoriteThemes.includes(themeId)) {
      preferences.favoriteThemes.push(themeId);
      this.savePreferences(preferences);
    }
  }

  // Remove from favorites
  removeFromFavorites(themeId: string): void {
    const preferences = this.themePreferences$.value;
    const filtered = preferences.favoriteThemes.filter(id => id !== themeId);
    preferences.favoriteThemes = filtered;
    this.savePreferences(preferences);
  }

  // Get theme statistics
  getThemeStats(): {
    totalThemes: number;
    customThemes: number;
    favoriteCount: number;
    recentlyUsedCount: number;
    currentTheme: string;
  } {
    const allThemes = this.getAllThemes();
    const preferences = this.themePreferences$.value;
    
    return {
      totalThemes: allThemes.length,
      customThemes: preferences.customThemes.length,
      favoriteCount: preferences.favoriteThemes.length,
      recentlyUsedCount: preferences.recentlyUsed.length,
      currentTheme: this.currentTheme$.value.id
    };
  }

  // Export themes
  exportThemes(): string | null {
    try {
      const preferences = this.themePreferences$.value;
      return JSON.stringify({
        customThemes: preferences.customThemes,
        favoriteThemes: preferences.favoriteThemes,
        preferences: {
          systemThemeDetection: preferences.systemThemeDetection,
          autoSwitchSchedule: preferences.autoSwitchSchedule,
          lightStartTime: preferences.lightStartTime,
          darkStartTime: preferences.darkStartTime
        }
      }, null, 2);
    } catch (error) {
      console.error('Error exporting themes:', error);
      return null;
    }
  }

  // Import themes
  importThemes(themeData: string): boolean {
    try {
      const data = JSON.parse(themeData);
      const preferences = this.themePreferences$.value;
      
      // Import custom themes
      if (data.customThemes && Array.isArray(data.customThemes)) {
        preferences.customThemes = [...preferences.customThemes, ...data.customThemes];
      }
      
      // Import favorites
      if (data.favoriteThemes && Array.isArray(data.favoriteThemes)) {
        preferences.favoriteThemes = [...new Set([...preferences.favoriteThemes, ...data.favoriteThemes])];
      }
      
      // Import preferences
      if (data.preferences) {
        Object.assign(preferences, data.preferences);
      }
      
      this.savePreferences(preferences);
      return true;
    } catch (error) {
      console.error('Error importing themes:', error);
      return false;
    }
  }

  // Cleanup
  ngOnDestroy(): void {
    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
    }
    
    if (this.mediaQuery) {
      this.mediaQuery.removeEventListener('change', () => {});
    }
  }
}
