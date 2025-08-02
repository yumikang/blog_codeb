import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import Layout from "~/components/Layout";
import { dbHelpers } from "~/lib/supabase.server";
import { getEnvironmentConfig } from "~/lib/env.server";
import { EnvironmentWarning, EmptyState } from "~/components/ErrorBoundary";
import type { Subdomain, PostWithSubdomain } from "~/types/database";
import { Card9, Card10, Card12 } from "~/components/cards";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = data ? `Categories (${data.categories.length}) - Magzin Blog` : "Categories - Magzin Blog";
  const description = data ? 
    `Explore our ${data.categories.length} diverse categories covering ${data.categories.map(c => c?.display_name || 'Category').slice(0, 5).join(', ')} and more.` :
    "Explore our diverse categories covering technology, food, travel, lifestyle, business, health, sports, entertainment, fashion, and science.";
  
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
  ];
};

// Loader function to fetch categories with post counts
export const loader = async ({ }: LoaderFunctionArgs) => {
  try {
    // Check if environment is properly configured
    const envConfig = getEnvironmentConfig();
    if (!envConfig) {
      console.warn('Environment not properly configured, using fallback data');
      return json({
        categories: [],
        popularTags: [],
        totalCategories: 0,
        featuredPost: null,
        latestPosts: [],
        recommendedPosts: [],
        isEnvironmentReady: false,
        error: 'Environment configuration incomplete'
      });
    }

    // Fetch all active subdomains (categories)
    const subdomains = await dbHelpers.getSubdomains();
    
    // For each subdomain, we'll estimate post count (in a real app, you'd have proper count queries)
    // This is a simplified approach - you might want to add a proper count query to dbHelpers
    const categoriesWithCounts = [];
    
    if (subdomains) {
      for (const subdomain of subdomains) {
        try {
          // Get a sample of posts to estimate count
          const samplePosts = await dbHelpers.getPosts(subdomain.name, 50, 0);
          const estimatedCount = samplePosts ? samplePosts.length : 0;
          
          categoriesWithCounts.push({
            ...subdomain,
            postCount: estimatedCount
          });
        } catch (error) {
          console.warn(`Error fetching posts for ${subdomain.name}:`, error);
          categoriesWithCounts.push({
            ...subdomain,
            postCount: 0
          });
        }
      }
    }
    
    // Generate popular tags from recent posts
    const recentPosts = await dbHelpers.getPosts(undefined, 100, 0);
    const tagCounts = new Map<string, number>();
    
    if (recentPosts) {
      recentPosts.forEach(post => {
        if (post?.tags && Array.isArray(post.tags)) {
          post.tags.forEach((tag: any) => {
            if (typeof tag === 'string') {
              tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
            }
          });
        }
      });
    }
    
    // Get top 8 most popular tags
    const popularTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([tag, count]) => ({ tag, count }));
    
    // Fetch featured post and latest posts
    const allPosts = await dbHelpers.getPosts(undefined, 20, 0);
    const featuredPost = allPosts?.[0] || null;
    const latestPosts = allPosts?.slice(1, 5) || [];
    const recommendedPosts = allPosts?.slice(5, 9) || [];
    
    return json({
      categories: categoriesWithCounts as (Subdomain & { postCount: number })[],
      popularTags,
      totalCategories: categoriesWithCounts.length,
      featuredPost: featuredPost as PostWithSubdomain | null,
      latestPosts: latestPosts as PostWithSubdomain[],
      recommendedPosts: recommendedPosts as PostWithSubdomain[],
      isEnvironmentReady: true,
      error: null
    }, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
      }
    });
    
  } catch (error) {
    console.error('Categories page loader error:', error);
    
    // Return fallback data if database connection fails
    return json({
      categories: [],
      popularTags: [],
      totalCategories: 0,
      featuredPost: null,
      latestPosts: [],
      recommendedPosts: [],
      isEnvironmentReady: false,
      error: error instanceof Error ? error.message : 'Failed to load categories'
    }, {
      headers: {
        "Cache-Control": "no-cache"
      }
    });
  }
};

// Fallback categories data for when database is not available
const fallbackCategories = [
  {
    id: 1,
    name: "tech",
    display_name: "Technology",
    description: "Latest innovations, gadgets, and tech trends",
    theme_color: "primary",
    icon_emoji: "💻",
    postCount: 142
  },
  {
    id: 2,
    name: "food",
    display_name: "Food & Culture",
    description: "Global cuisines, recipes, and culinary traditions",
    theme_color: "success",
    icon_emoji: "🍽️",
    postCount: 98
  },
  {
    id: 3,
    name: "travel",
    display_name: "Travel",
    description: "Destinations, travel tips, and adventure stories",
    theme_color: "warning",
    icon_emoji: "✈️",
    postCount: 87
  },
  {
    id: 4,
    name: "lifestyle",
    display_name: "Lifestyle",
    description: "Health, wellness, and modern living",
    theme_color: "info",
    icon_emoji: "🌟",
    postCount: 156
  },
  {
    id: 5,
    name: "business",
    display_name: "Business",
    description: "Market trends, entrepreneurship, and finance",
    theme_color: "dark",
    icon_emoji: "📈",
    postCount: 73
  },
  {
    id: 6,
    name: "health",
    display_name: "Health",
    description: "Medical breakthroughs and wellness tips",
    theme_color: "success",
    icon_emoji: "🏥",
    postCount: 91
  }
];

