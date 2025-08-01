-- ===================================================================
-- MAGZIN BLOG MULTI-SUBDOMAIN DATABASE SCHEMA
-- ===================================================================
-- Created for multi-blog system with 10 subdomains
-- Includes RLS policies for security and proper indexing
-- ===================================================================

-- ===================================================================
-- 1. SUBDOMAINS TABLE
-- ===================================================================
-- Stores information about each subdomain (tech, food, travel, etc.)
CREATE TABLE public.subdomains (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL CHECK (length(name) >= 2 AND length(name) <= 20),
    display_name TEXT NOT NULL CHECK (length(display_name) >= 2 AND length(display_name) <= 50),
    theme_color TEXT NOT NULL DEFAULT 'primary' CHECK (theme_color IN ('primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark')),
    description TEXT CHECK (length(description) <= 500),
    icon_emoji TEXT CHECK (length(icon_emoji) <= 10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for faster subdomain lookups
CREATE INDEX idx_subdomains_name ON public.subdomains(name);
CREATE INDEX idx_subdomains_active ON public.subdomains(is_active);

-- ===================================================================
-- 2. POSTS TABLE
-- ===================================================================
-- Stores blog posts for each subdomain
CREATE TABLE public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain_id BIGINT REFERENCES public.subdomains(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL CHECK (length(title) >= 5 AND length(title) <= 200),
    slug TEXT NOT NULL CHECK (length(slug) >= 5 AND length(slug) <= 200),
    content TEXT CHECK (length(content) >= 10),
    excerpt TEXT CHECK (length(excerpt) <= 500),
    featured_image_url TEXT,
    featured_image_alt TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')) NOT NULL,
    meta_title TEXT CHECK (length(meta_title) <= 60),
    meta_description TEXT CHECK (length(meta_description) <= 160),
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Unique constraint for slug per subdomain
ALTER TABLE public.posts ADD CONSTRAINT posts_subdomain_slug_unique UNIQUE (subdomain_id, slug);

-- Indexes for better query performance
CREATE INDEX idx_posts_subdomain_id ON public.posts(subdomain_id);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX idx_posts_created_at ON public.posts(created_at DESC);
CREATE INDEX idx_posts_slug ON public.posts(slug);
CREATE INDEX idx_posts_tags ON public.posts USING GIN(tags);

-- ===================================================================
-- 3. COMMENTS TABLE
-- ===================================================================
-- Stores comments for posts (requires Google OAuth authentication)
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 2000),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')) NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE, -- For nested comments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Indexes for comment queries
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_status ON public.comments(status);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);
CREATE INDEX idx_comments_parent_id ON public.comments(parent_id);

-- ===================================================================
-- 4. ADMIN USERS TABLE
-- ===================================================================
-- Stores admin user credentials (separate from auth.users for Google OAuth)
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL CHECK (length(username) >= 3 AND length(username) <= 50),
    password_hash TEXT NOT NULL,
    email TEXT UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    full_name TEXT CHECK (length(full_name) <= 100),
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index for admin login
CREATE INDEX idx_admin_users_username ON public.admin_users(username);
CREATE INDEX idx_admin_users_email ON public.admin_users(email);
CREATE INDEX idx_admin_users_active ON public.admin_users(is_active);

-- ===================================================================
-- 5. USER PROFILES TABLE (for Google OAuth users)
-- ===================================================================
-- Extended profile information for authenticated users
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    bio TEXT CHECK (length(bio) <= 500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ===================================================================
-- 6. TRIGGER FUNCTIONS FOR UPDATED_AT
-- ===================================================================
-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_subdomains_updated_at
    BEFORE UPDATE ON public.subdomains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
    BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at
    BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===================================================================
-- 7. HELPER FUNCTIONS
-- ===================================================================
-- Function to check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = user_id AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's profile
CREATE OR REPLACE FUNCTION auth.get_user_profile()
RETURNS public.profiles AS $$
DECLARE
    profile public.profiles;
BEGIN
    SELECT * INTO profile
    FROM public.profiles
    WHERE id = auth.uid();
    
    RETURN profile;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;