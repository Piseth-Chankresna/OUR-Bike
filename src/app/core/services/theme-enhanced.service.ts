import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from './storage.service';

export interface ThemeSettings {
  mode: 'light' | 'dark' | 'auto';
  primaryColor: string;
  accentColor: string;
  customColors: Record<string, string>;
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  borderRadius: 'sharp' | 'rounded' | 'circular';
}

export interface ThemePreset {
  name: string;
  description: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
  settings: Partial<ThemeSettings>;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeEnhancedService {
  private readonly STORAGE_KEY = 'our_bikes_theme_settings';
  
  private themeSettingsSignal = signal<ThemeSettings>({
    mode: 'auto',
    primaryColor: '#00d2ff',
    accentColor: '#3a7bd5',
    customColors: {},
    animations: true,
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
    borderRadius: 'rounded'
  });

  // Theme presets
  private presets: ThemePreset[] = [
    {
      name: 'Ocean Blue',
      description: 'Calming ocean-inspired theme',
      colors: {
        primary: '#00d2ff',
        accent: '#3a7bd5',
        background: '#0a1628',
        surface: '#1a2744',
        text: '#ffffff'
      },
      settings: { mode: 'dark' as const }
    },
    {
      name: 'Sunset Orange',
      description: 'Warm sunset colors',
      colors: {
        primary: '#ff6b6b',
        accent: '#feca57',
        background: '#2c3e50',
        surface: '#34495e',
        text: '#ecf0f1'
      },
      settings: { mode: 'dark' as const }
    },
    {
      name: 'Forest Green',
      description: 'Natural green theme',
      colors: {
        primary: '#27ae60',
        accent: '#2ecc71',
        background: '#1e272e',
        surface: '#2c3e50',
        text: '#ecf0f1'
      },
      settings: { mode: 'dark' as const }
    },
    {
      name: 'Royal Purple',
      description: 'Elegant purple theme',
      colors: {
        primary: '#8e44ad',
        accent: '#9b59b6',
        background: '#2c003e',
        surface: '#3d1e6d',
        text: '#ecf0f1'
      },
      settings: { mode: 'dark' as const }
    },
    {
      name: 'Minimal Light',
      description: 'Clean light theme',
      colors: {
        primary: '#3498db',
        accent: '#2980b9',
        background: '#f8f9fa',
        surface: '#ffffff',
        text: '#2c3e50'
      },
      settings: { mode: 'light' as const }
    }
  ];

  constructor(private storageService: StorageService) {
    this.loadThemeSettings();
    this.applyTheme();
  }

  // Get current theme settings as signal
  getThemeSettings() {
    return this.themeSettingsSignal;
  }

  // Get computed current mode
  currentMode = computed(() => {
    const settings = this.themeSettingsSignal();
    if (settings.mode === 'auto') {
      return this.getSystemPreference();
    }
    return settings.mode;
  });

  // Get computed theme colors
  themeColors = computed(() => {
    const settings = this.themeSettingsSignal();
    const mode = this.currentMode();
    
    const baseColors = this.getBaseColors(mode);
    return {
      ...baseColors,
      primary: settings.primaryColor,
      accent: settings.accentColor,
      ...settings.customColors
    };
  });

  // Update theme settings
  updateThemeSettings(updates: Partial<ThemeSettings>): void {
    const currentSettings = this.themeSettingsSignal();
    const newSettings = { ...currentSettings, ...updates };
    this.themeSettingsSignal.set(newSettings);
    this.saveThemeSettings();
    this.applyTheme();
  }

  // Apply theme preset
  applyPreset(preset: ThemePreset): void {
    this.updateThemeSettings({
      primaryColor: preset.colors.primary,
      accentColor: preset.colors.accent,
      customColors: {
        '--primary-bg': preset.colors.background,
        '--secondary-bg': preset.colors.surface,
        '--text-primary': preset.colors.text
      },
      ...preset.settings
    });
  }

  // Get all presets
  getPresets(): ThemePreset[] {
    return this.presets;
  }

  // Toggle theme mode
  toggleTheme(): void {
    const currentMode = this.currentMode();
    const newMode = currentMode === 'light' ? 'dark' : 'light';
    this.updateThemeSettings({ mode: newMode });
  }

  // Set primary color
  setPrimaryColor(color: string): void {
    this.updateThemeSettings({ primaryColor: color });
  }

  // Set accent color
  setAccentColor(color: string): void {
    this.updateThemeSettings({ accentColor: color });
  }

  // Toggle animations
  toggleAnimations(): void {
    const current = this.themeSettingsSignal();
    this.updateThemeSettings({ animations: !current.animations });
  }

  // Toggle reduced motion
  toggleReducedMotion(): void {
    const current = this.themeSettingsSignal();
    this.updateThemeSettings({ reducedMotion: !current.reducedMotion });
  }

  // Toggle high contrast
  toggleHighContrast(): void {
    const current = this.themeSettingsSignal();
    this.updateThemeSettings({ highContrast: !current.highContrast });
  }

  // Set font size
  setFontSize(size: 'small' | 'medium' | 'large'): void {
    this.updateThemeSettings({ fontSize: size });
  }

  // Set border radius
  setBorderRadius(style: 'sharp' | 'rounded' | 'circular'): void {
    this.updateThemeSettings({ borderRadius: style });
  }

  // Reset to default theme
  resetToDefault(): void {
    this.themeSettingsSignal.set({
      mode: 'auto',
      primaryColor: '#00d2ff',
      accentColor: '#3a7bd5',
      customColors: {},
      animations: true,
      reducedMotion: false,
      highContrast: false,
      fontSize: 'medium',
      borderRadius: 'rounded'
    });
    this.saveThemeSettings();
    this.applyTheme();
  }

  // Get system preference
  private getSystemPreference(): 'light' | 'dark' {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  // Get base colors for mode
  private getBaseColors(mode: 'light' | 'dark'): Record<string, string> {
    if (mode === 'light') {
      return {
        '--primary-bg': '#ffffff',
        '--secondary-bg': '#f8f9fa',
        '--text-primary': '#2c3e50',
        '--text-secondary': '#7f8c8d',
        '--border-color': '#e1e8ed',
        '--surface-color': '#ffffff',
        '--shadow-color': 'rgba(0, 0, 0, 0.1)'
      };
    } else {
      return {
        '--primary-bg': '#1a1a2e',
        '--secondary-bg': '#16213e',
        '--text-primary': '#ffffff',
        '--text-secondary': '#b8bcc8',
        '--border-color': 'rgba(255, 255, 255, 0.1)',
        '--surface-color': 'rgba(255, 255, 255, 0.05)',
        '--shadow-color': 'rgba(0, 0, 0, 0.3)'
      };
    }
  }

  // Apply theme to DOM
  private applyTheme(): void {
    const settings = this.themeSettingsSignal();
    const colors = this.themeColors();
    const mode = this.currentMode();

    // Apply colors
    Object.entries(colors).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });

    // Apply mode class
    document.documentElement.setAttribute('data-theme', mode);

    // Apply font size
    document.documentElement.setAttribute('data-font-size', settings.fontSize);

    // Apply border radius
    document.documentElement.setAttribute('data-border-radius', settings.borderRadius);

    // Apply animations
    if (!settings.animations || settings.reducedMotion) {
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    } else {
      document.documentElement.removeAttribute('data-reduced-motion');
    }

    // Apply high contrast
    if (settings.highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-high-contrast');
    }

    // Listen for system theme changes
    if (settings.mode === 'auto') {
      this.setupSystemThemeListener();
    }
  }

