export class ValidationService {
  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static validateRequired(value) {
    return value && value.toString().trim().length > 0;
  }

  static validateMinLength(value, minLength) {
    return value && value.toString().length >= minLength;
  }

  static validateMaxLength(value, maxLength) {
    return !value || value.toString().length <= maxLength;
  }

  static validateNumeric(value) {
    return !isNaN(value) && !isNaN(parseFloat(value));
  }

  static validatePositive(value) {
    return this.validateNumeric(value) && parseFloat(value) > 0;
  }

  static validateDate(date) {
    return date instanceof Date && !isNaN(date);
  }

  static validateFutureDate(date) {
    return this.validateDate(date) && date > new Date();
  }

  static validatePastDate(date) {
    return this.validateDate(date) && date < new Date();
  }

  static validateRange(value, min, max) {
    return this.validateNumeric(value) && 
           parseFloat(value) >= min && 
           parseFloat(value) <= max;
  }

  static validateForm(formData, rules) {
    const errors = {};
    
    for (const field in rules) {
      const fieldRules = rules[field];
      const value = formData[field];
      
      for (const rule of fieldRules) {
        if (rule.required && !this.validateRequired(value)) {
          errors[field] = rule.message || `${field} es requerido`;
          break;
        }
        
        if (value && rule.minLength && !this.validateMinLength(value, rule.minLength)) {
          errors[field] = rule.message || `${field} debe tener al menos ${rule.minLength} caracteres`;
          break;
        }
        
        if (value && rule.maxLength && !this.validateMaxLength(value, rule.maxLength)) {
          errors[field] = rule.message || `${field} no puede tener más de ${rule.maxLength} caracteres`;
          break;
        }
        
        if (value && rule.email && !this.validateEmail(value)) {
          errors[field] = rule.message || `${field} debe ser un email válido`;
          break;
        }
        
        if (value && rule.phone && !this.validatePhone(value)) {
          errors[field] = rule.message || `${field} debe ser un teléfono válido`;
          break;
        }
        
        if (value && rule.numeric && !this.validateNumeric(value)) {
          errors[field] = rule.message || `${field} debe ser numérico`;
          break;
        }
        
        if (value && rule.positive && !this.validatePositive(value)) {
          errors[field] = rule.message || `${field} debe ser un número positivo`;
          break;
        }
      }
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

