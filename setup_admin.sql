-- pgcrypto extension 활성화 (이미 있으면 무시됨)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 관리자 비밀번호 검증 함수 생성
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

-- 권한 부여
GRANT EXECUTE ON FUNCTION verify_admin_password TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_password TO authenticated;

-- admin 계정이 없는 경우에만 생성
INSERT INTO public.admin_users (username, password_hash, email, full_name, is_active) 
VALUES 
  ('admin', crypt('admin123!', gen_salt('bf')), 'admin@magzin.com', '관리자', true)
ON CONFLICT (username) DO NOTHING;

-- 확인
SELECT id, username, email, is_active FROM admin_users WHERE username = 'admin';

-- 테스트
SELECT * FROM verify_admin_password('admin', 'admin123!');