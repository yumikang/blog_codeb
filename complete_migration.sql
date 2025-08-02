-- ===================================
-- Complete Migration for Magzin Blog
-- ===================================

-- 1. Enable Extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create Schema (if not exists)
CREATE SCHEMA IF NOT EXISTS "public";

-- 3. Create Tables
-- Subdomains table
CREATE TABLE "public"."subdomains" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "theme_color" TEXT NOT NULL DEFAULT 'primary',
    "description" TEXT,
    "icon_emoji" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subdomains_pkey" PRIMARY KEY ("id")
);

-- Profiles table
CREATE TABLE "public"."profiles" (
    "id" UUID NOT NULL,
    "email" TEXT,
    "full_name" TEXT,
    "avatar_url" TEXT,
    "website" TEXT,
    "bio" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- Posts table
CREATE TABLE "public"."posts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "subdomain_id" BIGINT NOT NULL,
    "author_id" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "content" TEXT,
    "excerpt" TEXT,
    "featured_image_url" TEXT,
    "featured_image_alt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "meta_title" TEXT,
    "meta_description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- Comments table
CREATE TABLE "public"."comments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "post_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "parent_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- Admin users table
CREATE TABLE "public"."admin_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "email" TEXT,
    "full_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- Admin sessions table
CREATE TABLE "public"."admin_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "admin_user_id" UUID NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id")
);

-- 4. Create Indexes
CREATE UNIQUE INDEX "subdomains_name_key" ON "public"."subdomains"("name");
CREATE INDEX "posts_subdomain_id_idx" ON "public"."posts"("subdomain_id");
CREATE INDEX "posts_status_idx" ON "public"."posts"("status");
CREATE INDEX "posts_published_at_idx" ON "public"."posts"("published_at" DESC);
CREATE INDEX "posts_slug_idx" ON "public"."posts"("slug");
CREATE UNIQUE INDEX "posts_subdomain_id_slug_key" ON "public"."posts"("subdomain_id", "slug");
CREATE INDEX "comments_post_id_idx" ON "public"."comments"("post_id");
CREATE INDEX "comments_user_id_idx" ON "public"."comments"("user_id");
CREATE INDEX "comments_status_idx" ON "public"."comments"("status");
CREATE UNIQUE INDEX "admin_users_username_key" ON "public"."admin_users"("username");
CREATE UNIQUE INDEX "admin_users_email_key" ON "public"."admin_users"("email");
CREATE UNIQUE INDEX "admin_sessions_token_key" ON "public"."admin_sessions"("token");
CREATE INDEX "admin_sessions_token_idx" ON "public"."admin_sessions"("token");
CREATE INDEX "admin_sessions_expires_at_idx" ON "public"."admin_sessions"("expires_at");

-- 5. Add Foreign Keys
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_subdomain_id_fkey" FOREIGN KEY ("subdomain_id") REFERENCES "public"."subdomains"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."posts" ADD CONSTRAINT "posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "public"."comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "public"."admin_sessions" ADD CONSTRAINT "admin_sessions_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "public"."admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 6. Create Functions
-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Admin password verification function
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION verify_admin_password TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_password TO authenticated;

-- 7. Create Triggers
CREATE TRIGGER update_subdomains_updated_at BEFORE UPDATE ON public.subdomains
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. Enable Row Level Security
ALTER TABLE public.subdomains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 9. Create RLS Policies
-- Subdomains: Anyone can view active subdomains
CREATE POLICY "Anyone can view active subdomains" ON public.subdomains
    FOR SELECT USING (is_active = true);

-- Posts: Anyone can view published posts
CREATE POLICY "Anyone can view published posts" ON public.posts
    FOR SELECT USING (status = 'published');

-- Comments: Anyone can view approved comments
CREATE POLICY "Anyone can view approved comments" ON public.comments
    FOR SELECT USING (status = 'approved');

-- 10. Insert Initial Data
-- Insert subdomains
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

-- Insert admin user
INSERT INTO public.admin_users (username, password_hash, email, full_name, is_active) 
VALUES 
  ('admin', crypt('admin123!', gen_salt('bf')), 'admin@magzin.com', '관리자', true)
ON CONFLICT (username) DO NOTHING;

-- Insert sample posts for each subdomain
-- Tech post
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, featured_image_url, status, tags, published_at)
SELECT 
  s.id,
  '2024년 주목해야 할 AI 기술 트렌드',
  '2024-ai-technology-trends',
  '<p>인공지능 기술이 빠르게 발전하면서 우리의 일상생활과 비즈니스 환경을 크게 변화시키고 있습니다.</p>',
  '2024년 AI 기술은 생성형 AI의 진화, AI 에이전트의 등장, 엣지 AI의 확산 등 혁신적인 변화를 맞이하고 있습니다.',
  '/imgs/page/img-112.png',
  'published',
  ARRAY['AI', '인공지능', '기술트렌드'],
  NOW() - INTERVAL '2 days'
FROM public.subdomains s WHERE s.name = 'tech';

-- Food post
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, featured_image_url, status, tags, published_at)
SELECT 
  s.id,
  '집에서 만드는 정통 이탈리안 파스타',
  'authentic-italian-pasta-at-home',
  '<p>이탈리아 현지의 맛을 집에서도 재현할 수 있습니다. 정통 이탈리안 파스타 만드는 비법을 공개합니다.</p>',
  '집에서도 레스토랑 못지않은 정통 이탈리안 파스타를 만들 수 있는 비법을 소개합니다.',
  '/imgs/page/img-33.png',
  'published',
  ARRAY['이탈리안', '파스타', '요리'],
  NOW() - INTERVAL '3 days'
FROM public.subdomains s WHERE s.name = 'food';

-- Travel post
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, featured_image_url, status, tags, published_at)
SELECT 
  s.id,
  '제주도 숨은 명소 완벽 가이드',
  'jeju-hidden-spots-guide',
  '<p>제주도의 유명 관광지 말고, 현지인들만 아는 숨은 명소들을 소개합니다.</p>',
  '제주도 현지인들만 아는 숨은 명소와 꿀팁을 공개합니다.',
  '/imgs/page/img-90.png',
  'published',
  ARRAY['제주도', '여행', '숨은명소'],
  NOW() - INTERVAL '4 days'
FROM public.subdomains s WHERE s.name = 'travel';