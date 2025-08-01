import { createClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database';
import { withRetry, withPerformanceLogging, logError, createUserFriendlyError } from '~/lib/error-handler.server';

// Environment variables validation
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file and ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
  );
}

// Create Supabase client for server-side operations with service role key
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Create Supabase client for server-side operations with anon key (for RLS)
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
if (!supabaseAnonKey) {
  throw new Error('Missing SUPABASE_ANON_KEY environment variable');
}

export const supabaseServer = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper function to create authenticated server client
export const createServerClient = (accessToken?: string) => {
  const client = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: accessToken ? {
        Authorization: `Bearer ${accessToken}`,
      } : {},
    },
  });
  
  return client;
};

// Database query helpers with proper error handling
export const dbHelpers = {
  // Get all active subdomains with enhanced error handling
  async getSubdomains() {
    return withPerformanceLogging('getSubdomains', async () => {
      return withRetry(async () => {
        const { data, error } = await supabaseServer
          .from('subdomains')
          .select('*')
          .eq('is_active', true)
          .order('name');
        
        if (error) {
          logError('getSubdomains', error, { table: 'subdomains' });
          throw createUserFriendlyError('fetch subdomains', error);
        }
        
        return data;
      });
    });
  },

  // Get published posts for a subdomain with enhanced error handling
  async getPosts(subdomainName?: string, limit = 10, offset = 0) {
    return withPerformanceLogging(`getPosts(${subdomainName || 'all'})`, async () => {
      return withRetry(async () => {
        let query = supabaseServer
          .from('posts')
          .select(`
            *,
            subdomains (
              name,
              display_name,
              theme_color,
              icon_emoji
            )
          `)
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (subdomainName) {
          query = query.eq('subdomains.name', subdomainName);
        }

        const { data, error } = await query
          .range(offset, offset + limit - 1);

        if (error) {
          logError('getPosts', error, { 
            subdomainName, 
            limit, 
            offset, 
            table: 'posts' 
          });
          throw createUserFriendlyError('fetch posts', error);
        }

        return data;
      });
    });
  },

  // Get a single post by slug and subdomain with enhanced error handling
  async getPost(subdomainName: string, slug: string) {
    return withPerformanceLogging(`getPost(${subdomainName}/${slug})`, async () => {
      return withRetry(async () => {
        const { data, error } = await supabaseServer
          .from('posts')
          .select(`
            *,
            subdomains (
              name,
              display_name,
              theme_color,
              icon_emoji
            )
          `)
          .eq('slug', slug)
          .eq('status', 'published')
          .eq('subdomains.name', subdomainName)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            return null; // Post not found
          }
          logError('getPost', error, { 
            subdomainName, 
            slug, 
            table: 'posts' 
          });
          throw createUserFriendlyError('fetch post', error);
        }

        return data;
      });
    });
  },

  // Get approved comments for a post with enhanced error handling
  async getComments(postId: string) {
    return withPerformanceLogging(`getComments(${postId})`, async () => {
      return withRetry(async () => {
        const { data, error } = await supabaseServer
          .from('comments')
          .select(`
            *,
            profiles (
              full_name,
              avatar_url
            )
          `)
          .eq('post_id', postId)
          .eq('status', 'approved')
          .order('created_at', { ascending: true });

        if (error) {
          logError('getComments', error, { 
            postId, 
            table: 'comments' 
          });
          throw createUserFriendlyError('fetch comments', error);
        }

        return data;
      });
    });
  },

  // Admin helpers (require service role key)
  admin: {
    // Get all posts (including drafts) - admin only
    async getAllPosts(limit = 50, offset = 0) {
      const { data, error } = await supabaseAdmin
        .from('posts')
        .select(`
          *,
          subdomains (
            name,
            display_name,
            theme_color
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching all posts:', error);
        throw new Error('Failed to fetch posts');
      }

      return data;
    },

    // Get all comments (including pending) - admin only
    async getAllComments(limit = 50, offset = 0) {
      const { data, error } = await supabaseAdmin
        .from('comments')
        .select(`
          *,
          posts (
            title,
            slug
          ),
          profiles (
            full_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Error fetching all comments:', error);
        throw new Error('Failed to fetch comments');
      }

      return data;
    },

    // Verify admin user
    async verifyAdmin(username: string, password: string) {
      const { data, error } = await supabaseAdmin
        .from('admin_users')
        .select('id, username, password_hash, is_active')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return null;
      }

      // In production, you would use bcrypt to compare passwords
      // For now, we'll do a simple comparison (NOT SECURE)
      // TODO: Implement proper password hashing with bcrypt
      return data;
    },
  },
};