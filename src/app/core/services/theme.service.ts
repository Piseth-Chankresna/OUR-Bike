import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentThemeSignal = signal<'light' | 'dark'>('dark');
  
  constructor() {
    // Initialize theme from localStorage or system preference
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Check if theme is stored in localStorage
    const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    
    if (storedTheme) {
      this.currentThemeSignal.set(storedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentThemeSignal.set(prefersDark ? 'dark' : 'light');
    }
    
    // Apply theme to document
    this.applyTheme(this.currentThemeSignal());
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        this.currentThemeSignal.set(e.matches ? 'dark' : 'light');
        this.applyTheme(this.currentThemeSignal());
      }
    });
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme icons
    this.updateThemeIcons(theme);
  }

  private updateThemeIcons(theme: 'light' | 'dark'): void {
    const themeIcons = document.querySelectorAll('.theme-icon');
    themeIcons.forEach((icon: Element) => {
      const htmlIcon = icon as HTMLElement;
      if (theme === 'light') {
        htmlIcon.classList.remove('bi-moon');
        htmlIcon.classList.add('bi-sun');
      } else {
        htmlIcon.classList.remove('bi-sun');
        htmlIcon.classList.add('bi-moon');
      }
    });
  }

  // Get current theme as signal
  getCurrentThemeSignal() {
    return this.currentThemeSignal;
  }

  // Get current theme value
  getCurrentTheme(): 'light' | 'dark' {
    return this.currentThemeSignal();
  }

  // Toggle theme
  toggleTheme(): void {
    const newTheme = this.currentThemeSignal() === 'dark' ? 'light' : 'dark';
    this.setTheme(newTheme);
  }

  // Set specific theme
  setTheme(theme: 'light' | 'dark'): void {
    this.currentThemeSignal.set(theme);
    localStorage.setItem('theme', theme);
    this.applyTheme(theme);
  }

  // Check if current theme is dark
  isDarkTheme(): boolean {
    return this.currentThemeSignal() === 'dark';
  }

  // Check if current theme is light
  isLightTheme(): boolean {
    return this.currentThemeSignal() === 'light';
  }
}
