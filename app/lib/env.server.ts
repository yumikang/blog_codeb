// Environment variable validation for server-side operations
// This file ensures all required environment variables are present and valid

/**
 * Environment variable configuration and validation
 */
export interface EnvironmentConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Validates and returns environment configuration
 * Throws error if required variables are missing
 */
export function validateEnvironment(): EnvironmentConfig {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const nodeEnv = process.env.NODE_ENV || 'development';

  // Validate required Supabase environment variables
  if (!supabaseUrl) {
    throw new Error(
      'SUPABASE_URL environment variable is required. Please check your .env file.'
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'SUPABASE_ANON_KEY environment variable is required. Please check your .env file.'
    );
  }

  if (!supabaseServiceRoleKey) {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY environment variable is required. Please check your .env file.'
    );
  }

  // Validate URL format
  try {
    new URL(supabaseUrl);
  } catch {
    throw new Error(
      'SUPABASE_URL must be a valid URL format (e.g., https://your-project.supabase.co)'
    );
  }

  // Validate that keys are not placeholder values
  if (supabaseUrl.includes('your-project-ref') || supabaseUrl === 'https://your-project-ref.supabase.co') {
    throw new Error(
      'SUPABASE_URL appears to be a placeholder. Please set your actual Supabase project URL.'
    );
  }

  if (supabaseAnonKey.includes('your_supabase') || supabaseAnonKey === 'your_supabase_anon_key_here') {
    throw new Error(
      'SUPABASE_ANON_KEY appears to be a placeholder. Please set your actual Supabase anon key.'
    );
  }

  if (supabaseServiceRoleKey.includes('your_supabase') || supabaseServiceRoleKey === 'your_supabase_service_role_key_here') {
    throw new Error(
      'SUPABASE_SERVICE_ROLE_KEY appears to be a placeholder. Please set your actual Supabase service role key.'
    );
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
    isDevelopment: nodeEnv === 'development',
    isProduction: nodeEnv === 'production',
  };
}

/**
 * Gets environment configuration safely
 * Returns null if validation fails instead of throwing
 */
export function getEnvironmentConfig(): EnvironmentConfig | null {
  try {
    return validateEnvironment();
  } catch (error) {
    console.error('Environment validation failed:', error);
    return null;
  }
}

/**
 * Checks if environment is properly configured for development
 */
export function isEnvironmentReady(): boolean {
  try {
    validateEnvironment();
    return true;
  } catch {
    return false;
  }
}