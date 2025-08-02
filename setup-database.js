// Database setup script using Supabase
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up Magzin Blog database...');
  
  try {
    // Try to insert sample subdomains (this will fail if table doesn't exist)
    console.log('📝 Attempting to insert sample subdomains...');
    const { error: subdomainsError } = await supabase
      .from('subdomains')
      .upsert([
        { name: 'tech', display_name: 'Technology', theme_color: 'primary', description: 'Latest innovations, gadgets, and tech trends', icon_emoji: '💻' },
        { name: 'food', display_name: 'Food & Culture', theme_color: 'success', description: 'Global cuisines, recipes, and culinary traditions', icon_emoji: '🍽️' },
        { name: 'travel', display_name: 'Travel', theme_color: 'warning', description: 'Destinations, travel tips, and adventure stories', icon_emoji: '✈️' },
        { name: 'lifestyle', display_name: 'Lifestyle', theme_color: 'info', description: 'Health, wellness, and modern living', icon_emoji: '🌟' },
        { name: 'business', display_name: 'Business', theme_color: 'dark', description: 'Market trends, entrepreneurship, and finance', icon_emoji: '📈' },
        { name: 'health', display_name: 'Health', theme_color: 'success', description: 'Medical breakthroughs and wellness tips', icon_emoji: '🏥' }
      ], {
        onConflict: 'name',
        ignoreDuplicates: true
      });
    
    if (subdomainsError) {
      if (subdomainsError.code === '42P01') {
        console.log('❌ Tables do not exist in Supabase database.');
        console.log('📋 Please execute the SQL from supabase_schema.sql in your Supabase SQL Editor');
        console.log('🔗 Go to: https://supabase.com/dashboard → Your Project → SQL Editor');
        console.log('📄 Copy and paste the entire content of supabase_schema.sql file');
        return false;
      } else {
        console.error('Error with subdomains table:', subdomainsError);
        return false;
      }
    } else {
      console.log('✅ Sample subdomains inserted/updated successfully');
    }

    // Get subdomain IDs for sample posts
    const { data: subdomains } = await supabase
      .from('subdomains')
      .select('id, name')
      .limit(3);

    if (subdomains && subdomains.length > 0) {
      const techId = subdomains.find(s => s.name === 'tech')?.id;
      const foodId = subdomains.find(s => s.name === 'food')?.id;
      const travelId = subdomains.find(s => s.name === 'travel')?.id;

      // Insert sample posts
      console.log('📝 Inserting sample posts...');
      const { error: insertPostsError } = await supabase
        .from('posts')
        .upsert([
          {
            subdomain_id: techId,
            title: 'The Future of AI Technology',
            slug: 'future-of-ai-technology',
            content: 'Artificial intelligence continues to evolve at an unprecedented pace. From machine learning algorithms to neural networks, AI is reshaping industries and transforming how we work and live. This comprehensive guide explores the latest developments in AI technology and their potential impact on society.',
            excerpt: 'Exploring the latest developments in AI and their impact on society.',
            status: 'published',
            published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
          },
          {
            subdomain_id: foodId,
            title: 'Traditional Korean Cuisine Guide',
            slug: 'traditional-korean-cuisine-guide',
            content: 'Korean food culture is rich with tradition and flavor. From kimchi to bulgogi, Korean cuisine offers a perfect balance of taste, nutrition, and cultural heritage. Discover the secrets behind authentic Korean cooking techniques and ingredients.',
            excerpt: 'A comprehensive guide to understanding Korean culinary traditions.',
            status: 'published',
            published_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
          },
          {
            subdomain_id: travelId,
            title: 'Best Travel Destinations 2024',
            slug: 'best-travel-destinations-2024',
            content: 'Discover the most exciting places to visit this year. From hidden gems to popular hotspots, these destinations offer unforgettable experiences for every type of traveler. Our curated list includes detailed guides, tips, and insider recommendations.',
            excerpt: 'Our curated list of must-visit destinations for 2024.',
            status: 'published',
            published_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
          }
        ], {
          onConflict: 'subdomain_id,slug',
          ignoreDuplicates: true
        });

      if (insertPostsError) {
        console.error('Error inserting posts:', insertPostsError);
      } else {
        console.log('✅ Sample posts inserted/updated successfully');
      }
    }

    // Test connection
    console.log('🔍 Testing database connection...');
    const { data: testData, error: testError } = await supabase
      .from('subdomains')
      .select('name, display_name')
      .limit(3);
    
    if (testError) {
      console.error('Connection test failed:', testError);
      return false;
    } else {
      console.log('✅ Database connection test successful!');
      console.log(`Found ${testData?.length || 0} subdomains:`);
      testData?.forEach(sub => console.log(`  - ${sub.display_name} (${sub.name})`));
      return true;
    }

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
}

// Run setup
setupDatabase().then(success => {
  if (success) {
    console.log('🎉 Database setup completed successfully!');
    process.exit(0);
  } else {
    console.log('❌ Database setup failed. Please check the instructions above.');
    process.exit(1);
  }
});