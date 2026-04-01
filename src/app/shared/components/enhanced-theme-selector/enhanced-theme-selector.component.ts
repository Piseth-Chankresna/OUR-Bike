import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { EnhancedThemeService, ThemeVariant, UserThemePreferences } from '../../../core/services/enhanced-theme.service';

@Component({
  selector: 'app-enhanced-theme-selector',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './enhanced-theme-selector.component.html',
  styleUrls: ['./enhanced-theme-selector.component.scss']
})
export class EnhancedThemeSelectorComponent implements OnInit, OnDestroy {
  themeForm!: FormGroup;
  scheduleForm!: FormGroup;
  
  currentTheme: ThemeVariant | null = null;
  allThemes: ThemeVariant[] = [];
  preferences: UserThemePreferences | null = null;
  
  isLoading = true;
  isSaving = false;
  showCustomThemeEditor = false;
  showScheduleSettings = false;
  
  // Time options for schedule
  timeOptions: string[] = [];
  timezoneOptions: string[] = [
    'UTC',
    'EST',
    'CST',
    'MST',
    'PST',
    'GMT',
    'CET',
    'IST',
    'JST',
    'AEST'
  ];

  constructor(
    private themeService: EnhancedThemeService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  private initializeComponent(): void {
    this.generateTimeOptions();
    this.initializeForms();
    this.loadThemeData();
  }

  private generateTimeOptions(): void {
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        this.timeOptions.push(time);
      }
    }
  }

  private initializeForms(): void {
    // Theme preferences form
    this.themeForm = this.fb.group({
      preferredTheme: ['light-default'],
      systemThemeDetection: [true],
      autoSwitchSchedule: [false]
    });

    // Schedule form
    this.scheduleForm = this.fb.group({
      lightStartTime: ['06:00'],
      darkStartTime: ['20:00'],
      weekendsOnly: [false],
      timezone: ['UTC']
    });
  }

  private loadThemeData(): void {
    // Subscribe to current theme
    this.themeService.getCurrentTheme().subscribe(theme => {
      this.currentTheme = theme;
    });

    // Subscribe to theme preferences
    this.themeService.getThemePreferences().subscribe(preferences => {
      this.preferences = preferences;
      this.populateForms(preferences);
      this.isLoading = false;
    });

    // Load all themes
    this.allThemes = this.themeService.getAllThemes();
  }

  private populateForms(preferences: UserThemePreferences): void {
    this.themeForm.patchValue({
      preferredTheme: preferences.preferredTheme,
      systemThemeDetection: preferences.systemThemeDetection,
      autoSwitchSchedule: preferences.autoSwitchSchedule
    });

    this.scheduleForm.patchValue({
      lightStartTime: preferences.lightStartTime,
      darkStartTime: preferences.darkStartTime,
      weekendsOnly: preferences.weekendsOnly,
      timezone: preferences.timezone
    });
  }

  // Apply theme
  applyTheme(themeId: string): void {
    this.themeService.setTheme(themeId);
  }

  // Toggle theme
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  // Save preferences
  savePreferences(): void {
    if (this.themeForm.invalid || this.scheduleForm.invalid) {
      this.markFormGroupTouched(this.themeForm);
      this.markFormGroupTouched(this.scheduleForm);
      return;
    }

    this.isSaving = true;

    const updates = {
      ...this.themeForm.value,
      ...this.scheduleForm.value
    };

    this.themeService.updatePreferences(updates);

    setTimeout(() => {
      this.isSaving = false;
    }, 1000);
  }

  // Add to favorites
  addToFavorites(themeId: string): void {
    this.themeService.addToFavorites(themeId);
    this.loadThemeData();
  }

  // Remove from favorites
  removeFromFavorites(themeId: string): void {
    this.themeService.removeFromFavorites(themeId);
    this.loadThemeData();
  }

  // Check if theme is favorite
  isFavorite(themeId: string): boolean {
    return this.preferences?.favoriteThemes?.includes(themeId) || false;
  }

  // Get recently used themes
  getRecentlyUsedThemes(): ThemeVariant[] {
    if (!this.preferences?.recentlyUsed) {
      return [];
    }

    return this.preferences.recentlyUsed
      .map(id => this.themeService.getThemeById(id))
      .filter(theme => theme !== null)
      .slice(0, 5);
  }

  // Get favorite themes
  getFavoriteThemes(): ThemeVariant[] {
    if (!this.preferences?.favoriteThemes) {
      return [];
    }

    return this.preferences.favoriteThemes
      .map(id => this.themeService.getThemeById(id))
      .filter(theme => theme !== null);
  }

  // Get built-in themes
  getBuiltInThemes(): ThemeVariant[] {
    return this.allThemes.filter(theme => !theme.custom);
  }

  // Get custom themes
  getCustomThemes(): ThemeVariant[] {
    return this.allThemes.filter(theme => theme.custom);
  }

  // Show custom theme editor
  showCustomEditor(): void {
    this.showCustomThemeEditor = true;
  }

  // Hide custom theme editor
  hideCustomEditor(): void {
    this.showCustomThemeEditor = false;
  }

  // Show schedule settings
  showScheduleSettingsPanel(): void {
    this.showScheduleSettings = true;
  }

  // Hide schedule settings
  hideScheduleSettings(): void {
    this.showScheduleSettings = false;
  }

  // Export themes
  exportThemes(): void {
    const themeData = this.themeService.exportThemes();
    
    if (themeData) {
      const blob = new Blob([themeData], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'theme-settings.json';
      link.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert('Failed to export themes.');
    }
  }

  // Import themes
  importThemes(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const themeData = e.target?.result as string;
        const success = this.themeService.importThemes(themeData);
        
        if (success) {
          this.loadThemeData();
          alert('Themes imported successfully!');
        } else {
          alert('Failed to import themes. Please check the file format.');
        }
      } catch (error) {
        alert('Invalid theme file format.');
      }
    };
    
    reader.readAsText(file);
  }

  // Reset to default
  resetToDefault(): void {
    if (confirm('Are you sure you want to reset all theme settings to default?')) {
      this.themeService.updatePreferences({
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
      });
      
      this.themeService.setTheme('light-default');
      this.loadThemeData();
    }
  }

  // Get theme preview colors
  getThemePreviewColors(theme: ThemeVariant): string[] {
    return [
      theme.colors['--primary-color'],
      theme.colors['--bg-primary'],
      theme.colors['--text-primary'],
      theme.colors['--border-color']
    ];
  }

  // Format time
  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  // Get theme category
  getThemeCategory(theme: ThemeVariant): string {
    if (theme.custom) {
      return 'Custom';
    }
    
    if (theme.isDark) {
      return 'Dark';
    }
    
    return 'Light';
  }

  // Get theme stats
  getThemeStats() {
    return this.themeService.getThemeStats();
  }

  // Helper method to mark form group as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  // Get system theme
  getSystemTheme(): 'light' | 'dark' {
    // This would be determined by the enhanced theme service
    return 'light';
  }

  // Check if system theme detection is available
  isSystemThemeDetectionAvailable(): boolean {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme)').media !== 'not all';
  }
}
