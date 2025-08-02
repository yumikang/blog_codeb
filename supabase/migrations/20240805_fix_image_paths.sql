-- ===================================================================
-- 이미지 경로 수정 마이그레이션
-- /assets/imgs/ → /imgs/ 로 변경
-- ===================================================================

-- posts 테이블의 featured_image_url 경로 수정
UPDATE public.posts 
SET featured_image_url = REPLACE(featured_image_url, '/assets/imgs/', '/imgs/')
WHERE featured_image_url LIKE '/assets/imgs/%';