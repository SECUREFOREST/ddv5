// Comprehensive validation utilities for the application

/**
 * Email validation with proper format checking
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') return false;
  
  // Basic email regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  // Check for common invalid patterns
  const invalidPatterns = [
    /^\./, // Starts with dot
    /\.$/, // Ends with dot
    /\.\./, // Consecutive dots
    /@\./, // @ followed by dot
    /\.@/, // Dot followed by @
    /^@/, // Starts with @
    /@$/, // Ends with @
  ];
  
  return !invalidPatterns.some(pattern => pattern.test(email));
}

/**
 * Username validation
 * @param {string} username - Username to validate
 * @returns {boolean} - Whether username is valid
 */
export function validateUsername(username) {
  if (!username || typeof username !== 'string') return false;
  
  // Length check
  if (username.length < 3 || username.length > 20) return false;
  
  // Character check - alphanumeric and underscore only
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) return false;
  
  // Check for reserved usernames
  const reservedUsernames = [
    'admin', 'administrator', 'mod', 'moderator', 'support', 'help',
    'info', 'contact', 'system', 'root', 'test', 'demo', 'guest',
    'anonymous', 'null', 'undefined', 'api', 'www', 'mail', 'ftp'
  ];
  
  if (reservedUsernames.includes(username.toLowerCase())) return false;
  
  return true;
}

/**
 * Password validation with strength checking
 * @param {string} password - Password to validate
 * @returns {Object} - Validation result with score and feedback
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { isValid: false, score: 0, feedback: 'Password is required' };
  }
  
  const minLength = 8;
  const maxLength = 128;
  
  if (password.length < minLength) {
    return { isValid: false, score: 0, feedback: `Password must be at least ${minLength} characters` };
  }
  
  if (password.length > maxLength) {
    return { isValid: false, score: 0, feedback: `Password must be less than ${maxLength} characters` };
  }
  
  // Check for common weak passwords
  const weakPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master'
  ];
  
  if (weakPasswords.includes(password.toLowerCase())) {
    return { isValid: false, score: 1, feedback: 'Password is too common' };
  }
  
  // Calculate strength score
  let score = 0;
  const feedback = [];
  
  // Length bonus
  if (password.length >= 12) score += 2;
  else if (password.length >= 8) score += 1;
  
  // Character variety bonuses
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 2;
  
  // Feedback
  if (score < 3) feedback.push('Add uppercase letters, numbers, or symbols');
  if (password.length < 12) feedback.push('Consider a longer password');
  
  const isValid = score >= 3;
  
  return {
    isValid,
    score: Math.min(score, 5),
    feedback: feedback.length > 0 ? feedback.join('. ') : 'Strong password'
  };
}

/**
 * Sanitize text input to prevent XSS
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
 */
export function sanitizeText(text) {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .replace(/[<>]/g, '') // Remove < and >
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize form data
 * @param {Object} formData - Form data to validate
 * @param {Object} schema - Validation schema
 * @returns {Object} - Validation result
 */
export function validateFormData(formData, schema) {
  const errors = {};
  const sanitizedData = {};
  
  for (const [field, rules] of Object.entries(schema)) {
    const value = formData[field];
    
    // Required check
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors[field] = rules.requiredMessage || `${field} is required`;
      continue;
    }
    
    // Skip validation if value is empty and not required
    if (!value && !rules.required) {
      sanitizedData[field] = value;
      continue;
    }
    
    // Type validation
    if (rules.type) {
      switch (rules.type) {
        case 'email':
          if (!validateEmail(value)) {
            errors[field] = 'Invalid email format';
            continue;
          }
          break;
        case 'username':
          if (!validateUsername(value)) {
            errors[field] = 'Username must be 3-20 characters, alphanumeric and underscore only';
            continue;
          }
          break;
        case 'password':
          const passwordValidation = validatePassword(value);
          if (!passwordValidation.isValid) {
            errors[field] = passwordValidation.feedback;
            continue;
          }
          break;
        case 'url':
          try {
            new URL(value);
          } catch {
            errors[field] = 'Invalid URL format';
            continue;
          }
          break;
        case 'number':
          if (isNaN(Number(value))) {
            errors[field] = 'Must be a number';
            continue;
          }
          break;
        case 'date':
          const date = new Date(value);
          if (isNaN(date.getTime())) {
            errors[field] = 'Invalid date format';
            continue;
          }
          break;
      }
    }
    
    // Length validation
    if (rules.minLength && value.length < rules.minLength) {
      errors[field] = `Minimum length is ${rules.minLength} characters`;
      continue;
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `Maximum length is ${rules.maxLength} characters`;
      continue;
    }
    
    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.patternMessage || 'Invalid format';
      continue;
    }
    
    // Custom validation
    if (rules.custom) {
      const customResult = rules.custom(value, formData);
      if (customResult !== true) {
        errors[field] = customResult;
        continue;
      }
    }
    
    // Sanitize if needed
    if (rules.sanitize) {
      sanitizedData[field] = sanitizeText(value);
    } else {
      sanitizedData[field] = value;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitizedData
  };
}

