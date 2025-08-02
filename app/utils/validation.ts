/**
 * Input validation utilities
 */

// Common validation patterns
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  username: /^[a-zA-Z0-9_-]{3,20}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  hexColor: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
};

/**
 * Validate email format
 */
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email) {
    return { valid: false, error: 'Email is required' };
  }
  
  if (!patterns.email.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }
  
  if (email.length > 255) {
    return { valid: false, error: 'Email must be less than 255 characters' };
  }
  
  return { valid: true };
}

/**
 * Validate username format
 */
export function validateUsername(username: string): { valid: boolean; error?: string } {
  if (!username) {
    return { valid: false, error: 'Username is required' };
  }
  
  if (!patterns.username.test(username)) {
    return { valid: false, error: 'Username must be 3-20 characters and contain only letters, numbers, underscore, or hyphen' };
  }
  
  return { valid: true };
}

/**
 * Validate password strength
 */
export function validatePassword(password: string): { valid: boolean; error?: string; strength?: 'weak' | 'medium' | 'strong' } {
  if (!password) {
    return { valid: false, error: 'Password is required' };
  }
  
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (password.length > 100) {
    return { valid: false, error: 'Password must be less than 100 characters' };
  }
  
  // Calculate password strength
  let strength = 0;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  const strengthLevel = strength <= 2 ? 'weak' : strength <= 3 ? 'medium' : 'strong';
  
  if (strengthLevel === 'weak') {
    return { 
      valid: false, 
      error: 'Password is too weak. Include uppercase, lowercase, numbers, and special characters',
      strength: strengthLevel 
    };
  }
  
  return { valid: true, strength: strengthLevel };
}

/**
 * Validate slug format
 */
export function validateSlug(slug: string): { valid: boolean; error?: string } {
  if (!slug) {
    return { valid: false, error: 'Slug is required' };
  }
  
  if (!patterns.slug.test(slug)) {
    return { valid: false, error: 'Slug must contain only lowercase letters, numbers, and hyphens' };
  }
  
  if (slug.length > 200) {
    return { valid: false, error: 'Slug must be less than 200 characters' };
  }
  
  return { valid: true };
}

/**
 * Validate URL format
 */
export function validateUrl(url: string): { valid: boolean; error?: string } {
  if (!url) {
    return { valid: true }; // URL might be optional
  }
  
  if (!patterns.url.test(url)) {
    return { valid: false, error: 'Invalid URL format' };
  }
  
  return { valid: true };
}

/**
 * Validate hex color format
 */
export function validateHexColor(color: string): { valid: boolean; error?: string } {
  if (!color) {
    return { valid: false, error: 'Color is required' };
  }
  
  if (!patterns.hexColor.test(color)) {
    return { valid: false, error: 'Invalid hex color format (e.g., #FF5733)' };
  }
  
  return { valid: true };
}

/**
 * Validate comment content
 */
export function validateComment(content: string): { valid: boolean; error?: string } {
  if (!content || !content.trim()) {
    return { valid: false, error: 'Comment cannot be empty' };
  }
  
  const trimmed = content.trim();
  
  if (trimmed.length < 3) {
    return { valid: false, error: 'Comment must be at least 3 characters long' };
  }
  
  if (trimmed.length > 1000) {
    return { valid: false, error: 'Comment must be less than 1000 characters' };
  }
  
  // Check for spam patterns
  const spamPatterns = [
    /\b(viagra|cialis|casino|lottery|prize|winner)\b/i,
    /\b(click here|buy now|limited offer)\b/i,
    /(http|https):\/\/[^\s]+/g, // URLs in comments
  ];
  
  for (const pattern of spamPatterns) {
    if (pattern.test(trimmed)) {
      return { valid: false, error: 'Comment contains prohibited content' };
    }
  }
  
  return { valid: true };
}

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeHtml(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize search query
 */
export function validateSearchQuery(query: string): { valid: boolean; sanitized: string; error?: string } {
  if (!query || !query.trim()) {
    return { valid: false, sanitized: '', error: 'Search query cannot be empty' };
  }
  
  const trimmed = query.trim();
  
  if (trimmed.length < 2) {
    return { valid: false, sanitized: trimmed, error: 'Search query must be at least 2 characters' };
  }
  
  if (trimmed.length > 100) {
    return { valid: false, sanitized: trimmed.substring(0, 100), error: 'Search query is too long' };
  }
  
  // Remove potentially dangerous characters
  const sanitized = trimmed.replace(/[<>\"'\/\\]/g, '');
  
  return { valid: true, sanitized };
}