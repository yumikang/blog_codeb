-- ===================================================================
-- INITIAL SEED DATA FOR MAGZIN BLOG
-- ===================================================================
-- 10개 서브도메인과 샘플 포스트 데이터
-- ===================================================================

-- ===================================================================
-- 1. 서브도메인 데이터 삽입
-- ===================================================================
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
ON CONFLICT (name) 
DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  theme_color = EXCLUDED.theme_color,
  description = EXCLUDED.description,
  icon_emoji = EXCLUDED.icon_emoji,
  is_active = EXCLUDED.is_active;

-- ===================================================================
-- 2. 관리자 계정 생성 (비밀번호: admin123!)
-- ===================================================================
-- 실제 운영 환경에서는 반드시 비밀번호를 변경하세요!
INSERT INTO public.admin_users (username, password_hash, email, full_name, is_active) 
VALUES 
  ('admin', crypt('admin123!', gen_salt('bf')), 'admin@magzin.com', '관리자', true)
ON CONFLICT (username) DO NOTHING;

-- ===================================================================
-- 3. 샘플 포스트 데이터
-- ===================================================================
-- 각 서브도메인별로 3개씩 샘플 포스트 생성

-- Tech 서브도메인 포스트
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, featured_image_url, status, meta_title, meta_description, tags, published_at)
SELECT 
  s.id,
  '2024년 주목해야 할 AI 기술 트렌드',
  '2024-ai-technology-trends',
  '<p>인공지능 기술이 빠르게 발전하면서 우리의 일상생활과 비즈니스 환경을 크게 변화시키고 있습니다. 2024년에는 어떤 AI 기술들이 주목받을까요?</p>
  <h3>1. 생성형 AI의 진화</h3>
  <p>ChatGPT와 같은 대규모 언어 모델(LLM)이 더욱 정교해지고 있습니다. 텍스트뿐만 아니라 이미지, 비디오, 음악 생성까지 가능해지면서 창작 분야에 혁명을 일으키고 있습니다.</p>
  <h3>2. AI 에이전트의 등장</h3>
  <p>단순한 대화형 AI를 넘어, 실제로 작업을 수행할 수 있는 AI 에이전트가 등장하고 있습니다. 이들은 복잡한 업무를 자동화하고 인간과 협업할 수 있습니다.</p>
  <h3>3. 엣지 AI의 확산</h3>
  <p>클라우드가 아닌 기기 자체에서 AI 처리가 가능한 엣지 AI가 확산되고 있습니다. 이는 프라이버시 보호와 실시간 처리에 큰 장점을 제공합니다.</p>',
  '2024년 AI 기술은 생성형 AI의 진화, AI 에이전트의 등장, 엣지 AI의 확산 등 혁신적인 변화를 맞이하고 있습니다.',
  '/assets/imgs/page/img-112.png',
  'published',
  '2024년 주목해야 할 AI 기술 트렌드 - 테크놀로지',
  'ChatGPT를 넘어선 생성형 AI, AI 에이전트, 엣지 AI 등 2024년 주목받는 인공지능 기술 트렌드를 알아봅니다.',
  ARRAY['AI', '인공지능', '기술트렌드', 'ChatGPT', '머신러닝'],
  NOW() - INTERVAL '2 days'
FROM public.subdomains s WHERE s.name = 'tech';

INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, featured_image_url, status, meta_title, meta_description, tags, published_at)
SELECT 
  s.id,
  '퀀텀 컴퓨팅이 바꿀 미래',
  'quantum-computing-future',
  '<p>퀀텀 컴퓨팅은 더 이상 이론적인 개념이 아닙니다. 실제 상용화를 앞두고 있는 이 기술이 우리의 미래를 어떻게 바꿀까요?</p>
  <h3>퀀텀 컴퓨팅이란?</h3>
  <p>양자역학의 원리를 이용한 새로운 컴퓨팅 패러다임입니다. 기존 컴퓨터와는 완전히 다른 방식으로 정보를 처리합니다.</p>
  <h3>응용 분야</h3>
  <ul>
    <li>신약 개발: 분자 시뮬레이션을 통한 혁신적인 신약 발견</li>
    <li>암호학: 현재의 암호 체계를 무력화시킬 수 있는 능력</li>
    <li>금융: 복잡한 포트폴리오 최적화와 리스크 분석</li>
    <li>날씨 예측: 더욱 정확한 기상 예측 모델 구현</li>
  </ul>',
  '퀀텀 컴퓨팅이 신약 개발, 암호학, 금융, 날씨 예측 등 다양한 분야에서 혁명적인 변화를 가져올 전망입니다.',
  '/assets/imgs/page/img-42.png',
  'published',
  '퀀텀 컴퓨팅이 바꿀 미래 - 테크놀로지',
  '양자 컴퓨터의 원리와 응용 분야, 그리고 우리의 미래에 미칠 영향에 대해 알아봅니다.',
  ARRAY['퀀텀컴퓨팅', '양자컴퓨터', '미래기술', '혁신'],
  NOW() - INTERVAL '5 days'
