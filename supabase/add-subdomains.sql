-- Add missing subdomains to ensure all 10 are present
-- This script can be run multiple times safely due to ON CONFLICT clause

INSERT INTO subdomains (name, display_name, theme_color, description, is_active) 
VALUES 
  ('tech', 'Technology', '1', 'Latest in technology, gadgets, and innovation', true),
  ('food', 'Food & Cooking', '2', 'Recipes, restaurants, and culinary adventures', true),
  ('travel', 'Travel', '3', 'Travel guides, tips, and destination reviews', true),
  ('lifestyle', 'Lifestyle', '4', 'Fashion, wellness, and modern living', true),
  ('business', 'Business', '5', 'Entrepreneurship, finance, and career advice', true),
  ('health', 'Health & Wellness', '6', 'Fitness, nutrition, and mental health', true),
  ('sports', 'Sports', '7', 'Sports news, analysis, and fitness tips', true),
  ('entertainment', 'Entertainment', '8', 'Movies, TV, music, and pop culture', true),
  ('science', 'Science', '9', 'Scientific discoveries and technology breakthroughs', true),
  ('education', 'Education', '10', 'Learning resources and educational content', true)
ON CONFLICT (name) 
DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  theme_color = EXCLUDED.theme_color,
  description = EXCLUDED.description,
  is_active = EXCLUDED.is_active;

-- Verify all subdomains are added
SELECT * FROM subdomains ORDER BY id;