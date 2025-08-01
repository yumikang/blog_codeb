import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams, Link } from "@remix-run/react";
import Layout from "~/components/Layout";
import { dbHelpers } from "~/lib/supabase.server";
import { getEnvironmentConfig } from "~/lib/env.server";
import { EnvironmentWarning, EmptyState } from "~/components/ErrorBoundary";
import type { PostWithSubdomain } from "~/types/database";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const title = data ? `Latest News - Page ${data.currentPage} - Magzin Blog` : "Latest News - Magzin Blog";
  const description = data ? 
    `Browse the latest news and stories from around the world. Page ${data.currentPage} of ${data.totalPages}. Fresh content updated daily.` :
    "Stay updated with the latest news and stories from around the world. Fresh content updated daily.";
  
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
  ];
};

// Loader function to fetch latest posts with pagination
export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Check if environment is properly configured
    const envConfig = getEnvironmentConfig();
    if (!envConfig) {
      console.warn('Environment not properly configured, using fallback data');
      return json({
        posts: [],
        currentPage: 1,
        totalPages: 1,
        totalPosts: 0,
        postsPerPage: 12,
        isEnvironmentReady: false,
        error: 'Environment configuration incomplete'
      });
    }

    // Parse URL parameters for pagination
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const postsPerPage = 12;
    const offset = (page - 1) * postsPerPage;

    // Fetch posts with pagination
    const posts = await dbHelpers.getPosts(undefined, postsPerPage, offset);
    
    // For now, we'll estimate total posts (in a real app, you'd have a count query)
    // This is a simplified approach - you might want to add a count query to dbHelpers
    const totalPosts = posts && posts.length === postsPerPage ? page * postsPerPage + 1 : page * postsPerPage - (postsPerPage - (posts?.length || 0));
    const totalPages = Math.max(1, Math.ceil(totalPosts / postsPerPage));
    
    return json({
      posts: (posts || []) as PostWithSubdomain[],
      currentPage: page,
      totalPages,
      totalPosts,
      postsPerPage,
      isEnvironmentReady: true,
      error: null
    });
    
  } catch (error) {
    console.error('Latest page loader error:', error);
    
    // Return fallback data if database connection fails
    return json({
      posts: [],
      currentPage: 1,
      totalPages: 1,
      totalPosts: 0,
      postsPerPage: 12,
      isEnvironmentReady: false,
      error: error instanceof Error ? error.message : 'Failed to load posts'
    });
  }
};

