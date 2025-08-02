// Database type definitions for Supabase
// Auto-generated based on database schema

export interface Database {
  public: {
    Tables: {
      subdomains: {
        Row: {
          id: number;
          name: string;
          display_name: string;
          theme_color: string;
          description: string | null;
          icon_emoji: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          name: string;
          display_name: string;
          theme_color?: string;
          description?: string | null;
          icon_emoji?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          name?: string;
          display_name?: string;
          theme_color?: string;
          description?: string | null;
          icon_emoji?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          subdomain_id: number;
          title: string;
          slug: string;
          content: string | null;
          excerpt: string | null;
          featured_image_url: string | null;
          featured_image_alt: string | null;
          status: 'draft' | 'published' | 'archived';
          meta_title: string | null;
          meta_description: string | null;
          tags: string[] | null;
          view_count: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          subdomain_id: number;
          title: string;
          slug: string;
          content?: string | null;
          excerpt?: string | null;
          featured_image_url?: string | null;
          featured_image_alt?: string | null;
          status?: 'draft' | 'published' | 'archived';
          meta_title?: string | null;
          meta_description?: string | null;
          tags?: string[] | null;
          view_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          subdomain_id?: number;
          title?: string;
          slug?: string;
          content?: string | null;
          excerpt?: string | null;
          featured_image_url?: string | null;
          featured_image_alt?: string | null;
          status?: 'draft' | 'published' | 'archived';
          meta_title?: string | null;
          meta_description?: string | null;
          tags?: string[] | null;
          view_count?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          status: 'pending' | 'approved' | 'rejected' | 'spam';
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          status?: 'pending' | 'approved' | 'rejected' | 'spam';
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          status?: 'pending' | 'approved' | 'rejected' | 'spam';
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          email: string | null;
          full_name: string | null;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password_hash: string;
          email?: string | null;
          full_name?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password_hash?: string;
          email?: string | null;
          full_name?: string | null;
          is_active?: boolean;
          last_login_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          website: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          website?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Type aliases for easier use
export type Subdomain = Database['public']['Tables']['subdomains']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type Comment = Database['public']['Tables']['comments']['Row'];
export type AdminUser = Database['public']['Tables']['admin_users']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

// Extended types with relations
export type PostWithSubdomain = Post & {
  subdomain?: Subdomain;
};

export type CommentWithProfile = Comment & {
  profiles?: Profile;
};

export type PostWithComments = PostWithSubdomain & {
  comments?: CommentWithProfile[];
};

// Admin types
export type AdminSession = {
  id: string;
  admin_user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
};

// Insert types
export type SubdomainInsert = Database['public']['Tables']['subdomains']['Insert'];
export type PostInsert = Database['public']['Tables']['posts']['Insert'];
export type CommentInsert = Database['public']['Tables']['comments']['Insert'];
export type AdminUserInsert = Database['public']['Tables']['admin_users']['Insert'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

// Update types
export type SubdomainUpdate = Database['public']['Tables']['subdomains']['Update'];
export type PostUpdate = Database['public']['Tables']['posts']['Update'];
export type CommentUpdate = Database['public']['Tables']['comments']['Update'];
export type AdminUserUpdate = Database['public']['Tables']['admin_users']['Update'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];