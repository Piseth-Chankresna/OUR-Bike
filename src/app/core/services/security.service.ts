import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl } from '@angular/platform-browser';

export interface SecurityConfig {
  enableCSP: boolean;
  enableHSTS: boolean;
  enableXSSProtection: boolean;
  enableFrameProtection: boolean;
  enableContentTypeProtection: boolean;
  enableReferrerPolicy: boolean;
  enablePermissionsPolicy: boolean;
  cspDirectives: CSPDirectives;
  hstsMaxAge: number;
  hstsIncludeSubdomains: boolean;
  hstsPreload: boolean;
}

export interface CSPDirectives {
  'default-src': string[];
  'script-src': string[];
  'style-src': string[];
  'img-src': string[];
  'font-src': string[];
  'connect-src': string[];
  'media-src': string[];
  'object-src': string[];
  'child-src': string[];
  'frame-src': string[];
  'worker-src': string[];
  'manifest-src': string[];
  'upgrade-insecure-requests': boolean;
}

export interface SecurityHeaders {
  'Content-Security-Policy': string;
  'Strict-Transport-Security': string;
  'X-Content-Type-Options': string;
  'X-Frame-Options': string;
  'X-XSS-Protection': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Cross-Origin-Embedder-Policy': string;
  'Cross-Origin-Opener-Policy': string;
  'Cross-Origin-Resource-Policy': string;
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly defaultConfig: SecurityConfig = {
    enableCSP: true,
    enableHSTS: true,
    enableXSSProtection: true,
    enableFrameProtection: true,
    enableContentTypeProtection: true,
    enableReferrerPolicy: true,
    enablePermissionsPolicy: true,
    cspDirectives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://www.googletagmanager.com"],
      'style-src': ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      'img-src': ["'self'", "data:", "https:", "https://picsum.photos", "https://motocrossactionmag.com"],
      'font-src': ["'self'", "data:", "https://fonts.gstatic.com"],
      'connect-src': ["'self'", "https://www.google-analytics.com", "https://api.ourbikes-store.com"],
      'media-src': ["'self'"],
      'object-src': ["'none'"],
      'child-src': ["'self'"],
      'frame-src': ["'none'"],
      'worker-src': ["'self'"],
      'manifest-src': ["'self'"],
      'upgrade-insecure-requests': false
    },
    hstsMaxAge: 31536000, // 1 year
    hstsIncludeSubdomains: true,
    hstsPreload: true
  };

  constructor(private sanitizer: DomSanitizer) {
    this.initializeSecurity();
  }

  private initializeSecurity(): void {
    // Apply security headers (in a real server implementation)
    this.setSecurityHeaders();
    
    // Initialize CSP
    this.initializeCSP();
    
    console.log('✅ Security service initialized');
  }

  // Content Security Policy
  private initializeCSP(): void {
    if (!this.defaultConfig.enableCSP) return;

    const csp = this.generateCSP();
    this.setCSPHeader(csp);
    
    console.log('🛡️ CSP initialized:', csp);
  }

  private generateCSP(): string {
    const directives = this.defaultConfig.cspDirectives;
    const cspParts: string[] = [];

    // Generate each directive
    Object.entries(directives).forEach(([directive, values]) => {
      if (directive === 'upgrade-insecure-requests') {
        if (values) {
          cspParts.push('upgrade-insecure-requests');
        }
      } else {
        const value = Array.isArray(values) ? values.join(' ') : values;
        if (value) {
          cspParts.push(`${directive} ${value}`);
        }
      }
    });

    return cspParts.join('; ');
  }

  private setCSPHeader(csp: string): void {
    // In a real implementation, this would be set by the server
    // For client-side, we can set meta tag
    this.setMetaTag('Content-Security-Policy', csp);
  }

  // Security Headers
  private setSecurityHeaders(): void {
    const headers = this.generateSecurityHeaders();
    
    Object.entries(headers).forEach(([header, value]) => {
      this.setMetaTag(header, value);
    });
  }

  private generateSecurityHeaders(): SecurityHeaders {
    const config = this.defaultConfig;
    
    return {
      'Content-Security-Policy': config.enableCSP ? this.generateCSP() : '',
      'Strict-Transport-Security': config.enableHSTS ? this.generateHSTSHeader() : '',
      'X-Content-Type-Options': config.enableContentTypeProtection ? 'nosniff' : '',
      'X-Frame-Options': config.enableFrameProtection ? 'SAMEORIGIN' : '',
      'X-XSS-Protection': config.enableXSSProtection ? '1; mode=block' : '',
      'Referrer-Policy': config.enableReferrerPolicy ? 'strict-origin-when-cross-origin' : '',
      'Permissions-Policy': config.enablePermissionsPolicy ? this.generatePermissionsPolicy() : '',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin'
    };
  }

  private generateHSTSHeader(): string {
    const config = this.defaultConfig;
    let header = `max-age=${config.hstsMaxAge}`;
    
    if (config.hstsIncludeSubdomains) {
      header += '; includeSubDomains';
    }
    
    if (config.hstsPreload) {
      header += '; preload';
    }
    
    return header;
  }

  private generatePermissionsPolicy(): string {
    const policies = [
      'geolocation=()',
      'microphone=()',
      'camera=()',
      'payment=()',
      'usb=()',
      'magnetometer=()',
      'gyroscope=()',
      'accelerometer=()',
      'autoplay=(self)',
      'fullscreen=(self)',
      'picture-in-picture=(self)'
    ];
    
    return policies.join(', ');
  }

  private setMetaTag(name: string, content: string): void {
    // Remove existing meta tag
    const existing = document.querySelector(`meta[http-equiv="${name}"], meta[name="${name}"]`);
    if (existing) {
      existing.remove();
    }

    // Add new meta tag
    const meta = document.createElement('meta');
    if (name.includes('Content-Security-Policy')) {
      meta.setAttribute('http-equiv', name);
    } else {
      meta.setAttribute('name', name);
    }
    meta.content = content;
    document.head.appendChild(meta);
  }

  // Input sanitization
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  sanitizeStyle(style: string): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(style);
  }

  sanitizeScript(script: string): SafeScript {
    return this.sanitizer.bypassSecurityTrustScript(script);
  }

  sanitizeUrl(url: string): SafeUrl {
    return this.sanitizer.bypassSecurityTrustUrl(url);
  }

  sanitizeResourceUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  // URL validation
  isValidUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }

  isSecureUrl(url: string): boolean {
    try {
      return new URL(url).protocol === 'https:';
    } catch {
      return false;
    }
  }

  // XSS prevention
  preventXSS(input: string): string {
    return input
      .replace(/[<>]/g, '') // Remove basic HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  // Content validation
  validateUserInput(input: string, type: 'email' | 'text' | 'url' | 'html' = 'text'): boolean {
    switch (type) {
      case 'email':
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
      case 'url':
        return this.isValidUrl(input);
      case 'html':
        return !/<script|javascript:|on\w+\s*=/i.test(input);
      default:
        return input.length > 0 && input.length <= 1000;
    }
  }

  // CSRF protection
  generateCSRFToken(): string {
    return this.generateSecureToken(64);
  }

  // Security audit
  performSecurityAudit(): SecurityAuditResult {
    const results: SecurityAuditResult = {
      timestamp: new Date().toISOString(),
      checks: {
        httpsEnabled: this.isSecureUrl(window.location.href),
        cspEnabled: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
        hstsEnabled: !!document.querySelector('meta[http-equiv="Strict-Transport-Security"]'),
        xssProtectionEnabled: !!document.querySelector('meta[http-equiv="X-XSS-Protection"]'),
        frameProtectionEnabled: !!document.querySelector('meta[http-equiv="X-Frame-Options"]'),
        contentTypeProtectionEnabled: !!document.querySelector('meta[http-equiv="X-Content-Type-Options"]'),
        referrerPolicyEnabled: !!document.querySelector('meta[name="Referrer-Policy"]'),
        permissionsPolicyEnabled: !!document.querySelector('meta[name="Permissions-Policy"]')
      },
      score: 0,
      recommendations: []
    };

    // Calculate score
    const enabledChecks = Object.values(results.checks).filter(Boolean).length;
    const totalChecks = Object.keys(results.checks).length;
    results.score = Math.round((enabledChecks / totalChecks) * 100);

    // Generate recommendations
    if (!results.checks.httpsEnabled) {
      results.recommendations.push('Enable HTTPS for secure communication');
    }
    if (!results.checks.cspEnabled) {
      results.recommendations.push('Implement Content Security Policy to prevent XSS attacks');
    }
    if (!results.checks.hstsEnabled) {
      results.recommendations.push('Enable HTTP Strict Transport Security (HSTS)');
    }
    if (!results.checks.xssProtectionEnabled) {
      results.recommendations.push('Enable XSS protection header');
    }

    return results;
  }

  // Configuration management
  updateConfig(config: Partial<SecurityConfig>): void {
    Object.assign(this.defaultConfig, config);
    this.initializeSecurity();
  }

  getConfig(): SecurityConfig {
    return { ...this.defaultConfig };
  }

  // Helper methods
  private logSecurityEvent(event: string, details?: any): void {
    console.log(`🔒 Security Event: ${event}`, details);
  }

  // Enhanced security features
  generateSecureToken(length: number = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  hashPassword(password: string, salt: string = ''): string {
    // Simple hashing for demo (use bcrypt in production)
    const combined = password + salt;
    return btoa(combined);
  }

  verifyPassword(password: string, hashedPassword: string, salt: string = ''): boolean {
    const hashed = this.hashPassword(password, salt);
    return hashed === hashedPassword;
  }

  sanitizeInput(input: string): string {
    if (!input) return '';
    
    return input
      .replace(/[<>]/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  validatePhone(phone: string): boolean {
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    return phoneRegex.test(phone);
  }

  checkPasswordStrength(password: string): {
    score: number;
    feedback: string[];
    isStrong: boolean;
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) score += 20;
    else feedback.push('Password should be at least 8 characters long');

    if (/[a-z]/.test(password)) score += 20;
    else feedback.push('Include lowercase letters');

    if (/[A-Z]/.test(password)) score += 20;
    else feedback.push('Include uppercase letters');

    if (/\d/.test(password)) score += 20;
    else feedback.push('Include numbers');

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 20;
    else feedback.push('Include special characters');

    return {
      score,
      feedback,
      isStrong: score >= 80
    };
  }

  validateCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken;
  }

  encryptSensitiveData(data: string): string {
    // Simple encoding for demo (use proper encryption in production)
    return btoa(data);
  }

  decryptSensitiveData(encryptedData: string): string {
    // Simple decoding for demo (use proper encryption in production)
    try {
      return atob(encryptedData);
    } catch {
      return '';
    }
  }

  checkRateLimit(identifier: string, maxAttempts: number = 5, windowMs: number = 900000): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
  } {
    const key = `rate_limit_${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get existing attempts from localStorage
    const attempts = this.getRateLimitAttempts(key);
    const validAttempts = attempts.filter(timestamp => timestamp > windowStart);

    if (validAttempts.length >= maxAttempts) {
      const oldestAttempt = Math.min(...validAttempts);
      return {
        allowed: false,
        remaining: 0,
        resetTime: oldestAttempt + windowMs
      };
    }

    // Add current attempt
    validAttempts.push(now);
    this.setRateLimitAttempts(key, validAttempts);

    return {
      allowed: true,
      remaining: maxAttempts - validAttempts.length,
      resetTime: now + windowMs
    };
  }

  private getRateLimitAttempts(key: string): number[] {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  }

  private setRateLimitAttempts(key: string, attempts: number[]): void {
    localStorage.setItem(key, JSON.stringify(attempts));
  }

  detectSuspiciousActivity(userAgent: string, ip: string): {
    isSuspicious: boolean;
    reasons: string[];
    riskScore: number;
  } {
    const reasons: string[] = [];
    let riskScore = 0;

    // Check for suspicious user agents
    if (userAgent.includes('bot') || userAgent.includes('crawler')) {
      reasons.push('Automated bot detected');
      riskScore += 30;
    }

    // Check for missing user agent
    if (!userAgent || userAgent.length < 10) {
      reasons.push('Invalid or missing user agent');
      riskScore += 20;
    }

    // Check for common attack patterns
    const attackPatterns = ['sql', 'xss', 'script', 'alert', 'union', 'select'];
    if (attackPatterns.some(pattern => userAgent.toLowerCase().includes(pattern))) {
      reasons.push('Attack pattern detected in user agent');
      riskScore += 50;
    }

    return {
      isSuspicious: riskScore > 40,
      reasons,
      riskScore
    };
  }

  logSecurityIncident(incident: {
    type: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    userAgent?: string;
    ip?: string;
    timestamp?: number;
  }): void {
    const incidentLog = {
      ...incident,
      timestamp: incident.timestamp || Date.now(),
      id: this.generateSecureToken(16)
    };

    // Store in localStorage for demo (use proper logging in production)
    const existingLogs = this.getSecurityLogs();
    existingLogs.push(incidentLog);
    
    // Keep only last 100 incidents
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }

    localStorage.setItem('security_logs', JSON.stringify(existingLogs));
    this.logSecurityEvent('Security Incident Logged', incidentLog);
  }

  getSecurityLogs(): any[] {
    const logs = localStorage.getItem('security_logs');
    return logs ? JSON.parse(logs) : [];
  }

  clearSecurityLogs(): void {
    localStorage.removeItem('security_logs');
    this.logSecurityEvent('Security logs cleared');
  }

  // Session security
  createSecureSession(): {
    sessionId: string;
    csrfToken: string;
    expiresAt: number;
  } {
    const sessionId = this.generateSecureToken(64);
    const csrfToken = this.generateCSRFToken();
    const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours

    return {
      sessionId,
      csrfToken,
      expiresAt
    };
  }

  validateSession(session: {
    sessionId: string;
    csrfToken: string;
    expiresAt: number;
  }): boolean {
    return !!(session.expiresAt > Date.now() && session.sessionId && session.csrfToken);
  }

  // Input validation helpers
  validateNumber(input: string, min?: number, max?: number): boolean {
    const num = parseFloat(input);
    if (isNaN(num)) return false;
    if (min !== undefined && num < min) return false;
    if (max !== undefined && num > max) return false;
    return true;
  }

  validateString(input: string, minLength?: number, maxLength?: number): boolean {
    if (typeof input !== 'string') return false;
    if (minLength !== undefined && input.length < minLength) return false;
    if (maxLength !== undefined && input.length > maxLength) return false;
    return true;
  }

  validateURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

export interface SecurityAuditResult {
  timestamp: string;
  checks: {
    httpsEnabled: boolean;
    cspEnabled: boolean;
    hstsEnabled: boolean;
    xssProtectionEnabled: boolean;
    frameProtectionEnabled: boolean;
    contentTypeProtectionEnabled: boolean;
    referrerPolicyEnabled: boolean;
    permissionsPolicyEnabled: boolean;
  };
  score: number;
  recommendations: string[];
}
