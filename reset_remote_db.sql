-- 기존 마이그레이션 기록 삭제
TRUNCATE supabase_migrations.schema_migrations;

-- 모든 테이블 삭제 (CASCADE로 의존성 있는 것들도 함께 삭제)
DROP TABLE IF EXISTS public.admin_sessions CASCADE;
DROP TABLE IF EXISTS public.admin_users CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.posts CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.subdomains CASCADE;

-- 함수들도 삭제
DROP FUNCTION IF EXISTS public.verify_admin_password CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user CASCADE;
DROP FUNCTION IF EXISTS public.increment_post_views CASCADE;
DROP FUNCTION IF EXISTS public.search_posts CASCADE;
DROP FUNCTION IF EXISTS public.get_posts_by_tag CASCADE;

-- 트리거 삭제 (테이블과 함께 삭제되지만 명시적으로)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;