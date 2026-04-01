// This file is required for karma.conf.js to load the test files
import 'zone.js/testing';

// Test environment setup
import * as testing from '@angular/core/testing';

// Global test setup
Object.defineProperty(window, 'testing', {
  value: testing,
  writable: true
});