FROM public.subdomains s WHERE s.name = 'tech';

INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, featured_image_url, status, meta_title, meta_description, tags, published_at)
SELECT 
  s.id,
  '메타버스 플랫폼 비교 분석',
  'metaverse-platform-comparison',
  '<p>메타버스가 차세대 인터넷으로 주목받으면서 다양한 플랫폼들이 경쟁하고 있습니다. 주요 메타버스 플랫폼들을 비교 분석해보겠습니다.</p>
  <h3>1. 메타 호라이즌 월드</h3>
  <p>페이스북(현 메타)이 야심차게 준비한 VR 기반 메타버스 플랫폼입니다. 오큘러스 헤드셋과의 연동이 강점입니다.</p>
  <h3>2. 로블록스</h3>
  <p>게임 중심의 메타버스로, 특히 젊은 세대에게 인기가 높습니다. 사용자가 직접 게임을 만들고 공유할 수 있습니다.</p>
  <h3>3. 더 샌드박스</h3>
  <p>블록체인 기반의 메타버스로, NFT와 가상 부동산 거래가 활발합니다. 크리에이터 경제를 중심으로 성장하고 있습니다.</p>',
  '메타 호라이즌, 로블록스, 더 샌드박스 등 주요 메타버스 플랫폼들의 특징과 장단점을 비교 분석합니다.',
  '/assets/imgs/page/img-88.png',
  'published',
  '메타버스 플랫폼 비교 분석 - 테크놀로지',
  '주요 메타버스 플랫폼들의 특징과 장단점을 비교하고, 미래 전망을 분석합니다.',
  ARRAY['메타버스', 'VR', 'AR', '가상현실', 'NFT'],
  NOW() - INTERVAL '8 days'
FROM public.subdomains s WHERE s.name = 'tech';

-- Food 서브도메인 포스트
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, featured_image_url, status, meta_title, meta_description, tags, published_at)
SELECT 
  s.id,
  '집에서 만드는 정통 이탈리안 파스타',
  'authentic-italian-pasta-at-home',
  '<p>이탈리아 현지의 맛을 집에서도 재현할 수 있습니다. 정통 이탈리안 파스타 만드는 비법을 공개합니다.</p>
  <h3>재료 선택이 중요합니다</h3>
  <p>좋은 파스타는 좋은 재료에서 시작됩니다. 듀럼밀로 만든 파스타와 신선한 토마토, 질 좋은 올리브오일을 준비하세요.</p>
  <h3>알덴테의 비밀</h3>
  <p>파스타를 삶을 때는 끓는 물에 충분한 소금을 넣고, 포장지에 적힌 시간보다 1-2분 덜 삶는 것이 포인트입니다.</p>
  <h3>소스와의 조화</h3>
  <p>파스타를 건져낸 후 바로 소스 팬에 넣어 1-2분간 더 조리하면 소스가 파스타에 잘 배어듭니다.</p>',
  '집에서도 레스토랑 못지않은 정통 이탈리안 파스타를 만들 수 있는 비법을 소개합니다.',
  '/assets/imgs/page/img-33.png',
  'published',
  '집에서 만드는 정통 이탈리안 파스타 - 푸드 & 쿠킹',
  '이탈리아 현지의 맛을 집에서 재현하는 정통 파스타 조리법과 팁을 공개합니다.',
  ARRAY['이탈리안', '파스타', '요리', '레시피', '홈쿠킹'],
  NOW() - INTERVAL '3 days'
FROM public.subdomains s WHERE s.name = 'food';

INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, featured_image_url, status, meta_title, meta_description, tags, published_at)
SELECT 
  s.id,
  '서울 숨은 맛집 베스트 10',
  'seoul-hidden-restaurants-best-10',
  '<p>관광객들은 모르는, 현지인들만 아는 서울의 숨은 맛집들을 소개합니다.</p>
  <h3>1. 종로 뒷골목 해장국집</h3>
  <p>40년 전통의 해장국집으로, 새벽 4시부터 문을 엽니다. 진한 사골 육수가 일품입니다.</p>
  <h3>2. 성수동 수제 버거</h3>
  <p>직접 만든 패티와 번을 사용하는 수제 버거집. 트러플 버거가 시그니처 메뉴입니다.</p>
  <h3>3. 을지로 노포 중국집</h3>
  <p>3대째 이어오는 중국집으로, 손으로 직접 뽑는 수타면이 특징입니다.</p>',
  '관광객은 모르는 서울 현지인들의 숨은 맛집 10곳을 엄선해 소개합니다.',
  '/assets/imgs/page/img-77.png',
  'published',
  '서울 숨은 맛집 베스트 10 - 푸드 & 쿠킹',
  '서울 현지인들만 아는 진짜 맛집 10곳을 소개합니다. 종로, 성수, 을지로의 숨은 보석같은 식당들.',
  ARRAY['맛집', '서울맛집', '숨은맛집', '현지맛집', '맛집추천'],
  NOW() - INTERVAL '6 days'
FROM public.subdomains s WHERE s.name = 'food';

INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, featured_image_url, status, meta_title, meta_description, tags, published_at)
SELECT 
  s.id,
  '건강한 브런치 레시피 5선',
  'healthy-brunch-recipes-5',
  '<p>주말 아침을 특별하게 만들어줄 건강하고 맛있는 브런치 레시피를 소개합니다.</p>
  <h3>1. 아보카도 토스트</h3>
  <p>통밀빵에 으깬 아보카도를 올리고 수란을 얹은 영양 만점 브런치입니다.</p>
  <h3>2. 그릭 요거트 볼</h3>
  <p>그릭 요거트에 그래놀라, 베리류, 꿀을 토핑한 건강한 한 끼입니다.</p>
  <h3>3. 스무디 볼</h3>
  <p>아사이베리나 망고로 만든 진한 스무디에 각종 토핑을 올린 인스타그램 인기 메뉴입니다.</p>',
  '영양가 높고 만들기 쉬운 건강한 브런치 레시피 5가지를 소개합니다.',
  '/assets/imgs/page/img-55.png',
  'published',
  '건강한 브런치 레시피 5선 - 푸드 & 쿠킹',
  '주말 아침을 특별하게 만들어줄 건강하고 맛있는 브런치 레시피 5가지.',
  ARRAY['브런치', '건강식', '레시피', '아침식사', '홈카페'],
  NOW() - INTERVAL '10 days'
FROM public.subdomains s WHERE s.name = 'food';

-- Travel 서브도메인 포스트
INSERT INTO public.posts (subdomain_id, title, slug, content, excerpt, featured_image_url, status, meta_title, meta_description, tags, published_at)
SELECT 
  s.id,
  '제주도 숨은 명소 완벽 가이드',
  'jeju-hidden-spots-guide',
  '<p>제주도의 유명 관광지 말고, 현지인들만 아는 숨은 명소들을 소개합니다.</p>
  <h3>비자림로 숨은 카페들</h3>
  <p>비자림로 주변에는 제주의 자연을 만끽할 수 있는 아름다운 카페들이 숨어있습니다.</p>
  <h3>월정리 해변 일출 스팟</h3>
  <p>관광객이 적은 새벽 시간, 월정리 해변에서 보는 일출은 잊을 수 없는 추억을 선사합니다.</p>
  <h3>한라산 숨은 등산로</h3>
  <p>인파를 피해 조용히 한라산을 즐길 수 있는 대체 등산로를 소개합니다.</p>',
  '제주도 현지인들만 아는 숨은 명소와 꿀팁을 공개합니다.',
  '/assets/imgs/page/img-90.png',
  'published',
  '제주도 숨은 명소 완벽 가이드 - 여행',
  '제주도의 숨은 보석같은 장소들과 현지인 추천 스팟을 소개하는 완벽 가이드.',
  ARRAY['제주도', '여행', '숨은명소', '제주여행', '국내여행'],
  NOW() - INTERVAL '4 days'
FROM public.subdomains s WHERE s.name = 'travel';

-- 나머지 서브도메인들도 비슷한 방식으로 포스트 추가...

-- ===================================================================
-- 4. 조회수 랜덤 업데이트 (더 현실적으로 보이도록)
-- ===================================================================
UPDATE public.posts 
SET view_count = floor(random() * 5000 + 100)
WHERE status = 'published';

-- ===================================================================
-- 5. 통계 확인
-- ===================================================================
SELECT 
  s.name as subdomain,
  s.display_name,
  COUNT(p.id) as post_count
FROM public.subdomains s
LEFT JOIN public.posts p ON s.id = p.subdomain_id AND p.status = 'published'
GROUP BY s.id, s.name, s.display_name
ORDER BY s.id;