export default function Latest() {
  const { posts, currentPage, totalPages, totalPosts, isEnvironmentReady, error } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  // Helper function to generate pagination URLs
  const getPaginationUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    return `/latest?${params.toString()}`;
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    
    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <Layout>
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-10 mx-auto">
            {/* Page Header */}
            <div className="text-center mb-5">
              <h1 className="display-4 mb-3">Latest News</h1>
              <p className="lead text-muted">
                Stay updated with the freshest stories from around the globe
              </p>
              {isEnvironmentReady && totalPosts > 0 && (
                <p className="text-muted">
                  Showing page {currentPage} of {totalPages} ({totalPosts} total posts)
                </p>
              )}
            </div>

            {/* Error State */}
            {!isEnvironmentReady && (
              <EnvironmentWarning error={error || undefined} />
            )}

            {/* Latest Posts Grid */}
            {isEnvironmentReady && posts.length > 0 ? (
              <div className="row g-4">
                {posts.map((post) => (
                  <div key={post?.id || Math.random()} className="col-lg-4 col-md-6">
                    <article className="card h-100 latest-post-card">
                      <div className="card-img-top position-relative">
                        {post?.featured_image_url ? (
                          <img 
                            src={post.featured_image_url} 
                            alt={post.featured_image_alt || post.title || 'Post thumbnail'}
                            className="w-100"
                            style={{ height: "200px", objectFit: "cover" }}
                          />
                        ) : (
                          <div 
                            className="w-100 bg-light d-flex align-items-center justify-content-center"
                            style={{ height: "200px" }}
                          >
                            <span className="text-muted fs-1">📰</span>
                          </div>
                        )}
                        
                        {post?.subdomains && (
                          <div className="position-absolute top-0 start-0 m-3">
                            <span className={`badge bg-${post.subdomains.theme_color || 'primary'}`}>
                              {post.subdomains.icon_emoji} {post.subdomains.display_name}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="card-body d-flex flex-column">
                        <div className="mb-2">
                          <small className="text-muted">
                            <i className="far fa-calendar me-1"></i>
                            {post?.published_at ? new Date(post.published_at).toLocaleDateString() : 'Date unknown'}
                          </small>
                          {post?.view_count && (
                            <small className="text-muted ms-3">
                              <i className="far fa-eye me-1"></i>
                              {post.view_count} views
                            </small>
                          )}
                        </div>
                        
                        <h5 className="card-title">
                          <a href={`/posts/${post?.slug || '#'}`} className="text-decoration-none text-dark hover-primary">
                            {post?.title || 'Untitled Post'}
                          </a>
                        </h5>
                        
                        {post?.excerpt && (
                          <p className="card-text flex-grow-1 text-muted">
                            {post.excerpt.length > 120 ? `${post.excerpt.substring(0, 120)}...` : post.excerpt}
                          </p>
                        )}
                        
                        {post?.tags && post.tags.length > 0 && (
                          <div className="mt-2">
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <span key={index} className="badge bg-light text-dark me-1 mb-1">
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            ) : isEnvironmentReady ? (
              <EmptyState 
                icon="📰"
                title="No posts found"
                description="Check back later for new content!"
              />
            ) : (
              /* Fallback static content when environment not ready */
              <div className="row g-4">
                {[
                  { title: 'Latest Innovations in Artificial Intelligence', category: 'Technology', color: 'primary' },
                  { title: 'Global Health Initiatives Making Impact', category: 'Health', color: 'success' },
                  { title: 'Sustainable Tourism: Traveling Responsibly', category: 'Travel', color: 'warning' },
                  { title: 'Culinary Trends: Farm-to-Table Movement', category: 'Food', color: 'info' },
                ].map((item, index) => (
                  <div key={index} className="col-lg-4 col-md-6">
                    <article className="card h-100">
                      <div className="card-img-top position-relative">
                        <div className="w-100 bg-light d-flex align-items-center justify-content-center" style={{ height: "200px" }}>
                          <span className="text-muted fs-1">📰</span>
                        </div>
                        <div className="position-absolute top-0 start-0 m-3">
                          <span className={`badge bg-${item.color}`}>{item.category}</span>
                        </div>
                      </div>
                      <div className="card-body d-flex flex-column">
                        <div className="mb-2">
                          <small className="text-muted">
                            <i className="far fa-calendar me-1"></i>
                            {new Date().toLocaleDateString()}
                          </small>
                        </div>
                        <h5 className="card-title">
                          <a href="#" className="text-decoration-none text-dark">
                            {item.title}
                          </a>
                        </h5>
                        <p className="card-text flex-grow-1 text-muted">
                          Sample content for {item.category.toLowerCase()} category. Configure your environment to see real posts.
                        </p>
                      </div>
                    </article>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {isEnvironmentReady && totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <nav aria-label="Latest posts pagination">
                  <ul className="pagination">
                    {/* Previous button */}
                    <li className={`page-item ${currentPage <= 1 ? 'disabled' : ''}`}>
                      {currentPage > 1 ? (
                        <Link to={getPaginationUrl(currentPage - 1)} className="page-link">
                          Previous
                        </Link>
                      ) : (
                        <span className="page-link" tabIndex={-1} aria-disabled="true">
                          Previous
                        </span>
                      )}
                    </li>
                    
                    {/* First page */}
                    {getPageNumbers()[0] > 1 && (
                      <>
                        <li className="page-item">
                          <Link to={getPaginationUrl(1)} className="page-link">1</Link>
                        </li>
                        {getPageNumbers()[0] > 2 && (
                          <li className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        )}
                      </>
                    )}
                    
                    {/* Page numbers */}
                    {getPageNumbers().map((page) => (
                      <li key={page} className={`page-item ${page === currentPage ? 'active' : ''}`}>
                        {page === currentPage ? (
                          <span className="page-link">
                            {page}
                            <span className="visually-hidden">(current)</span>
                          </span>
                        ) : (
                          <Link to={getPaginationUrl(page)} className="page-link">
                            {page}
                          </Link>
                        )}
                      </li>
                    ))}
                    
                    {/* Last page */}
                    {getPageNumbers()[getPageNumbers().length - 1] < totalPages && (
                      <>
                        {getPageNumbers()[getPageNumbers().length - 1] < totalPages - 1 && (
                          <li className="page-item disabled">
                            <span className="page-link">...</span>
                          </li>
                        )}
                        <li className="page-item">
                          <Link to={getPaginationUrl(totalPages)} className="page-link">
                            {totalPages}
                          </Link>
                        </li>
                      </>
                    )}
                    
                    {/* Next button */}
                    <li className={`page-item ${currentPage >= totalPages ? 'disabled' : ''}`}>
                      {currentPage < totalPages ? (
                        <Link to={getPaginationUrl(currentPage + 1)} className="page-link">
                          Next
                        </Link>
                      ) : (
                        <span className="page-link" tabIndex={-1} aria-disabled="true">
                          Next
                        </span>
                      )}
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}