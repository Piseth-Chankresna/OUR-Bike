import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ThemeEnhancedService, ThemeSettings, ThemePreset } from '../../../core/services/theme-enhanced.service';

@Component({
  selector: 'app-theme-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './theme-settings.component.html',
  styleUrls: ['./theme-settings.component.scss']
})
export class ThemeSettingsComponent implements OnInit, OnDestroy {
  themeForm!: FormGroup;
  presets: ThemePreset[] = [];
  currentSettings!: ThemeSettings;
  customColors: Record<string, string> = {};
  
  private destroy$ = new Subject<void>();

  private themeService = inject(ThemeEnhancedService);
  private fb = inject(FormBuilder);

  ngOnInit(): void {
    this.initializeForm();
    this.loadThemeData();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Initialize form
  private initializeForm(): void {
    this.themeForm = this.fb.group({
      mode: ['auto'],
      primaryColor: ['#00d2ff'],
      accentColor: ['#3a7bd5'],
      animations: [true],
      reducedMotion: [false],
      highContrast: [false],
      fontSize: ['medium'],
      borderRadius: ['rounded']
    });
  }

  // Load theme data
  private loadThemeData(): void {
    this.presets = this.themeService.getPresets();
    const settings = this.themeService.getThemeSettings()();
    this.currentSettings = settings;
    this.customColors = settings.customColors || {};
    this.updateForm(settings);
  }

  // Setup form listeners
  private setupFormListeners(): void {
    this.themeForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(values => {
      this.updateTheme(values);
    });
  }

  // Update form with settings
  private updateForm(settings: ThemeSettings): void {
    this.themeForm.patchValue({
      mode: settings.mode,
      primaryColor: settings.primaryColor,
      accentColor: settings.accentColor,
      animations: settings.animations,
      reducedMotion: settings.reducedMotion,
      highContrast: settings.highContrast,
      fontSize: settings.fontSize,
      borderRadius: settings.borderRadius
    });
  }

  // Update theme
  private updateTheme(values: Partial<ThemeSettings>): void {
    this.themeService.updateThemeSettings(values);
  }

  // Apply preset
  applyPreset(preset: ThemePreset): void {
    this.themeService.applyPreset(preset);
  }

  // Toggle theme
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  // Set primary color
  setPrimaryColor(color: string): void {
    this.themeService.setPrimaryColor(color);
  }

  // Set accent color
  setAccentColor(color: string): void {
    this.themeService.setAccentColor(color);
  }

  // Add custom color
  addCustomColor(name: string, value: string): void {
    const customColors = { ...this.customColors };
    customColors[`--${name}`] = value;
    this.customColors = customColors;
    this.themeService.updateThemeSettings({ customColors });
  }

  // Remove custom color
  removeCustomColor(name: string): void {
    const customColors = { ...this.customColors };
    delete customColors[`--${name}`];
    this.customColors = customColors;
    this.themeService.updateThemeSettings({ customColors });
  }

  // Reset to default
  resetToDefault(): void {
    this.themeService.resetToDefault();
  }

  // Export theme
  exportTheme(): void {
    const themeJson = this.themeService.exportTheme();
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'our-bikes-theme.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Import theme
  importTheme(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeJson = e.target?.result as string;
        const success = this.themeService.importTheme(themeJson);
        if (!success) {
          alert('Invalid theme file format');
        }
      } catch (error) {
        alert('Error importing theme file');
      }
    };
    reader.readAsText(file);
  }

  // Get current mode display
  get currentModeDisplay(): string {
    const mode = this.themeService.currentMode();
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  }

  // Get custom color entries
  get customColorEntries(): { name: string; value: string }[] {
    return Object.entries(this.customColors).map(([key, value]) => ({
      name: key.replace('--', ''),
      value
    }));
  }

  // Get preset preview colors
  getPresetColors(preset: ThemePreset): string {
    return `linear-gradient(135deg, ${preset.colors.primary} 0%, ${preset.colors.accent} 100%)`;
  }

  // Check if preset is active
  isPresetActive(preset: ThemePreset): boolean {
    const settings = this.currentSettings;
    return settings.primaryColor === preset.colors.primary &&
           settings.accentColor === preset.colors.accent &&
           settings.mode === preset.settings.mode;
  }

  // Get font size display
  getFontSizeDisplay(size: 'small' | 'medium' | 'large'): string {
    return size.charAt(0).toUpperCase() + size.slice(1);
  }

  // Get border radius display
  getBorderRadiusDisplay(style: string): string {
    return style.charAt(0).toUpperCase() + style.slice(1);
  }

  // Add new custom color
  onAddCustomColor(name: string, value: string): void {
    if (name && value) {
      this.addCustomColor(name, value);
    }
  }

  // Handle color input change
  onColorChange(type: 'primary' | 'accent', event: Event): void {
    const color = (event.target as HTMLInputElement).value;
    if (type === 'primary') {
      this.setPrimaryColor(color);
    } else {
      this.setAccentColor(color);
    }
  }

  // Get theme preview style
  getThemePreview(): { background: string; primary: string; accent: string } {
    const colors = this.themeService.themeColors();
    const primaryBg = (colors as any)['--primary-bg'] || '#ffffff';
    const secondaryBg = (colors as any)['--secondary-bg'] || '#f8f9fa';
    return {
      background: `linear-gradient(135deg, ${primaryBg} 0%, ${secondaryBg} 100%)`,
      primary: colors.primary,
      accent: colors.accent
    };
  }

  // Get mode icon
  getModeIcon(mode: string): string {
    const icons: Record<string, string> = {
      light: 'bi-sun',
      dark: 'bi-moon',
      auto: 'bi-circle-half'
    };
    return icons[mode] || 'bi-circle';
  }

  // Get mode description
  getModeDescription(mode: string): string {
    const descriptions: Record<string, string> = {
      light: 'Always use light theme',
      dark: 'Always use dark theme',
      auto: 'Follow system preference'
    };
    return descriptions[mode] || '';
  }
}
