# Supabase 원격 배포 가이드

## 방법 1: Supabase 대시보드 사용 (권장)

1. **Supabase SQL Editor 접속**
   - URL: https://supabase.com/dashboard/project/taxztmphioixwsxsveko/sql/new

2. **기존 데이터 리셋**
   - `reset_remote_db.sql` 파일 내용 실행

3. **전체 마이그레이션 실행**
   - `complete_migration.sql` 파일 내용 실행

4. **테스트**
   ```sql
   -- Admin 인증 테스트
   SELECT * FROM verify_admin_password('admin', 'admin123!');
   
   -- 데이터 확인
   SELECT COUNT(*) FROM subdomains;
   SELECT COUNT(*) FROM posts;
   ```

## 방법 2: Supabase CLI 사용

현재 비밀번호 인증 문제로 CLI 사용이 어려운 상황입니다.

### 해결 방법:
1. Supabase 대시보드에서 Database Password 재설정
   - https://supabase.com/dashboard/project/taxztmphioixwsxsveko/settings/database
   
2. 새 비밀번호로 다시 시도:
   ```bash
   supabase link --project-ref taxztmphioixwsxsveko
   supabase db push --password [새비밀번호] --include-all
   ```

## 로컬 개발 환경

로컬에서는 이미 설정이 완료되었습니다:

```bash
# 로컬 Supabase 시작
supabase start

# 로컬 Supabase 중지
supabase stop

# 로컬 DB 리셋
supabase db reset
```

로컬 접속 정보:
- DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- Studio URL: http://localhost:54323