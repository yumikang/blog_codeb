-- ===================================================================
-- MAGZIN BLOG 데이터베이스 초기화 스크립트
-- ===================================================================
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요
-- 주의: 기존 테이블이 있다면 삭제됩니다!
-- ===================================================================

-- 기존 테이블 삭제 (개발 환경에서만 사용)
-- DROP TABLE IF EXISTS public.comments CASCADE;
-- DROP TABLE IF EXISTS public.posts CASCADE;
-- DROP TABLE IF EXISTS public.profiles CASCADE;
-- DROP TABLE IF EXISTS public.admin_users CASCADE;
-- DROP TABLE IF EXISTS public.subdomains CASCADE;

-- 1. 스키마 생성 (schema.sql 내용)
-- 이미 있는 파일이므로 여기서는 건너뜁니다

-- 2. RLS 정책 생성 (policies.sql 내용)
-- 이미 있는 파일이므로 여기서는 건너뜁니다

-- 3. 초기 데이터 삽입 (seed.sql 내용)
-- 이미 있는 파일이므로 여기서는 건너뜁니다

-- ===================================================================
-- 통합 실행 순서:
-- 1. Supabase SQL Editor에서 이 순서대로 실행하세요:
--    a) schema.sql (테이블 생성)
--    b) policies.sql (보안 정책)
--    c) seed.sql (초기 데이터)
-- ===================================================================

-- 실행 후 확인 쿼리
SELECT 'Database initialization complete!' as message;

-- 서브도메인 확인
SELECT COUNT(*) as subdomain_count FROM public.subdomains WHERE is_active = true;

-- 포스트 확인
SELECT COUNT(*) as post_count FROM public.posts WHERE status = 'published';

-- 관리자 확인
SELECT COUNT(*) as admin_count FROM public.admin_users WHERE is_active = true;