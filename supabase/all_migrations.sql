-- ===================================================================
-- MAGZIN BLOG 초기 스키마 마이그레이션
-- ===================================================================

-- 1. 서브도메인 테이블
CREATE TABLE IF NOT EXISTS public.subdomains (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL CHECK (length(name) >= 2 AND length(name) <= 20),
    display_name TEXT NOT NULL CHECK (length(display_name) >= 2 AND length(display_name) <= 50),
    theme_color TEXT NOT NULL DEFAULT 'primary',
    description TEXT CHECK (length(description) <= 500),
    icon_emoji TEXT CHECK (length(icon_emoji) <= 10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. 프로필 테이블
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    website TEXT,
    bio TEXT CHECK (length(bio) <= 500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. 포스트 테이블
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subdomain_id BIGINT REFERENCES public.subdomains(id) ON DELETE CASCADE NOT NULL,
    author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(subdomain_id, slug)
);

-- 4. 댓글 테이블
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL CHECK (length(content) >= 1 AND length(content) <= 2000),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'spam')) NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. 관리자 테이블
CREATE TABLE IF NOT EXISTS public.admin_users (
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

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_subdomains_name ON public.subdomains(name);
CREATE INDEX IF NOT EXISTS idx_subdomains_active ON public.subdomains(is_active);
CREATE INDEX IF NOT EXISTS idx_posts_subdomain_id ON public.posts(subdomain_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON public.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON public.posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON public.posts(slug);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON public.comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON public.comments(status);

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_subdomains_updated_at BEFORE UPDATE ON public.subdomains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();-- ===================================================================
-- 초기 데이터 삽입
-- ===================================================================

-- 1. 10개 서브도메인 삽입
INSERT INTO public.subdomains (name, display_name, theme_color, description, icon_emoji, is_active) 
VALUES 
  ('tech', '테크놀로지', 'primary', '최신 기술 트렌드와 혁신적인 IT 소식', '💻', true),
  ('food', '푸드 & 쿠킹', 'danger', '맛있는 레시피와 맛집 탐방기', '🍳', true),
  ('travel', '여행', 'success', '세계 각지의 여행 가이드와 팁', '✈️', true),
  ('lifestyle', '라이프스타일', 'warning', '패션, 웰빙, 그리고 현대적인 삶', '🌟', true),
  ('business', '비즈니스', 'dark', '창업, 금융, 커리어 조언', '💼', true),
  ('health', '건강 & 웰빙', 'info', '피트니스, 영양, 정신 건강', '🏃', true),
  ('sports', '스포츠', 'warning', '스포츠 뉴스와 분석, 피트니스 팁', '⚽', true),
  ('entertainment', '엔터테인먼트', 'secondary', '영화, 드라마, 음악, 대중문화', '🎬', true),
  ('science', '과학', 'primary', '과학적 발견과 기술 혁신', '🔬', true),
  ('education', '교육', 'warning', '학습 자료와 교육 콘텐츠', '📚', true)
ON CONFLICT (name) DO NOTHING;

-- 2. 관리자 계정 생성 (pgcrypto extension 필요)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO public.admin_users (username, password_hash, email, full_name, is_active) 
VALUES 
  ('admin', crypt('admin123!', gen_salt('bf')), 'admin@magzin.com', '관리자', true)
ON CONFLICT (username) DO NOTHING;

-- 3. 각 서브도메인에 샘플 포스트 추가
-- Tech 포스트
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, featured_image_url, status, tags, published_at)
SELECT 
  s.id,
  '2024년 주목해야 할 AI 기술 트렌드',
  '2024-ai-technology-trends',
  '<p>인공지능 기술이 빠르게 발전하면서 우리의 일상생활과 비즈니스 환경을 크게 변화시키고 있습니다.</p>',
  '2024년 AI 기술은 생성형 AI의 진화, AI 에이전트의 등장, 엣지 AI의 확산 등 혁신적인 변화를 맞이하고 있습니다.',
  '/assets/imgs/page/img-112.png',
  'published',
  ARRAY['AI', '인공지능', '기술트렌드'],
  NOW() - INTERVAL '2 days'
FROM public.subdomains s WHERE s.name = 'tech';

-- Food 포스트
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, featured_image_url, status, tags, published_at)
SELECT 
  s.id,
  '집에서 만드는 정통 이탈리안 파스타',
  'authentic-italian-pasta-at-home',
  '<p>이탈리아 현지의 맛을 집에서도 재현할 수 있습니다. 정통 이탈리안 파스타 만드는 비법을 공개합니다.</p>',
  '집에서도 레스토랑 못지않은 정통 이탈리안 파스타를 만들 수 있는 비법을 소개합니다.',
  '/assets/imgs/page/img-33.png',
  'published',
  ARRAY['이탈리안', '파스타', '요리'],
  NOW() - INTERVAL '3 days'