// Fallback popular tags
const fallbackPopularTags = [
  { tag: "artificial-intelligence", count: 45 },
  { tag: "sustainable-travel", count: 32 },
  { tag: "healthy-eating", count: 28 },
  { tag: "remote-work", count: 24 },
  { tag: "climate-change", count: 22 },
  { tag: "cryptocurrency", count: 19 },
  { tag: "innovation", count: 17 },
  { tag: "digital-transformation", count: 15 }
];

export default function Categories() {
  const { categories, popularTags, totalCategories, featuredPost, latestPosts, recommendedPosts, isEnvironmentReady, error } = useLoaderData<typeof loader>();

  // Use dynamic data if available, otherwise fallback
  const displayCategories = isEnvironmentReady && categories.length > 0 ? categories : fallbackCategories;
  const displayTags = isEnvironmentReady && popularTags.length > 0 ? popularTags : fallbackPopularTags;

  return (
    <Layout>
      {/* Carousel Ticker Section - Popular Tags */}
      <div className="categories-banner">
        <div className="container-fluid">
          <div className="carouselTicker carouselTicker-nav">
            <ul className="carouselTicker__list">
              {displayTags.map((item, index) => (
                <li key={item?.tag || index} className="carouselTicker__item mx-0">
                  <a href="#" className="tag-item link-effect-2">
                    <span className="text">
                      <span className="text1">{item?.tag?.replace(/-/g, ' ') || 'tag'}</span>
                      <span className="text2">{item?.tag?.replace(/-/g, ' ') || 'tag'}</span>
                    </span>
                    <span className="number">
                      <span className="odometer text-nowrap" data-count={item?.count || 0}></span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Featured Post Section */}
      {featuredPost && (
        <section className="sec-1-archive-2">
          <div className="container">
            <div className="row mt-5">
              <div className="col-12">
                <Card12 post={featuredPost} />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest Posts Section */}
      <section className="sec-5-home-4 pb-70 overflow-hidden">
        <div className="container">
          <div className="row g-lg-4 g-5">
            <div className="col-lg-8">
              <div className="row mt-2 g-4">
                {latestPosts.map((post) => post && (
                  <div key={post.id} className="col-12">
                    <Card9 post={post} />
                  </div>
                ))}
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="col-lg-4">
              <div className="block-ads bg-200 mb-4">
                <div className="banner-ads" data-background="/imgs/page/bg-archive1.png">
                  <img src="/imgs/template/logo/logo-gradient.svg" alt="magzin" />
                  <h4 className="mt-3">Advertisement</h4>
                  <p className="text-muted">Your ad could be here</p>
                </div>
              </div>
              
              {/* Recommended Posts */}
              <div className="block-recomment">
                <h5 className="mb-3">Recommended for you</h5>
                <div className="row g-3">
                  {recommendedPosts.map((post) => post && (
                    <div key={post.id} className="col-12">
                      <Card10 post={post} style={1} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              {/* Page Header */}
              <div className="text-center mb-5">
                <h2 className="display-5 mb-3">Browse Categories</h2>
                <p className="lead text-muted">
                  Explore our diverse range of topics and find content that interests you
                </p>
                {isEnvironmentReady && totalCategories > 0 && (
                  <p className="text-muted">
                    {totalCategories} categories available
                  </p>
                )}
              </div>

              {/* Error State */}
              {!isEnvironmentReady && (
                <EnvironmentWarning error={error || undefined} />
              )}

            {/* Categories Grid */}
            <div className="row g-4">
              {displayCategories.map((category) => (
                <div key={category?.id || Math.random()} className="col-lg-4 col-md-6">
                  <div className="card h-100 border-0 shadow-sm hover-card">
                    <div className="card-body text-center p-4">
                      <div className="mb-3">
                        <span className="display-4">{category?.icon_emoji || '📰'}</span>
                      </div>
                      <h5 className="card-title mb-2">
                        <Link 
                          to={`/category/${category?.name || category?.id}`} 
                          className="text-decoration-none text-dark hover-primary"
                        >
                          {category?.display_name || category?.name || 'Category'}
                        </Link>
                      </h5>
                      <p className="card-text text-muted mb-3">
                        {category?.description || 'Category description'}
                      </p>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className={`badge bg-${category?.theme_color || 'primary'}`}>
                          {category?.postCount || 0} posts
                        </span>
                        <Link 
                          to={`/category/${category?.name || category?.id}`}
                          className="btn btn-outline-primary btn-sm"
                        >
                          View Posts
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

              {/* No categories state */}
              {isEnvironmentReady && categories.length === 0 && (
                <EmptyState 
                  icon="📂"
                  title="No categories found"
                  description="Categories will appear here once content is added to the database."
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Custom CSS for hover effects and carousel */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .hover-card {
            transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
          }
          .hover-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1) !important;
          }
          .hover-primary:hover {
            color: var(--bs-primary, #0d6efd) !important;
            transition: color 0.2s ease;
          }
          .tag-badge {
            cursor: pointer;
            transition: all 0.2s ease;
          }
          .tag-badge:hover {
            transform: scale(1.05);
          }
          .categories-banner {
            background: #f8f9fa;
            padding: 2rem 0;
            margin-bottom: 3rem;
          }
          .tag-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.5rem 1.5rem;
            background: white;
            border-radius: 50px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-decoration: none;
            color: #333;
            white-space: nowrap;
          }
          .tag-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          }
          .block-ads {
            background: #f8f9fa;
            padding: 2rem;
            text-align: center;
            border-radius: 8px;
          }
          .banner-ads {
            padding: 3rem 2rem;
          }
        `
      }} />
    </Layout>
  );
}