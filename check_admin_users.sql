-- admin_users 테이블 확인 및 데이터 생성

-- 1. 테이블 존재 확인
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'admin_users'
) as table_exists;

-- 2. admin_users 테이블 구조 확인
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'admin_users'
ORDER BY ordinal_position;

-- 3. 현재 admin_users 데이터 확인
SELECT id, username, email, is_active, created_at
FROM public.admin_users;

-- 4. pgcrypto extension 확인
SELECT EXISTS(
    SELECT 1 FROM pg_extension WHERE extname = 'pgcrypto'
) as pgcrypto_exists;

-- 5. 테스트를 위한 간단한 admin 계정 생성 (평문 비밀번호 저장 - 개발용)
-- 실제 운영에서는 반드시 bcrypt 사용
INSERT INTO public.admin_users (username, password_hash, email, full_name, is_active) 
VALUES 
  ('admin', 'admin123!', 'admin@magzin.com', '관리자', true)
ON CONFLICT (username) DO UPDATE
SET password_hash = 'admin123!',
    is_active = true;

-- 6. 생성된 데이터 확인
SELECT id, username, email, is_active
FROM public.admin_users
WHERE username = 'admin';