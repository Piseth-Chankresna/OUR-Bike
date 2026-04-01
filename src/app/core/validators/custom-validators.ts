import { AbstractControl, ValidationErrors, ValidatorFn, FormGroup } from '@angular/forms';

export class CustomValidators {
  
  // Email validation with strict pattern
  static emailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isValid = emailPattern.test(control.value);
      
      return isValid ? null : { 
        invalidEmail: { 
          message: 'Please enter a valid email address' 
        } 
      };
    };
  }

  // Password strength validator
  static passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const password = control.value;
      const errors: ValidationErrors = {};
      
      // Minimum 8 characters
      if (password.length < 8) {
        errors['minLength'] = { 
          requiredLength: 8, 
          actualLength: password.length,
          message: 'Password must be at least 8 characters long'
        };
      }
      
      // At least one uppercase letter
      if (!/[A-Z]/.test(password)) {
        errors['uppercase'] = { 
          message: 'Password must contain at least one uppercase letter' 
        };
      }
      
      // At least one lowercase letter
      if (!/[a-z]/.test(password)) {
        errors['lowercase'] = { 
          message: 'Password must contain at least one lowercase letter' 
        };
      }
      
      // At least one number
      if (!/\d/.test(password)) {
        errors['number'] = { 
          message: 'Password must contain at least one number' 
        };
      }
      
      // At least one special character
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors['specialChar'] = { 
          message: 'Password must contain at least one special character' 
        };
      }
      
      return Object.keys(errors).length ? errors : null;
    };
  }

  // Password confirmation validator
  static passwordMatchValidator(passwordFieldName: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.parent) return null;
      
      const password = control.parent.get(passwordFieldName)?.value;
      const confirmPassword = control.value;
      
      return password === confirmPassword ? null : { 
        passwordMismatch: { 
          message: 'Passwords do not match' 
        } 
      };
    };
  }

  // Phone number validator
  static phoneValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      // Support various phone formats
      const phonePattern = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
      const isValid = phonePattern.test(control.value);
      
      return isValid ? null : { 
        invalidPhone: { 
          message: 'Please enter a valid phone number' 
        } 
      };
    };
  }

  // Price validator (positive numbers with 2 decimal places)
  static priceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const price = parseFloat(control.value);
      const pricePattern = /^\d+(\.\d{1,2})?$/;
      
      if (!pricePattern.test(control.value)) {
        return { 
          invalidPriceFormat: { 
            message: 'Price must be a valid number with up to 2 decimal places' 
          } 
        };
      }
      
      if (price <= 0) {
        return { 
          invalidPriceValue: { 
            message: 'Price must be greater than 0' 
          } 
        };
      }
      
      return null;
    };
  }

  // Stock validator (non-negative integers)
  static stockValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const stock = parseInt(control.value);
      
      if (isNaN(stock) || stock < 0) {
        return { 
          invalidStock: { 
            message: 'Stock must be a non-negative integer' 
          } 
        };
      }
      
      return null;
    };
  }

  // Required field validator with custom message
  static required(message: string = 'This field is required'): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || (typeof control.value === 'string' && control.value.trim() === '')) {
        return { 
          required: { 
            message 
          } 
        };
      }
      return null;
    };
  }

  // Minimum length validator with custom message
  static minLength(minLength: number, message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      if (control.value.length < minLength) {
        return { 
          minLength: { 
            requiredLength: minLength, 
            actualLength: control.value.length,
            message: message || `Minimum length is ${minLength} characters`
          } 
        };
      }
      
      return null;
    };
  }

  // Maximum length validator with custom message
  static maxLength(maxLength: number, message?: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      if (control.value.length > maxLength) {
        return { 
          maxLength: { 
            requiredLength: maxLength, 
            actualLength: control.value.length,
            message: message || `Maximum length is ${maxLength} characters`
          } 
        };
      }
      
      return null;
    };
  }

  // URL validator
  static urlValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      try {
        new URL(control.value);
        return null;
      } catch {
        return { 
          invalidUrl: { 
            message: 'Please enter a valid URL' 
          } 
        };
      }
    };
  }

  // No whitespace validator
  static noWhitespaceValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      if (/\s/.test(control.value)) {
        return { 
          whitespace: { 
            message: 'This field cannot contain whitespace' 
          } 
        };
      }
      
      return null;
    };
  }

  // Numeric validator
  static numericValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      if (isNaN(Number(control.value))) {
        return { 
          numeric: { 
            message: 'This field must be a number' 
          } 
        };
      }
      
      return null;
    };
  }

  // Age validator (minimum age)
  static ageValidator(minAge: number = 18): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const birthDate = new Date(control.value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age - 1;
      }
      
      if (age < minAge) {
        return { 
          underage: { 
            requiredAge: minAge,
            actualAge: age,
            message: `You must be at least ${minAge} years old` 
          } 
        };
      }
      
      return null;
    };
  }

  // Get error message for validation errors
  static getErrorMessage(validationErrors: ValidationErrors): string {
    if (!validationErrors) return '';
    
    const firstError = Object.keys(validationErrors)[0];
    const error = validationErrors[firstError];
    
    if (typeof error === 'object' && error !== null && 'message' in error) {
      return error.message;
    }
    
    // Default messages for common validators
    switch (firstError) {
      case 'required':
        return 'This field is required';
      case 'email':
        return 'Please enter a valid email address';
      case 'minlength':
        return `Minimum length is ${error.requiredLength} characters`;
      case 'maxlength':
        return `Maximum length is ${error.requiredLength} characters`;
      case 'pattern':
        return 'Invalid format';
      default:
        return 'Invalid input';
    }
  }
}
