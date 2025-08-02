import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database';

// Get Supabase config from window object (injected by server)
// This is a safer approach than exposing all ENV vars
function getSupabaseConfig() {
  if (typeof window === 'undefined') {
    // During SSR, return empty config
    return { url: '', anonKey: '' };
  }
  
  // In production, these should be injected via a more secure method
  // For now, we'll use data attributes on the root element
  const rootElement = document.getElementById('root');
  const url = rootElement?.getAttribute('data-supabase-url') || '';
  const anonKey = rootElement?.getAttribute('data-supabase-anon-key') || '';
  
  return { url, anonKey };
}

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getSupabaseConfig();

// Create Supabase client for client-side operations
// Note: This will only work after hydration when the config is available
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'magzin-blog-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
})
  : null as any; // Temporary null client before hydration

// Helper function to get current user
export const getCurrentUser = async () => {
  if (!supabase) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error getting current user:', error);
    return null;
  }
  return user;
};

// Helper function to sign out
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Helper function to sign in with Google
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
  
  return data;
};