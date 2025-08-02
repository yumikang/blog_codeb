# Admin 설정 가이드

## 문제
admin_users 테이블에 pgcrypto로 해싱된 비밀번호가 저장되어 있지만, 인증 함수가 없어서 로그인이 안 되는 문제

## 해결 방법

1. Supabase 대시보드로 이동: https://supabase.com/dashboard/project/taxztmphioixwsxsveko

2. SQL Editor 탭 클릭

3. 다음 SQL을 순서대로 실행:

### Step 1: pgcrypto extension 활성화 및 인증 함수 생성
```sql
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
```

### Step 2: admin 계정 확인 (이미 존재하는지 확인)
```sql
-- 현재 admin 계정 확인
SELECT id, username, email, is_active FROM admin_users WHERE username = 'admin';
```

### Step 3: admin 계정이 없다면 생성
```sql
-- admin 계정이 없는 경우에만 실행
INSERT INTO public.admin_users (username, password_hash, email, full_name, is_active) 
VALUES 
  ('admin', crypt('admin123!', gen_salt('bf')), 'admin@magzin.com', '관리자', true)
ON CONFLICT (username) DO NOTHING;
```

### Step 4: 테스트 (선택사항)
```sql
-- 비밀번호 검증 테스트
SELECT * FROM verify_admin_password('admin', 'admin123!');
```

4. 로그인 테스트:
   - URL: https://blog-codeb.vercel.app/admin/login
   - Username: admin
   - Password: admin123!

## 참고사항
- 초기 마이그레이션 파일에서 이미 admin 계정이 생성되었을 수 있습니다
- pgcrypto의 crypt() 함수를 사용하여 비밀번호를 안전하게 해싱합니다
- verify_admin_password 함수가 비밀번호 검증을 담당합니다