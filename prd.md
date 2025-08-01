# 멀티 블로그 자동 포스팅 시스템 PD 문서 (보완판)

## 1. 프로젝트 개요

### 1.1 프로젝트 목표
- 하나의 마스터 포스팅 프로젝트를 생성하여 10개의 개별 블로그 도메인에 자동으로 콘텐츠를 배포하는 시스템 구축
- 순수 자동화에 집중 (AdSense 등 수익화 미고려)
- Magzin HTML 템플릿 구조 최대한 유지하며 Remix로 구현

### 1.2 핵심 원칙
- **코드 간결성**: 모든 컴포넌트 500줄 이하
- **HTML 구조 유지**: 기존 템플릿 HTML/CSS 최대한 보존
- **라이트 모드 전용**: 다크모드 관련 코드 제거
- **심플한 메뉴 구조**: Home, Latest, Categories 3개만

### 1.3 기술 스택
- **Backend**: Node.js with Remix Framework
- **Database**: Supabase (PostgreSQL + Real-time + Auth)
- **Frontend**: 
  - React with Remix (HTML 구조 유지)
  - Magzin 템플릿 기반 (라이트 모드 전용)
  - 기존 CSS/JS 최대한 활용
- **Authentication**: 
  - 관리자: 간단한 ID/PW 인증
  - 댓글: Google OAuth (Supabase Auth)
- **Deployment**: Vercel + 서브도메인 자동화

## 2. 시스템 아키텍처

### 2.1 전체 구조
```
[마스터 어드민 패널 - 별도 구축 예정]
    ↓
[10개 서브도메인 블로그]
├── tech.yourdomain.com
├── food.yourdomain.com  
├── travel.yourdomain.com
├── fashion.yourdomain.com
├── health.yourdomain.com
├── finance.yourdomain.com
├── sports.yourdomain.com
├── culture.yourdomain.com
├── business.yourdomain.com
└── lifestyle.yourdomain.com
```

### 2.2 블로그 메뉴 구조 (각 서브도메인)
- **Home** → index.html 템플릿 기반
- **Latest** → single-2.html 템플릿 기반  
- **Categories** → archive-2.html 템플릿 기반

## 3. 템플릿 적용 전략

### 3.1 파일 구조
```
app/
├── routes/
│   ├── _index.tsx          # Home (index.html 기반)
│   ├── latest.tsx          # Latest (single-2.html 기반)
│   └── categories.tsx      # Categories (archive-2.html 기반)
├── components/
│   ├── layout/
│   │   ├── Header.tsx      # 네비게이션 (500줄 이하)
│   │   ├── Footer.tsx      # 푸터 (200줄 이하)
│   │   └── Layout.tsx      # 전체 레이아웃 (300줄 이하)
│   └── cards/              # 카드 컴포넌트들
│       ├── Card1.tsx       # 각 카드 타입별 (200줄 이하)
│       ├── Card2.tsx
│       └── ...
├── styles/                 # 기존 CSS 그대로
└── public/
    └── assets/            # 기존 assets 그대로
```

### 3.2 HTML 구조 유지 방법

#### Header 컴포넌트 예시 (HTML 구조 유지)
```tsx
export function Header({ category }: { category: string }) {
  return (
    <>
      {/* 기존 HTML 구조 그대로 유지 */}
      <header>
        <nav className="navbar navbar-expand-lg style-1">
          <div className="d-flex align-items-center">
            <Link className="navbar-brand fw-bold fs-3" to="/">
              <img src="/assets/imgs/template/logo/logo-dark.svg" alt="Logo" />
            </Link>
          </div>
          
          <div className="navbar-collapse d-none d-lg-block">
            <ul className="navbar-nav">
              <li className="nav-item">
                <Link className="nav-link link-effect-1" to="/">
                  <span>Home</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link link-effect-1" to="/latest">
                  <span>Latest</span>
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link link-effect-1" to="/categories">
                  <span>Categories</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>
    </>
  );
}
```

### 3.3 라이트 모드 전용 처리
- 모든 `.dark-mode-invert` 클래스 제거
- 다크모드 토글 버튼 제거
- `color-modes.js` 스크립트 제거
- CSS에서 다크모드 관련 변수 제거

## 4. 데이터베이스 스키마 (간소화)

### 4.1 핵심 테이블만

#### subdomains (서브도메인)
```sql
- id: uuid Primary Key
- slug: 서브도메인명 (tech, food 등)
- name: 카테고리명
- theme_color: 테마 색상
- created_at: timestamptz
```

