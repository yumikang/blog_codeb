# Magzin 블로그 설정 가이드

## 🚀 빠른 시작

### 1. 필수 준비사항
- Node.js 20.0.0 이상
- Supabase 계정 (https://supabase.com)
- Vercel 계정 (https://vercel.com) - 배포용

### 2. 환경 설정

#### 2.1 프로젝트 클론 및 의존성 설치
```bash
git clone [repository-url]
cd magzin-website
npm install --legacy-peer-deps
```

#### 2.2 환경 변수 설정
```bash
cp .env.example .env
```

`.env` 파일을 열어서 Supabase 정보를 입력하세요:
```env
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SESSION_SECRET="your-session-secret"  # openssl rand -base64 32
```

### 3. Supabase 데이터베이스 설정

#### 3.1 Supabase 프로젝트 생성
1. https://supabase.com/dashboard 에서 새 프로젝트 생성
2. 프로젝트 설정 > API에서 URL과 키 복사

#### 3.2 데이터베이스 초기화
Supabase 대시보드의 SQL Editor에서 다음 순서로 실행:

1. **스키마 생성** (`supabase/schema.sql` 내용 복사하여 실행)
2. **보안 정책 설정** (`supabase/policies.sql` 내용 복사하여 실행)
3. **초기 데이터 삽입** (`supabase/seed.sql` 내용 복사하여 실행)

또는 한 번에 실행:
```sql
-- supabase/schema.sql 전체 내용 붙여넣기
-- supabase/policies.sql 전체 내용 붙여넣기
-- supabase/seed.sql 전체 내용 붙여넣기
```

#### 3.3 추가 서브도메인 설정 (선택사항)
10개 서브도메인이 모두 필요한 경우:
```sql
-- supabase/add-subdomains.sql 내용 실행
```

### 4. Google OAuth 설정

#### 4.1 Supabase에서 Google OAuth 활성화
1. Supabase 대시보드 > Authentication > Providers
2. Google 활성화
3. Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
4. 승인된 리디렉션 URI: `https://your-project-ref.supabase.co/auth/v1/callback`

### 5. 로컬 개발 서버 실행
```bash
npm run dev
```

http://localhost:3000 에서 확인

### 6. 관리자 로그인
- URL: http://localhost:3000/admin/login
- 기본 계정: `admin` / `admin123!`
- ⚠️ **운영 환경에서는 반드시 비밀번호를 변경하세요!**

## 📦 Vercel 배포

### 1. Vercel CLI 설치 (선택사항)
```bash
npm i -g vercel
```

### 2. 배포
```bash
vercel --prod
```

또는 GitHub 연동 후 자동 배포 설정

### 3. 환경 변수 설정
Vercel 대시보드 > Settings > Environment Variables에서 모든 환경 변수 추가

### 4. 서브도메인 설정
Vercel 대시보드 > Settings > Domains에서:
- `tech.yourdomain.com`
- `food.yourdomain.com`
- `travel.yourdomain.com`
- 등등...

## 🏗️ 프로젝트 구조

```
magzin-website/
├── app/
│   ├── components/      # React 컴포넌트
│   ├── routes/         # Remix 라우트
│   ├── lib/           # 유틸리티 함수
│   └── types/         # TypeScript 타입
├── public/
│   ├── assets/        # 정적 자산
│   └── css/          # 글로벌 CSS
├── supabase/         # 데이터베이스 스크립트
└── build/           # 빌드 결과물
```

## 🔧 주요 기능

- **10개 서브도메인**: tech, food, travel, lifestyle, business, health, sports, entertainment, science, education
- **Google OAuth 로그인**: 댓글 작성시 필요
- **관리자 시스템**: 포스트 관리, 통계 확인
- **반응형 디자인**: 모바일 최적화
- **테마 시스템**: 서브도메인별 색상 테마
- **캐싱 전략**: 성능 최적화
- **SEO 최적화**: 메타 태그, 구조화된 데이터

## 🐛 문제 해결

### 데이터베이스 연결 오류
```bash
# 연결 테스트
node test-db-connection.js
```

### 빌드 오류
```bash
# 클린 빌드
rm -rf build node_modules
npm install --legacy-peer-deps
npm run build
```

### 환경 변수 문제
- `.env` 파일이 프로젝트 루트에 있는지 확인
- 모든 필수 환경 변수가 설정되었는지 확인

## 📝 추가 정보

- [Remix 문서](https://remix.run/docs)
- [Supabase 문서](https://supabase.com/docs)
- [Vercel 문서](https://vercel.com/docs)

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request