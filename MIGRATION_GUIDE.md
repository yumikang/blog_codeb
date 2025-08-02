# Supabase 마이그레이션 가이드

## 간단한 방법 (권장)

### 1단계: 기존 테이블 모두 삭제

1. Supabase 대시보드로 이동: https://supabase.com/dashboard/project/taxztmphioixwsxsveko
2. SQL Editor 탭 클릭
3. `drop_all_tables.sql` 파일의 내용을 실행

### 2단계: 전체 마이그레이션 실행

`complete_migration.sql` 파일의 전체 내용을 Supabase SQL Editor에서 실행

이 파일은 다음을 포함합니다:
- 모든 테이블 생성
- 인덱스 및 관계 설정
- 필요한 함수들 생성
- RLS 정책 설정
- 초기 데이터 삽입 (서브도메인, 관리자 계정, 샘플 포스트)

### 3단계: 테스트

1. 관리자 로그인 테스트:
   - URL: https://blog-codeb.vercel.app/admin/login
   - Username: admin
   - Password: admin123!

2. SQL 테스트:
```sql
SELECT * FROM verify_admin_password('admin', 'admin123!');
```

---

## 상세한 방법 (단계별 실행)

### 1단계: 기존 테이블 모두 삭제

`drop_all_tables.sql` 실행

### 2단계: Prisma 스키마 기반 테이블 생성

`prisma_migration.sql` 실행

### 3단계: 추가 설정

```sql
-- pgcrypto extension 활성화
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
-- (다른 테이블들도 동일하게...)
```

### 4단계: 관리자 인증 함수 생성

```sql
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

GRANT EXECUTE ON FUNCTION verify_admin_password TO anon;
GRANT EXECUTE ON FUNCTION verify_admin_password TO authenticated;
```

### 5단계: RLS 정책 설정

```sql
ALTER TABLE public.subdomains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
-- (다른 테이블들도...)

CREATE POLICY "Anyone can view active subdomains" ON public.subdomains
    FOR SELECT USING (is_active = true);
-- (다른 정책들도...)
```

### 6단계: 초기 데이터 삽입

서브도메인, 관리자 계정, 샘플 포스트 데이터 삽입