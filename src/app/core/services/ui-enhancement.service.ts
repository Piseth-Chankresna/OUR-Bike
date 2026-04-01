import { Injectable, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';

export interface UIEnhancementConfig {
  enableAnimations: boolean;
  enableTransitions: boolean;
  enableHoverEffects: boolean;
  enableLoadingStates: boolean;
  enableSkeletonScreens: boolean;
  enableTooltips: boolean;
  enableBackToTop: boolean;
  enableSmoothScroll: boolean;
  enableProgressBar: boolean;
  enableNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  animationSpeed: 'slow' | 'normal' | 'fast';
  reducedMotion: boolean;
}

export interface NotificationMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  persistent?: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
    style?: 'primary' | 'secondary' | 'danger';
  }>;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

@Injectable({
  providedIn: 'root'
})
export class UIEnhancementService {
  private router = inject(Router);
  
  private config: UIEnhancementConfig = {
    enableAnimations: true,
    enableTransitions: true,
    enableHoverEffects: true,
    enableLoadingStates: true,
    enableSkeletonScreens: true,
    enableTooltips: true,
    enableBackToTop: true,
    enableSmoothScroll: true,
    enableProgressBar: true,
    enableNotifications: true,
    theme: 'dark',
    animationSpeed: 'normal',
    reducedMotion: false
  };

  private notificationSubject = new Subject<NotificationMessage>();
  private loadingSubject = new BehaviorSubject<LoadingState>({ isLoading: false });
  private backToTopVisibleSubject = new BehaviorSubject<boolean>(false);
  private progressBarSubject = new BehaviorSubject<number>(0);

  public notifications$ = this.notificationSubject.asObservable();
  public loading$ = this.loadingSubject.asObservable();
  public backToTopVisible$ = this.backToTopVisibleSubject.asObservable();
  public progressBar$ = this.progressBarSubject.asObservable();

  constructor() {
    this.initializeEnhancements();
    this.setupScrollListener();
    this.setupRouterListener();
  }

  // Initialize UI enhancements
  private initializeEnhancements(): void {
    // Apply configuration to document
    this.applyConfiguration();

    // Initialize back to top button
    if (this.config.enableBackToTop) {
      this.createBackToTopButton();
    }

    // Initialize progress bar
    if (this.config.enableProgressBar) {
      this.createProgressBar();
    }

    // Setup smooth scrolling
    if (this.config.enableSmoothScroll) {
      this.enableSmoothScrolling();
    }
  }

  // Apply configuration to document
  private applyConfiguration(): void {
    const body = document.body;

    // Apply theme
    body.setAttribute('data-theme', this.config.theme);

    // Apply animation speed
    body.setAttribute('data-animation-speed', this.config.animationSpeed);

    // Apply reduced motion
    if (this.config.reducedMotion) {
      body.setAttribute('data-reduced-motion', 'true');
    }

    // Apply animation preferences
    if (!this.config.enableAnimations) {
      body.setAttribute('data-no-animations', 'true');
    }

    if (!this.config.enableTransitions) {
      body.setAttribute('data-no-transitions', 'true');
    }

    if (!this.config.enableHoverEffects) {
      body.setAttribute('data-no-hover', 'true');
    }
  }

  // Show notification
  showNotification(notification: Omit<NotificationMessage, 'id'>): void {
    if (!this.config.enableNotifications) return;

    const notificationMessage: NotificationMessage = {
      ...notification,
      id: this.generateId()
    };

    this.notificationSubject.next(notificationMessage);

    // Auto-dismiss if not persistent
    if (!notification.persistent) {
      const duration = notification.duration || 5000;
      setTimeout(() => {
        this.dismissNotification(notificationMessage.id);
      }, duration);
    }
  }

  // Dismiss notification
  dismissNotification(id: string): void {
    // This would be handled by notification component
    console.log('Dismiss notification:', id);
  }

  // Show loading state
  showLoading(message?: string, progress?: number): void {
    if (!this.config.enableLoadingStates) return;

    this.loadingSubject.next({
      isLoading: true,
      message,
      progress
    });
  }

  // Hide loading state
  hideLoading(): void {
    this.loadingSubject.next({ isLoading: false });
  }