  // Setup system theme listener
  private setupSystemThemeListener(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      this.applyTheme();
    });
  }

  // Load theme settings from storage
  private loadThemeSettings(): void {
    try {
      const saved = this.storageService.get(this.STORAGE_KEY) as ThemeSettings;
      if (saved) {
        this.themeSettingsSignal.set(saved);
      }
    } catch (error) {
      console.error('Error loading theme settings:', error);
    }
  }

  // Save theme settings to storage
  private saveThemeSettings(): void {
    try {
      this.storageService.set(this.STORAGE_KEY, this.themeSettingsSignal());
    } catch (error) {
      console.error('Error saving theme settings:', error);
    }
  }

  // Get theme CSS variables
  getThemeVariables(): Record<string, string> {
    const colors = this.themeColors();
    const settings = this.themeSettingsSignal();
    
    return {
      ...colors,
      '--font-size-multiplier': this.getFontSizeMultiplier(settings.fontSize),
      '--border-radius-multiplier': this.getBorderRadiusMultiplier(settings.borderRadius),
      '--animation-duration': settings.animations ? '0.3s' : '0s',
      '--transition-timing': settings.reducedMotion ? 'step-end' : 'ease'
    };
  }

  // Get font size multiplier
  private getFontSizeMultiplier(size: 'small' | 'medium' | 'large'): string {
    const multipliers = {
      small: '0.875',
      medium: '1',
      large: '1.125'
    };
    return multipliers[size];
  }

  // Get border radius multiplier
  private getBorderRadiusMultiplier(style: 'sharp' | 'rounded' | 'circular'): string {
    const multipliers = {
      sharp: '0',
      rounded: '1',
      circular: '2'
    };
    return multipliers[style];
  }

  // Export theme settings
  exportTheme(): string {
    const settings = this.themeSettingsSignal();
    return JSON.stringify(settings, null, 2);
  }

  // Import theme settings
  importTheme(themeJson: string): boolean {
    try {
      const settings = JSON.parse(themeJson) as ThemeSettings;
      this.updateThemeSettings(settings);
      return true;
    } catch (error) {
      console.error('Error importing theme:', error);
      return false;
    }
  }
}
