// Error handling utilities for server-side operations

export interface DatabaseError {
  code: string;
  message: string;
  details?: any;
  hint?: string;
}

/**
 * Enhanced error logging with context
 */
export function logError(operation: string, error: any, context?: Record<string, any>) {
  const errorInfo = {
    operation,
    timestamp: new Date().toISOString(),
    error: {
      message: error?.message || 'Unknown error',
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      stack: error?.stack
    },
    context
  };

  console.error(`[DB Error] ${operation}:`, errorInfo);
  
  // In production, you might want to send this to a logging service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to logging service (e.g., Sentry, LogRocket, etc.)
  }
}

/**
 * Create a user-friendly error message from database error
 */
export function createUserFriendlyError(operation: string, error: any): Error {
  const errorMessage = error?.message || 'Unknown database error';
  
  // Map common database errors to user-friendly messages
  if (error?.code === 'PGRST116') {
    return new Error(`No data found for ${operation}`);
  }
  
  if (error?.code === 'PGRST301') {
    return new Error(`Invalid request for ${operation}`);
  }
  
  if (error?.code === '42P01') {
    return new Error(`Database table not found for ${operation}`);
  }
  
  if (error?.code === '42703') {
    return new Error(`Database column not found for ${operation}`);
  }
  
  if (error?.message?.includes('JWT expired')) {
    return new Error('Authentication expired. Please refresh the page.');
  }
  
  if (error?.message?.includes('network')) {
    return new Error(`Network error during ${operation}. Please check your connection.`);
  }
  
  // Default fallback
  return new Error(`Failed to ${operation}. Please try again later.`);
}

/**
 * Retry mechanism for database operations
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      
      // Don't retry on certain errors
      if ((error as any)?.code === 'PGRST116' || (error as any)?.code === 'PGRST301') {
        throw error;
      }
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
  
  throw lastError;
}

/**
 * Check if environment is properly configured
 */
export function validateDatabaseConnection() {
  const requiredEnvVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate URL format
  try {
    new URL(process.env.SUPABASE_URL!);
  } catch {
    throw new Error('SUPABASE_URL must be a valid URL');
  }
}

/**
 * Measure and log operation performance
 */
export async function withPerformanceLogging<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    const duration = Date.now() - startTime;
    
    if (duration > 1000) {
      console.warn(`[Performance] ${operationName} took ${duration}ms`);
    } else {
      console.log(`[Performance] ${operationName} completed in ${duration}ms`);
    }
    
    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`[Performance] ${operationName} failed after ${duration}ms:`, error);
    throw error;
  }
}