  // Update loading progress
  updateLoadingProgress(progress: number): void {
    const current = this.loadingSubject.value;
    if (current.isLoading) {
      this.loadingSubject.next({
        ...current,
        progress
      });
    }
  }

  // Show skeleton screen
  showSkeletonScreen(container: HTMLElement, lines: number = 3): void {
    if (!this.config.enableSkeletonScreens) return;

    container.innerHTML = this.generateSkeletonHTML(lines);
    container.classList.add('skeleton-loading');
  }

  // Hide skeleton screen
  hideSkeletonScreen(container: HTMLElement): void {
    container.classList.remove('skeleton-loading');
    // Content would be restored by the component
  }

  // Generate skeleton HTML
  private generateSkeletonHTML(lines: number): string {
    let html = '';
    for (let i = 0; i < lines; i++) {
      const width = Math.random() * 40 + 60; // 60-100% width
      html += `<div class="skeleton-line" style="width: ${width}%"></div>`;
    }
    return html;
  }

  // Create back to top button
  private createBackToTopButton(): void {
    const button = document.createElement('button');
    button.id = 'back-to-top';
    button.innerHTML = '<i class="bi bi-arrow-up"></i>';
    button.setAttribute('aria-label', 'Back to top');
    button.className = 'back-to-top-button';
    
    button.addEventListener('click', () => {
      this.scrollToTop();
    });

    document.body.appendChild(button);
  }

  // Create progress bar
  private createProgressBar(): void {
    const progressBar = document.createElement('div');
    progressBar.id = 'progress-bar';
    progressBar.className = 'progress-bar';
    progressBar.innerHTML = '<div class="progress-fill"></div>';
    
    document.body.appendChild(progressBar);
  }

