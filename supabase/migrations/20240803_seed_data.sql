-- ===================================================================
-- 초기 데이터 삽입
-- ===================================================================

-- 1. 10개 서브도메인 삽입
INSERT INTO public.subdomains (name, display_name, theme_color, description, icon_emoji, is_active) 
VALUES 
  ('tech', '테크놀로지', 'primary', '최신 기술 트렌드와 혁신적인 IT 소식', '💻', true),
  ('food', '푸드 & 쿠킹', 'danger', '맛있는 레시피와 맛집 탐방기', '🍳', true),
  ('travel', '여행', 'success', '세계 각지의 여행 가이드와 팁', '✈️', true),
  ('lifestyle', '라이프스타일', 'warning', '패션, 웰빙, 그리고 현대적인 삶', '🌟', true),
  ('business', '비즈니스', 'dark', '창업, 금융, 커리어 조언', '💼', true),
  ('health', '건강 & 웰빙', 'info', '피트니스, 영양, 정신 건강', '🏃', true),
  ('sports', '스포츠', 'warning', '스포츠 뉴스와 분석, 피트니스 팁', '⚽', true),
  ('entertainment', '엔터테인먼트', 'secondary', '영화, 드라마, 음악, 대중문화', '🎬', true),
  ('science', '과학', 'primary', '과학적 발견과 기술 혁신', '🔬', true),
  ('education', '교육', 'warning', '학습 자료와 교육 콘텐츠', '📚', true)
ON CONFLICT (name) DO NOTHING;

-- 2. 관리자 계정 생성 (pgcrypto extension 필요)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO public.admin_users (username, password_hash, email, full_name, is_active) 
VALUES 
  ('admin', crypt('admin123!', gen_salt('bf')), 'admin@magzin.com', '관리자', true)
ON CONFLICT (username) DO NOTHING;

-- 3. 각 서브도메인에 샘플 포스트 추가
-- Tech 포스트
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, featured_image_url, status, tags, published_at)
SELECT 
  s.id,
  '2024년 주목해야 할 AI 기술 트렌드',
  '2024-ai-technology-trends',
  '<p>인공지능 기술이 빠르게 발전하면서 우리의 일상생활과 비즈니스 환경을 크게 변화시키고 있습니다.</p>',
  '2024년 AI 기술은 생성형 AI의 진화, AI 에이전트의 등장, 엣지 AI의 확산 등 혁신적인 변화를 맞이하고 있습니다.',
  '/assets/imgs/page/img-112.png',
  'published',
  ARRAY['AI', '인공지능', '기술트렌드'],
  NOW() - INTERVAL '2 days'
FROM public.subdomains s WHERE s.name = 'tech';

-- Food 포스트
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, featured_image_url, status, tags, published_at)
SELECT 
  s.id,
  '집에서 만드는 정통 이탈리안 파스타',
  'authentic-italian-pasta-at-home',
  '<p>이탈리아 현지의 맛을 집에서도 재현할 수 있습니다. 정통 이탈리안 파스타 만드는 비법을 공개합니다.</p>',
  '집에서도 레스토랑 못지않은 정통 이탈리안 파스타를 만들 수 있는 비법을 소개합니다.',
  '/assets/imgs/page/img-33.png',
  'published',
  ARRAY['이탈리안', '파스타', '요리'],
  NOW() - INTERVAL '3 days'
FROM public.subdomains s WHERE s.name = 'food';

-- Travel 포스트
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, featured_image_url, status, tags, published_at)
SELECT 
  s.id,
  '제주도 숨은 명소 완벽 가이드',
  'jeju-hidden-spots-guide',
  '<p>제주도의 유명 관광지 말고, 현지인들만 아는 숨은 명소들을 소개합니다.</p>',
  '제주도 현지인들만 아는 숨은 명소와 꿀팁을 공개합니다.',
  '/assets/imgs/page/img-90.png',
  'published',
  ARRAY['제주도', '여행', '숨은명소'],
  NOW() - INTERVAL '4 days'
FROM public.subdomains s WHERE s.name = 'travel';