import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import Layout from "~/components/Layout";
import { dbHelpers } from "~/lib/supabase.server";
import { getEnvironmentConfig } from "~/lib/env.server";
import { EnvironmentWarning } from "~/components/ErrorBoundary";
import type { PostWithSubdomain, Subdomain } from "~/types/database";
import { Card1, Card5, Card10 } from "~/components/cards";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = data ? "Magzin Blog - Your Gateway to Global News" : "Magzin Blog";
  const description = data ? 
    "Discover the latest news and stories from around the world with Magzin Blog. Your gateway to global news, lifestyle, tech, food, travel and more." :
    "Magzin Blog - Global News Portal";
  
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
  ];
};

// Loader function to fetch homepage data
export const loader = async ({ }: LoaderFunctionArgs) => {
  try {
    // Check if environment is properly configured
    const envConfig = getEnvironmentConfig();
    if (!envConfig) {
      console.warn('Environment not properly configured, using fallback data');
      return json({
        posts: [],
        subdomains: [],
        featuredPosts: [],
        isEnvironmentReady: false,
        error: 'Environment configuration incomplete'
      });
    }

    // Fetch latest posts (limit 6 for homepage hero section)
    const latestPosts = await dbHelpers.getPosts(undefined, 6, 0);
    
    // Fetch all active subdomains for categories section
    const subdomains = await dbHelpers.getSubdomains();
    
    // Get featured posts (first 3 from latest) with null safety
    const featuredPosts = latestPosts ? latestPosts.slice(0, 3) : [];
    
    return json({
      posts: (latestPosts || []) as PostWithSubdomain[],
      subdomains: (subdomains || []) as Subdomain[],
      featuredPosts: featuredPosts as PostWithSubdomain[],
      isEnvironmentReady: true,
      error: null
    }, {
      headers: {
        "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400"
      }
    });
    
  } catch (error) {
    console.error('Homepage loader error:', error);
    
    // Return fallback data if database connection fails
    return json({
      posts: [],
      subdomains: [],
      featuredPosts: [],
      isEnvironmentReady: false,
      error: error instanceof Error ? error.message : 'Failed to load data'
    }, {
      headers: {
        "Cache-Control": "no-cache"
      }
    });
  }
};

export default function Index() {
  const { posts, subdomains, featuredPosts, isEnvironmentReady, error } = useLoaderData<typeof loader>();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-section py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12 text-center">
              <h1 className="display-4 mb-4">Welcome to Magzin Blog</h1>
              <p className="lead text-muted mb-5">
                Your Gateway to Global News - Discover the latest stories from around the world
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Error State */}
      {!isEnvironmentReady && (
        <section className="py-4">
          <div className="container">
            <EnvironmentWarning error={error || undefined} />
          </div>
        </section>
      )}

      {/* Featured Posts Section */}
      {isEnvironmentReady && featuredPosts.length > 0 && (
        <section className="sec-1-home-1 pt-5">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <h2 className="mb-4">Featured Stories</h2>
              </div>
            </div>
            <div className="row g-4">
              {featuredPosts.map((post) => post && (
                <div key={post.id} className="col-lg-4 col-md-6">
                  <Card5 post={post} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="categories-section py-5 bg-light">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <h2 className="mb-4 text-center">Explore Categories</h2>
            </div>
          </div>
          <div className="row g-4">
            {isEnvironmentReady && subdomains.length > 0 ? (
              subdomains.map((subdomain) => (
                <div key={subdomain?.id || Math.random()} className="col-lg-3 col-md-4 col-sm-6">
                  <div className="card h-100 text-center hover-card">
                    <div className="card-body">
                      <div className="mb-3">
                        <span className="display-6">{subdomain?.icon_emoji || '📰'}</span>
                      </div>
                      <h5 className={`card-title text-${subdomain?.theme_color || 'primary'}`}>
                        {subdomain?.display_name || 'Category'}
                      </h5>
                      {subdomain?.description && (
                        <p className="card-text text-muted">{subdomain.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Fallback static categories
              [
                { name: 'Technology', icon: '💻', description: 'Latest innovations and tech news from around the globe.' },
                { name: 'Food & Culture', icon: '🍽️', description: 'Explore cuisines and cultural stories from different countries.' },
                { name: 'Travel', icon: '✈️', description: 'Discover amazing destinations and travel experiences.' },
                { name: 'Health', icon: '🏥', description: 'Health tips, medical news, and wellness insights.' },
                { name: 'Business', icon: '📈', description: 'Market trends, entrepreneurship, and finance news.' },
                { name: 'Sports', icon: '⚽', description: 'Athletic achievements and sporting event coverage.' }
              ].map((category, index) => (
                <div key={index} className="col-lg-3 col-md-4 col-sm-6">
                  <div className="card h-100 text-center hover-card">
                    <div className="card-body">
                      <div className="mb-3">
                        <span className="display-6">{category.icon}</span>
                      </div>
                      <h5 className="card-title">{category.name}</h5>
                      <p className="card-text text-muted">{category.description}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Latest Posts Section */}
      {isEnvironmentReady && posts.length > 3 && (
        <section className="sec-3-home-1 py-5">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <h2 className="mb-4">Latest News</h2>
              </div>
            </div>
            <div className="row g-4">
              {posts.slice(3).map((post) => post && (
                <div key={post.id} className="col-lg-4 col-md-6">
                  <Card10 post={post} style={1} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