FROM public.subdomains s WHERE s.name = 'food';

-- Travel 포스트
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, featured_image_url, status, tags, published_at)
SELECT 
  s.id,
  '제주도 숨은 명소 완벽 가이드',
  'jeju-hidden-spots-guide',
  '<p>제주도의 유명 관광지 말고, 현지인들만 아는 숨은 명소들을 소개합니다.</p>',
  '제주도 현지인들만 아는 숨은 명소와 꿀팁을 공개합니다.',
  '/assets/imgs/page/img-90.png',
  'published',
  ARRAY['제주도', '여행', '숨은명소'],
  NOW() - INTERVAL '4 days'
FROM public.subdomains s WHERE s.name = 'travel';-- ===================================================================
-- ROW LEVEL SECURITY (RLS) 정책 설정
-- ===================================================================

-- RLS 활성화
ALTER TABLE public.subdomains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===================================================================
-- 1. SUBDOMAINS 정책
-- ===================================================================
-- 누구나 활성화된 서브도메인을 볼 수 있음
CREATE POLICY "Anyone can view active subdomains" ON public.subdomains
    FOR SELECT USING (is_active = true);

-- ===================================================================
-- 2. POSTS 정책
-- ===================================================================
-- 누구나 발행된 포스트를 볼 수 있음
CREATE POLICY "Anyone can view published posts" ON public.posts
    FOR SELECT USING (status = 'published');

-- ===================================================================
-- 3. COMMENTS 정책
-- ===================================================================
-- 누구나 승인된 댓글을 볼 수 있음
CREATE POLICY "Anyone can view approved comments" ON public.comments
    FOR SELECT USING (status = 'approved');

-- 로그인한 사용자는 댓글을 작성할 수 있음
CREATE POLICY "Authenticated users can create comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 댓글을 수정할 수 있음 (생성 후 5분 이내)
CREATE POLICY "Users can update own comments within 5 minutes" ON public.comments
    FOR UPDATE USING (
        auth.uid() = user_id 
        AND created_at > NOW() - INTERVAL '5 minutes'
    );

-- ===================================================================
-- 4. PROFILES 정책
-- ===================================================================
-- 누구나 프로필을 볼 수 있음
CREATE POLICY "Anyone can view profiles" ON public.profiles
    FOR SELECT USING (true);

-- 사용자는 자신의 프로필을 수정할 수 있음
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- 새 사용자가 가입하면 프로필이 자동 생성됨
CREATE POLICY "Users can create own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- ===================================================================
-- 5. ADMIN_USERS 정책
-- ===================================================================
-- 관리자 테이블은 API를 통해 접근 불가 (서버사이드만 접근 가능)
-- RLS가 활성화되어 있고 정책이 없으므로 자동으로 보호됨

-- ===================================================================
-- 6. 프로필 자동 생성 트리거
-- ===================================================================
-- 새 사용자가 가입하면 프로필을 자동으로 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 트리거 생성
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();-- ===================================================================
-- 이미지 경로 수정 마이그레이션
-- /assets/imgs/ → /imgs/ 로 변경
-- ===================================================================

-- posts 테이블의 featured_image_url 경로 수정
UPDATE public.posts 
SET featured_image_url = REPLACE(featured_image_url, '/assets/imgs/', '/imgs/')
WHERE featured_image_url LIKE '/assets/imgs/%';-- Create admin_sessions table for secure session management
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_admin_sessions_token ON admin_sessions(token);
CREATE INDEX idx_admin_sessions_expires_at ON admin_sessions(expires_at);

