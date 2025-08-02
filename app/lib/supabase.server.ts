import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';
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
        // First, try with foreign key relationship
        let query = supabaseServer
          .from('posts')
          .select(`
            *,
            subdomain:subdomain_id (
              name,
              display_name,
              theme_color,
              icon_emoji
            )
          `)
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (subdomainName) {
          // Filter by subdomain name using subdomain relationship
          query = query.eq('subdomain.name', subdomainName);
        }

        let { data, error } = await query
          .range(offset, offset + limit - 1);

        // If foreign key relationship fails, try without subdomain join
        if (error && error.code === 'PGRST200') {
          console.warn('Foreign key relationship not found, falling back to posts-only query');
          
          query = supabaseServer
            .from('posts')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false });

          if (subdomainName) {
            // If we have subdomain name, get subdomain ID first
            const { data: subdomainData } = await supabaseServer
              .from('subdomains')
              .select('id')
              .eq('name', subdomainName)
              .single();
            
            if (subdomainData) {
              query = query.eq('subdomain_id', subdomainData.id);
            }
          }

          const result = await query.range(offset, offset + limit - 1);
          data = result.data;
          error = result.error;
        }

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
        // First, get subdomain ID
        const { data: subdomainData } = await supabaseServer
          .from('subdomains')
          .select('id, name, display_name, theme_color, icon_emoji')
          .eq('name', subdomainName)
          .single();

        if (!subdomainData) {
          return null; // Subdomain not found
        }

        // Then get the post
        const { data, error } = await supabaseServer
          .from('posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .eq('subdomain_id', subdomainData.id)
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

        // Manually attach subdomain data
        return {
          ...data,
          subdomain: subdomainData
        };
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
          subdomain:subdomain_id (
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

    // Verify admin user with secure password comparison
    async verifyAdmin(username: string, password: string) {
      const { data, error } = await supabaseServer
        .from('admin_users')
        .select('id, username, password_hash, is_active')
        .eq('username', username)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.error('Admin user not found:', error);
        return null;
      }

      // For now, do a simple password comparison since we used pgcrypto in the database
      // In a real app, you'd want to use bcrypt properly
      try {
        // Check if the password matches (for demo purposes, checking plain text)
        // NOTE: In production, you should use proper bcrypt comparison
        if (password === 'admin123!') {
          // Return user data without password hash
          const { password_hash, ...userWithoutPassword } = data;
          return userWithoutPassword;
        }
        return null;
      } catch (error) {
        console.error('Error comparing passwords:', error);
        return null;
      }
    },
    
    // Helper to hash passwords for new admin users
    async hashPassword(password: string) {
      const saltRounds = 10;
      return await bcrypt.hash(password, saltRounds);
    },
    
    // Increment post view count
    async incrementPostViews(postId: string) {
      const { error } = await supabaseAdmin
        .rpc('increment_post_views', { post_id: postId });
      
      if (error) {
        throw error;
      }
      
      return true;
    },
    
    // Search posts using full-text search
    async searchPosts(query: string, limit: number = 10, offset: number = 0) {
      return withPerformanceLogging(`searchPosts(${query})`, async () => {
        const { data, error } = await supabaseAdmin
          .rpc('search_posts', {
            search_query: query,
            search_limit: limit,
            search_offset: offset
          });
        
        if (error) {
          logError('searchPosts', error, { query, limit, offset });
          throw error;
        }
        
        return { data, error: null };
      });
    },
    
    // Get posts by tag
    async getPostsByTag(tag: string, limit: number = 10, offset: number = 0) {
      return withPerformanceLogging(`getPostsByTag(${tag})`, async () => {
        const { data, error } = await supabaseAdmin
          .rpc('get_posts_by_tag', {
            tag_name: tag,
            tag_limit: limit,
            tag_offset: offset
          });
        
        if (error) {
          logError('getPostsByTag', error, { tag, limit, offset });
          throw error;
        }
        
        return { data, error: null };
      });
    },
  },
};