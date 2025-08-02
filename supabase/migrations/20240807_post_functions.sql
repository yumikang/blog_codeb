-- Create function to increment post view count
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE posts 
  SET view_count = view_count + 1 
  WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- Create function for full-text search on posts
CREATE OR REPLACE FUNCTION search_posts(
  search_query TEXT,
  search_limit INTEGER DEFAULT 10,
  search_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  subdomain_id INTEGER,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  tags TEXT[],
  published_at TIMESTAMP WITH TIME ZONE,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.subdomain_id,
    p.title,
    p.slug,
    p.excerpt,
    p.featured_image_url,
    p.tags,
    p.published_at,
    ts_rank(
      to_tsvector('english', p.title || ' ' || COALESCE(p.content, '') || ' ' || COALESCE(array_to_string(p.tags, ' '), '')),
      plainto_tsquery('english', search_query)
    ) as rank
  FROM posts p
  WHERE 
    p.status = 'published' AND
    to_tsvector('english', p.title || ' ' || COALESCE(p.content, '') || ' ' || COALESCE(array_to_string(p.tags, ' '), ''))
    @@ plainto_tsquery('english', search_query)
  ORDER BY rank DESC, p.published_at DESC
  LIMIT search_limit
  OFFSET search_offset;
END;
$$ LANGUAGE plpgsql;

-- Create index for full-text search
CREATE INDEX IF NOT EXISTS idx_posts_fulltext ON posts 
USING gin(to_tsvector('english', title || ' ' || COALESCE(content, '') || ' ' || COALESCE(array_to_string(tags, ' '), '')));

-- Create function to get posts by tag
CREATE OR REPLACE FUNCTION get_posts_by_tag(
  tag_name TEXT,
  tag_limit INTEGER DEFAULT 10,
  tag_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  subdomain_id INTEGER,
  title TEXT,
  slug TEXT,
  excerpt TEXT,
  featured_image_url TEXT,
  tags TEXT[],
  published_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.subdomain_id,
    p.title,
    p.slug,
    p.excerpt,
    p.featured_image_url,
    p.tags,
    p.published_at
  FROM posts p
  WHERE 
    p.status = 'published' AND
    tag_name = ANY(p.tags)
  ORDER BY p.published_at DESC
  LIMIT tag_limit
  OFFSET tag_offset;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION increment_post_views(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION search_posts(TEXT, INTEGER, INTEGER) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_posts_by_tag(TEXT, INTEGER, INTEGER) TO anon, authenticated;