/**
 * Common validation schemas
 */
export const VALIDATION_SCHEMAS = {
  login: {
    identifier: {
      required: true,
      requiredMessage: 'Username or email is required',
      sanitize: true
    },
    password: {
      required: true,
      requiredMessage: 'Password is required'
    }
  },
  
  register: {
    username: {
      required: true,
      type: 'username',
      minLength: 3,
      maxLength: 20
    },
    fullName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      sanitize: true
    },
    email: {
      required: true,
      type: 'email'
    },
    password: {
      required: true,
      type: 'password'
    },
    dob: {
      required: true,
      type: 'date',
      custom: (value) => {
        const age = new Date().getFullYear() - new Date(value).getFullYear();
        return age >= 18 ? true : 'Must be at least 18 years old';
      }
    },
    gender: {
      required: true,
      custom: (value) => {
        const validGenders = ['male', 'female', 'non-binary', 'other'];
        return validGenders.includes(value) ? true : 'Please select a valid gender';
      }
    }
  },
  
  dare: {
    title: {
      required: true,
      minLength: 5,
      maxLength: 100,
      sanitize: true
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 1000,
      sanitize: true
    },
    difficulty: {
      required: true,
      custom: (value) => {
        const validDifficulties = ['titillating', 'arousing', 'explicit', 'edgy', 'hardcore'];
        return validDifficulties.includes(value) ? true : 'Please select a valid difficulty';
      }
    }
  },
  
  profile: {
    fullName: {
      required: true,
      minLength: 2,
      maxLength: 50,
      sanitize: true
    },
    bio: {
      maxLength: 500,
      sanitize: true
    },
    limits: {
      custom: (value) => {
        if (!Array.isArray(value)) return 'Limits must be an array';
        if (value.length > 20) return 'Maximum 20 limits allowed';
        return true;
      }
    }
  },
  
  offerSubmission: {
    difficulty: {
      required: true,
      custom: (value) => {
        const validDifficulties = ['titillating', 'arousing', 'explicit', 'edgy', 'hardcore'];
        return validDifficulties.includes(value) ? true : 'Please select a valid difficulty';
      }
    },
    description: {
      required: true,
      minLength: 10,
      maxLength: 1000,
      sanitize: true
    },
    tags: {
      custom: (value) => {
        if (!Array.isArray(value)) return 'Tags must be an array';
        if (value.length > 10) return 'Maximum 10 tags allowed';
        return true;
      }
    },
    privacy: {
      required: true,
      custom: (value) => {
        const validPrivacy = ['when_viewed', '30_days', 'never'];
        return validPrivacy.includes(value) ? true : 'Please select a valid privacy setting';
      }
    }
  }
};

/**
 * Rate limiting utility
 */
export class RateLimiter {
  constructor(maxAttempts = 5, windowMs = 60000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    this.attempts = new Map();
  }
  
  isAllowed(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    
    // Remove old attempts
    const recentAttempts = userAttempts.filter(timestamp => now - timestamp < this.windowMs);
    
    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);
    
    return true;
  }
  
  getRemainingAttempts(key) {
    const now = Date.now();
    const userAttempts = this.attempts.get(key) || [];
    const recentAttempts = userAttempts.filter(timestamp => now - timestamp < this.windowMs);
    return Math.max(0, this.maxAttempts - recentAttempts.length);
  }
  
  reset(key) {
    this.attempts.delete(key);
  }
}

// Export rate limiter instance with more lenient settings for pagination
export const rateLimiter = new RateLimiter(200, 60000); // 200 requests per minute instead of 5 