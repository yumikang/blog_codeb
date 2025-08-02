-- Magzin Blog Database Schema
-- Execute this SQL in Supabase SQL Editor

-- Create subdomains table (categories)
CREATE TABLE IF NOT EXISTS public.subdomains (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    theme_color TEXT DEFAULT 'primary',
    description TEXT,
    icon_emoji TEXT DEFAULT '📰',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create posts table 
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain_id BIGINT NOT NULL REFERENCES public.subdomains(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    featured_image_url TEXT,
    featured_image_alt TEXT,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    meta_title TEXT,
    meta_description TEXT,
    tags TEXT[] DEFAULT '{}',
    view_count INTEGER DEFAULT 0,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(subdomain_id, slug)
);

-- Create profiles table (for user authentication)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')),
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    email TEXT,
    full_name TEXT,
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_subdomain_id ON public.posts(subdomain_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON public.comments(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.subdomains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
CREATE POLICY "Subdomains are publicly readable" ON public.subdomains
    FOR SELECT USING (is_active = true);

CREATE POLICY "Published posts are publicly readable" ON public.posts
    FOR SELECT USING (status = 'published');

CREATE POLICY "Profiles are publicly readable" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Approved comments are publicly readable" ON public.comments
    FOR SELECT USING (status = 'approved');

-- Create policies for authenticated users
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

-- Admin policies (only for admin users)
CREATE POLICY "Admins can manage subdomains" ON public.subdomains
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() AND is_active = true
    ));

CREATE POLICY "Admins can manage posts" ON public.posts
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() AND is_active = true
    ));

CREATE POLICY "Admins can manage comments" ON public.comments
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.admin_users 
        WHERE id = auth.uid() AND is_active = true
    ));

-- Insert sample data
INSERT INTO public.subdomains (name, display_name, theme_color, description, icon_emoji) VALUES
    ('tech', 'Technology', 'primary', 'Latest innovations, gadgets, and tech trends', '💻'),
    ('food', 'Food & Culture', 'success', 'Global cuisines, recipes, and culinary traditions', '🍽️'),
    ('travel', 'Travel', 'warning', 'Destinations, travel tips, and adventure stories', '✈️'),
    ('lifestyle', 'Lifestyle', 'info', 'Health, wellness, and modern living', '🌟'),
    ('business', 'Business', 'dark', 'Market trends, entrepreneurship, and finance', '📈'),
    ('health', 'Health', 'success', 'Medical breakthroughs and wellness tips', '🏥')
ON CONFLICT (name) DO NOTHING;

-- Insert sample admin user (password: admin123)
INSERT INTO public.admin_users (username, password_hash, email, full_name) VALUES
    ('admin', '$2a$10$5K8K5S8QL5z9n9Lq7yQ8yOc5yOc5yOc5yOc5yOc5yOc5yOc5yO', 'admin@magzin.com', 'Magzin Admin')
ON CONFLICT (username) DO NOTHING;

-- Insert sample posts
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, status, published_at) VALUES
    (1, 'The Future of AI Technology', 'future-of-ai-technology', 
     'Artificial intelligence continues to evolve at an unprecedented pace...', 
     'Exploring the latest developments in AI and their impact on society.', 
     'published', NOW() - INTERVAL '1 day'),
    (2, 'Traditional Korean Cuisine Guide', 'traditional-korean-cuisine-guide',
     'Korean food culture is rich with tradition and flavor...', 
     'A comprehensive guide to understanding Korean culinary traditions.',
     'published', NOW() - INTERVAL '2 days'),
    (3, 'Best Travel Destinations 2024', 'best-travel-destinations-2024',
     'Discover the most exciting places to visit this year...', 
     'Our curated list of must-visit destinations for 2024.',
     'published', NOW() - INTERVAL '3 days')
ON CONFLICT (subdomain_id, slug) DO NOTHING;