#### posts (포스트)
```sql
- id: uuid Primary Key
- subdomain_id: uuid Foreign Key
- title: 제목
- slug: URL 슬러그
- content: 내용 (HTML)
- excerpt: 요약
- featured_image: 대표 이미지
- status: 상태
- published_at: timestamptz
- created_at: timestamptz
```

#### comments (댓글)
```sql
- id: uuid Primary Key
- post_id: uuid Foreign Key
- user_id: uuid Foreign Key
- content: 댓글 내용
- created_at: timestamptz
```

## 5. 개발 구현 가이드

### 5.1 Home 페이지 (index.html 기반)
```tsx
// app/routes/_index.tsx (500줄 이하)
export default function Home() {
  const posts = useLoaderData();
  
  return (
    <>
      {/* Hero Section - 기존 HTML 구조 유지 */}
      <section className="sec-1-home-1">
        <div className="container">
          {/* index.html의 구조 그대로 */}
        </div>
      </section>
      
      {/* Latest News Section */}
      <section className="sec-3-home-1">
        {posts.map(post => (
          <Card1 key={post.id} post={post} />
        ))}
      </section>
    </>
  );
}
```

### 5.2 Latest 페이지 (single-2.html 기반)
```tsx
// app/routes/latest.tsx (500줄 이하)
export default function Latest() {
  const posts = useLoaderData();
  
  return (
    <div className="container">
      <div className="row">
        {/* single-2.html의 리스트 구조 활용 */}
        {posts.map(post => (
          <article key={post.id} className="article">
            {/* 기존 HTML 구조 유지 */}
          </article>
        ))}
      </div>
    </div>
  );
}
```

### 5.3 Categories 페이지 (archive-2.html 기반)
```tsx
// app/routes/categories.tsx (500줄 이하)
export default function Categories() {
  const categories = useLoaderData();
  
  return (
    <div className="container">
      {/* archive-2.html의 그리드 구조 활용 */}
      <div className="row g-4">
        {categories.map(category => (
          <div key={category.id} className="col-lg-3">
            {/* 카테고리 카드 */}
          </div>
        ))}
      </div>
    </div>
  );
}
```

## 6. CSS/JS 처리 방법

### 6.1 CSS 파일 (그대로 사용)
```tsx
// app/root.tsx
export const links = () => [
  { rel: "stylesheet", href: "/assets/css/vendors/bootstrap-grid.min.css" },
  { rel: "stylesheet", href: "/assets/css/main.css" },
  // 다크모드 관련 CSS 제외
];
```

### 6.2 JS 파일 (필요한 것만)
```tsx
// app/root.tsx
<script src="/assets/js/vendors/jquery-3.7.1.min.js" />
<script src="/assets/js/vendors/swiper-bundle.min.js" />
// color-modes.js 제외
```

## 7. 카테고리별 커스터마이징

### 7.1 색상 테마 (CSS 변수로 관리)
```css
/* 각 서브도메인별 테마 색상 */
.tech { --primary-color: #3B82F6; }
.food { --primary-color: #F59E0B; }
.travel { --primary-color: #10B981; }
/* ... */
```

### 7.2 동적 적용
```tsx
// 서브도메인에 따라 body 클래스 추가
<body className={subdomain}>
```

## 8. 개발 단계

### Phase 1: 기본 구조 (1주)
- Remix 프로젝트 셋업
- Supabase 연동
- 기본 라우팅 구현

### Phase 2: 템플릿 적용 (2주)
- HTML 템플릿을 React 컴포넌트로 변환
- CSS/JS 통합
- 라이트 모드만 적용

### Phase 3: 데이터 연동 (1주)
- Supabase 데이터 로딩
- 동적 콘텐츠 렌더링
- 댓글 시스템

### Phase 4: 서브도메인 설정 (1주)
- Vercel 멀티 도메인 설정
- 카테고리별 테마 적용
- 배포 및 테스트

### Phase 5: 어드민 연동 (별도)
- 어드민 패널은 나중에 별도 구축
- API 통신으로 연결

## 9. 주의사항

### 9.1 코드 관리
- 모든 컴포넌트 500줄 이하 유지
- 복잡한 로직은 여러 파일로 분리
- 기존 HTML 구조 최대한 보존

### 9.2 성능 최적화
- 이미지 lazy loading
- 페이지네이션 구현
- 캐싱 전략

### 9.3 유지보수
- 템플릿 업데이트 시 HTML 구조만 변경
- CSS는 기존 파일 그대로 사용
- JS는 최소한만 React로 대체

---

이 PRD는 **순수 자동화**와 **구현 단순성**에 초점을 맞춰 보완했습니다. 어드민 패널은 별도로 구축하고, 블로그는 심플하게 3개 메뉴만으로 운영하는 구조입니다.