  // Setup scroll listener
  private setupScrollListener(): void {
    let scrollTimeout: number;

    window.addEventListener('scroll', () => {
      // Update back to top visibility
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const isVisible = scrollTop > 300;
      this.backToTopVisibleSubject.next(isVisible);

      // Update progress bar
      let scrollProgress = 0;
      if (this.config.enableProgressBar) {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = (scrollTop / scrollHeight) * 100;
        this.progressBarSubject.next(Math.min(scrollProgress, 100));
      }

      // Update progress bar visual
      const progressBar = document.getElementById('progress-bar');
      if (progressBar) {
        const fill = progressBar.querySelector('.progress-fill') as HTMLElement;
        if (fill) {
          fill.style.width = `${Math.min(scrollProgress, 100)}%`;
        }
      }

      // Debounced scroll handling
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        document.body.classList.remove('scrolling');
      }, 150);
      
      document.body.classList.add('scrolling');
    });
  }

  // Setup router listener for loading states
  private setupRouterListener(): void {
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.hideLoading();
      this.scrollToTop();
    });
  }

  // Scroll to top
  scrollToTop(smooth: boolean = true): void {
    if (this.config.enableSmoothScroll && smooth) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    } else {
      window.scrollTo(0, 0);
    }
  }

  // Enable smooth scrolling
  private enableSmoothScrolling(): void {
    document.documentElement.style.scrollBehavior = 'smooth';
  }

  // Add tooltip to element
  addTooltip(element: HTMLElement, text: string, position: 'top' | 'bottom' | 'left' | 'right' = 'top'): void {
    if (!this.config.enableTooltips) return;

    element.setAttribute('data-tooltip', text);
    element.setAttribute('data-tooltip-position', position);
    element.classList.add('tooltip-enabled');
  }

  // Remove tooltip from element
  removeTooltip(element: HTMLElement): void {
    element.removeAttribute('data-tooltip');
    element.removeAttribute('data-tooltip-position');
    element.classList.remove('tooltip-enabled');
  }

  // Add hover effect to element
  addHoverEffect(element: HTMLElement, effect: 'lift' | 'scale' | 'glow' | 'ripple' = 'lift'): void {
    if (!this.config.enableHoverEffects) return;

    element.classList.add(`hover-effect-${effect}`);
  }

  // Add animation to element
  addAnimation(element: HTMLElement, animation: string, duration: number = 300): void {
    if (!this.config.enableAnimations) return;

    element.style.animation = `${animation} ${duration}ms ease-in-out`;
    
    // Remove animation class after completion
    setTimeout(() => {
      element.style.animation = '';
    }, duration);
  }

  // Add transition to element
  addTransition(element: HTMLElement, properties: string, duration: number = 300): void {
    if (!this.config.enableTransitions) return;

    const speed = this.config.animationSpeed === 'slow' ? 1.5 : 
                   this.config.animationSpeed === 'fast' ? 0.7 : 1;
    
    element.style.transition = `${properties} ${duration * speed}ms ease-in-out`;
  }

  // Create ripple effect
  createRipple(event: MouseEvent, element: HTMLElement): void {
    if (!this.config.enableHoverEffects) return;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    element.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  // Update configuration
  updateConfig(config: Partial<UIEnhancementConfig>): void {
    this.config = { ...this.config, ...config };
    this.applyConfiguration();
  }

  // Get current configuration
  getConfig(): UIEnhancementConfig {
    return { ...this.config };
  }

  // Toggle theme
  toggleTheme(): void {
    const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(this.config.theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    
    this.updateConfig({ theme: themes[nextIndex] });
  }

  // Toggle animations
  toggleAnimations(): void {
    this.updateConfig({ enableAnimations: !this.config.enableAnimations });
  }

  // Toggle reduced motion
  toggleReducedMotion(): void {
    this.updateConfig({ reducedMotion: !this.config.reducedMotion });
  }

  // Check if user prefers reduced motion
  private checkReducedMotionPreference(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // Generate unique ID
  private generateId(): string {
    return `ui_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Create loading overlay
  createLoadingOverlay(container: HTMLElement, message?: string): HTMLElement {
    if (!this.config.enableLoadingStates) return document.createElement('div');

    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.innerHTML = `
      <div class="loading-content">
        <div class="loading-spinner"></div>
        ${message ? `<div class="loading-message">${message}</div>` : ''}
      </div>
    `;

    container.appendChild(overlay);
    return overlay;
  }

  // Remove loading overlay
  removeLoadingOverlay(overlay: HTMLElement): void {
    overlay.classList.add('fade-out');
    setTimeout(() => {
      overlay.remove();
    }, 300);
  }

  // Animate number counting
  animateNumber(element: HTMLElement, target: number, duration: number = 1000): void {
    if (!this.config.enableAnimations) {
      element.textContent = target.toString();
      return;
    }

    const start = 0;
    const increment = target / (duration / 16);
    let current = start;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toString();
    }, 16);
  }

  // Add fade in animation to element
  fadeIn(element: HTMLElement, duration: number = 300): void {
    element.style.opacity = '0';
    element.style.display = 'block';
    
    setTimeout(() => {
      element.style.transition = `opacity ${duration}ms ease-in-out`;
      element.style.opacity = '1';
    }, 10);
  }

  // Add fade out animation to element
  fadeOut(element: HTMLElement, duration: number = 300): void {
    element.style.transition = `opacity ${duration}ms ease-in-out`;
    element.style.opacity = '0';
    
    setTimeout(() => {
      element.style.display = 'none';
    }, duration);
  }

  // Add slide in animation
  slideIn(element: HTMLElement, direction: 'up' | 'down' | 'left' | 'right' = 'up', duration: number = 300): void {
    const transforms = {
      up: 'translateY(20px)',
      down: 'translateY(-20px)',
      left: 'translateX(20px)',
      right: 'translateX(-20px)'
    };

    element.style.transform = transforms[direction];
    element.style.opacity = '0';
    element.style.display = 'block';
    
    setTimeout(() => {
      element.style.transition = `transform ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`;
      element.style.transform = 'translate(0)';
      element.style.opacity = '1';
    }, 10);
  }

  // Add slide out animation
  slideOut(element: HTMLElement, direction: 'up' | 'down' | 'left' | 'right' = 'up', duration: number = 300): void {
    const transforms = {
      up: 'translateY(-20px)',
      down: 'translateY(20px)',
      left: 'translateX(-20px)',
      right: 'translateX(20px)'
    };

    element.style.transition = `transform ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`;
    element.style.transform = transforms[direction];
    element.style.opacity = '0';
    
    setTimeout(() => {
      element.style.display = 'none';
    }, duration);
  }
}
