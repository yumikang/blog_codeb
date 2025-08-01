-- ===================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===================================================================
-- Security policies based on Supabase best practices
-- Ensures proper access control for multi-blog system
-- ===================================================================

-- ===================================================================
-- 1. ENABLE RLS ON ALL TABLES
-- ===================================================================
ALTER TABLE public.subdomains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- 2. SUBDOMAINS TABLE POLICIES
-- ===================================================================
-- Public read access for all active subdomains
CREATE POLICY "Public read access for active subdomains"
ON public.subdomains
FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Admin-only write access for subdomains
CREATE POLICY "Admin can manage subdomains"
ON public.subdomains
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true
    )
);

-- ===================================================================
-- 3. POSTS TABLE POLICIES
-- ===================================================================
-- Public read access for published posts
CREATE POLICY "Public read access for published posts"
ON public.posts
FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Admin can view all posts (including drafts)
CREATE POLICY "Admin can view all posts"
ON public.posts
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true
    )
);

-- Admin can insert posts
CREATE POLICY "Admin can create posts"
ON public.posts
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true
    )
);

-- Admin can update posts
CREATE POLICY "Admin can update posts"
ON public.posts
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true
    )
);

-- Admin can delete posts
CREATE POLICY "Admin can delete posts"
ON public.posts
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true
    )
);

-- ===================================================================
-- 4. COMMENTS TABLE POLICIES
-- ===================================================================
-- Public read access for approved comments
CREATE POLICY "Public read access for approved comments"
ON public.comments
FOR SELECT
TO anon, authenticated
USING (status = 'approved');

-- Authenticated users can view their own comments (any status)
CREATE POLICY "Users can view their own comments"
ON public.comments
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admin can view all comments
CREATE POLICY "Admin can view all comments"
ON public.comments
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true
    )
);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
ON public.comments
FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Users can update their own comments (within time limit or if pending)
CREATE POLICY "Users can update their own pending comments"
ON public.comments
FOR UPDATE
TO authenticated
USING (
    user_id = auth.uid() 
    AND (
        status = 'pending' 
        OR created_at > (now() - interval '15 minutes')
    )
)
WITH CHECK (user_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
ON public.comments
FOR DELETE
TO authenticated
USING (user_id = auth.uid());

-- Admin can manage all comments
CREATE POLICY "Admin can manage all comments"
ON public.comments
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true
    )
);

-- ===================================================================
-- 5. ADMIN USERS TABLE POLICIES
-- ===================================================================
-- Very restrictive access for admin_users table
-- Only admins can view other admins
CREATE POLICY "Admin can view admin users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (
    id = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true
    )
);

-- Only existing admins can create new admins
CREATE POLICY "Admin can create admin users"
ON public.admin_users
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true
    )
);

-- Admins can update themselves or other admins
CREATE POLICY "Admin can update admin users"
ON public.admin_users
FOR UPDATE
TO authenticated
USING (
    id = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true
    )
)
WITH CHECK (
    id = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true
    )
);

-- Only admins can delete admin users (not themselves)
CREATE POLICY "Admin can delete other admin users"
ON public.admin_users
FOR DELETE
TO authenticated
USING (
    id != auth.uid() 
    AND EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE id = auth.uid() AND is_active = true
    )
);

-- ===================================================================
-- 6. PROFILES TABLE POLICIES
-- ===================================================================
-- Public read access for all profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
TO anon, authenticated
USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
TO authenticated
USING (id = auth.uid());

-- ===================================================================
-- 7. ADDITIONAL SECURITY FUNCTIONS
-- ===================================================================
-- Function to create user profile after auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY definer SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$;

-- Trigger to automatically create profile for new users
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to check comment rate limiting (prevent spam)
CREATE OR REPLACE FUNCTION public.check_comment_rate_limit()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if user has posted more than 5 comments in the last hour
    IF (
        SELECT COUNT(*)
        FROM public.comments
        WHERE user_id = NEW.user_id
        AND created_at > (now() - interval '1 hour')
    ) >= 5 THEN
        RAISE EXCEPTION 'Rate limit exceeded. Please wait before posting another comment.';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply rate limiting trigger to comments
CREATE TRIGGER comment_rate_limit_trigger
    BEFORE INSERT ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.check_comment_rate_limit();