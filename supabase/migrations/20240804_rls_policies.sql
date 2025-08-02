-- ===================================================================
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
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();