-- Add password_hash column to admin_users if it doesn't exist
ALTER TABLE admin_users 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Update existing admin user with a hashed password
-- Note: This is a placeholder hash for 'admin123' - CHANGE THIS IN PRODUCTION!
-- To generate a new hash, use: bcrypt.hash('your-secure-password', 10)
UPDATE admin_users 
SET password_hash = '$2b$10$YourHashedPasswordHere' 
WHERE username = 'admin' AND password_hash IS NULL;

-- Remove the old password column if it exists (after verifying password_hash is populated)
-- ALTER TABLE admin_users DROP COLUMN IF EXISTS password;

-- Add RLS policies for admin_sessions
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- Only service role can access admin_sessions
CREATE POLICY "Service role can manage admin sessions" 
ON admin_sessions 
FOR ALL 
TO service_role 
USING (true);-- Create function to increment post view count
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET view_count = view_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Create function for full-text search on posts
CREATE OR REPLACE FUNCTION search_posts(
  search_query TEXT,
  search_limit INTEGER DEFAULT 10,
  search_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  subdomain_id INTEGER,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  tags TEXT[],
  published_at TIMESTAMP WITH TIME ZONE,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.subdomain_id,
    p.title,
    p.slug,
    p.excerpt,
    p.featured_image_url,
    p.tags,
    p.published_at,
    ts_rank(
      to_tsvector('english', p.title || ' ' || COALESCE(p.content, '') || ' ' || COALESCE(array_to_string(p.tags, ' '), '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM posts p
  WHERE 
    p.status = 'published' AND
    to_tsvector('english', p.title || ' ' || COALESCE(p.content, '') || ' ' || COALESCE(array_to_string(p.tags, ' '), ''))
    @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC, p.published_at DESC
  LIMIT search_limit
  OFFSET search_offset;
END;
$$ LANGUAGE plpgsql;

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS idx_posts_fulltext ON posts 
USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '') || ' ' || COALESCE(array_to_string(tags, ' '), '')));

-- Create function to get posts by tag
CREATE OR REPLACE FUNCTION get_posts_by_tag(
  tag_name TEXT,
  tag_limit INTEGER DEFAULT 10,
  tag_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  subdomain_id INTEGER,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  tags TEXT[],
  published_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.subdomain_id,
    p.title,
    p.slug,
    p.excerpt,
    p.featured_image_url,
    p.tags,
    p.published_at
  FROM posts p
  WHERE 
    p.status = 'published' AND
    tag_name = ANY(p.tags)
  ORDER BY p.published_at DESC
  LIMIT tag_limit
  OFFSET tag_offset;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_post_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_posts(TEXT, INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_posts_by_tag(TEXT, INTEGER, INTEGER) TO anon, authenticated;-- Fix admin_users table and add default admin account

-- 1. Ensure admin_users table exists
CREATE TABLE IF NOT EXISTS public.admin_users (
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

-- 2. Create trigger for updated_at if not exists
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Insert default admin user with plain text password for development
-- NOTE: In production, use proper bcrypt hashing
INSERT INTO public.admin_users (username, password_hash, email, full_name, is_active) 
VALUES 
  ('admin', 'admin123!', 'admin@magzin.com', '관리자', true)
ON CONFLICT (username) DO UPDATE
SET password_hash = 'admin123!',
    email = 'admin@magzin.com',
    full_name = '관리자',
    is_active = true;

-- 4. Verify the admin user was created
SELECT id, username, email, is_active, created_at
FROM public.admin_users
WHERE username = 'admin';-- Create function to verify admin password using pgcrypto
CREATE OR REPLACE FUNCTION verify_admin_password(p_username TEXT, p_password TEXT)
RETURNS TABLE(id UUID, username TEXT, email TEXT, full_name TEXT, is_active BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT a.id, a.username, a.email, a.full_name, a.is_active
  FROM admin_users a
  WHERE a.username = p_username
    AND a.is_active = true
    AND a.password_hash = crypt(p_password, a.password_hash);
END;
$$;

-- Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION verify_admin_password TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_password TO authenticated;