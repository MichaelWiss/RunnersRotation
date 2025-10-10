/**
 * Validation utilities for user inputs.
 */

/**
 * Validate email format.
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
}

/**
 * Validate password strength.
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  // Add more rules if needed, e.g., uppercase, numbers, etc.
  return { isValid: true };
}

/**
 * Normalize Shopify Storefront API errors into user-friendly messages.
 */
export function normalizeStorefrontErrors(errors: any[]): string[] {
  if (!errors || !Array.isArray(errors)) return [];

  return errors.map((error) => {
    // Map common error codes to friendly messages
    switch (error.code) {
      case 'INVALID_CREDENTIALS':
        return 'Invalid email or password';
      case 'CUSTOMER_DISABLED':
        return 'Your account has been disabled';
      case 'CUSTOMER_NOT_FOUND':
        return 'No account found with this email';
      case 'PASSWORD_STARTS_OR_ENDS_WITH_WHITESPACE':
        return 'Password cannot start or end with spaces';
      case 'TOO_SHORT':
        return 'Password is too short';
      case 'TOO_LONG':
        return 'Password is too long';
      case 'INVALID':
        return 'Invalid input';
      case 'TAKEN':
        return 'This email is already in use';
      case 'BLANK':
        return 'This field cannot be blank';
      default:
        return error.message || 'An error occurred';
    }
  });
}