import type { LoaderFunctionArgs, MetaFunction, ActionFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, Link, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import Layout from "~/components/Layout";
import { dbHelpers, supabaseServer } from "~/lib/supabase.server";
import { getEnvironmentConfig } from "~/lib/env.server";
import { EnvironmentWarning, EmptyState } from "~/components/ErrorBoundary";
import type { PostWithSubdomain } from "~/types/database";
import { Card5 } from "~/components/cards";
import { getUser } from "~/lib/auth.server";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || !data.post) {
    return [
      { title: "Post Not Found - Magzin Blog" },
      { name: "description", content: "The requested post could not be found." },
    ];
  }

  const { post } = data;
  const title = `${post.title} - ${post.subdomain?.display_name || 'Magzin'} Blog`;
  const description = post.excerpt || post.content?.substring(0, 160) || '';
  
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "article" },
    { property: "og:image", content: post.featured_image_url || '/imgs/page/img-112.png' },
    { property: "article:published_time", content: post.published_at || '' },
    { property: "article:author", content: post.author?.name || '' },
    { property: "article:section", content: post.subdomain?.display_name || '' },
  ];
};

// Action handler for comment submission
export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const content = formData.get("content") as string;
  const { subdomain, slug } = params;

  // Check if user is authenticated
  const user = await getUser(request);
  if (!user) {
    return json({ error: "Please log in to comment" }, { status: 401 });
  }

  // Get the post to get its ID
  const posts = await dbHelpers.getPosts(subdomain!, 100, 0);
  const post = posts?.find(p => p.slug === slug);
  
  if (!post) {
    return json({ error: "Post not found" }, { status: 404 });
  }

  // Create the comment
  const { error } = await supabaseServer
    .from('comments')
    .insert({
      post_id: post.id,
      user_id: user.id,
      content,
      status: 'approved' // Auto-approve for now
    });

  if (error) {
    console.error("Error creating comment:", error);
    return json({ error: "Failed to create comment" }, { status: 500 });
  }

  // Redirect to refresh the page
  return redirect(`/${subdomain}/${slug}#comments`);
};

// Loader function to fetch post details
export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { subdomain, slug } = params;

  if (!subdomain || !slug) {
    throw new Response("Not Found", { status: 404 });
  }

  try {
    // Check if environment is properly configured
    const envConfig = getEnvironmentConfig();
    if (!envConfig) {
      console.warn('Environment not properly configured, using fallback data');
      return json({
        post: null,
        relatedPosts: [],
        comments: [],
        user: null,
        isEnvironmentReady: false,
        error: 'Environment configuration incomplete'
      });
    }

    // Fetch the specific post
    const posts = await dbHelpers.getPosts(subdomain, 100, 0);
    const post = posts?.find(p => p.slug === slug);

    if (!post) {
      throw new Response("Post Not Found", { status: 404 });
    }

    // Fetch related posts from the same subdomain
    const relatedPosts = posts?.filter(p => p.slug !== slug).slice(0, 4) || [];

    // Fetch comments for this post
    const comments = await dbHelpers.getComments(post.id);

    // Get current user
    const user = await getUser(request);

    return json({
      post: post as PostWithSubdomain,
      relatedPosts: relatedPosts as PostWithSubdomain[],
      comments: comments || [],
      user,
      isEnvironmentReady: true,
      error: null
    }, {
      headers: {
        "Cache-Control": "public, max-age=600, s-maxage=3600, stale-while-revalidate=86400"
      }
    });
    
  } catch (error) {
    console.error('Post detail loader error:', error);
    
    // Return fallback data if database connection fails
    return json({
      post: null,
      relatedPosts: [],
      comments: [],
      user: null,
      isEnvironmentReady: false,
      error: error instanceof Error ? error.message : 'Failed to load post'
    }, {
      headers: {
        "Cache-Control": "no-cache"
      }
    });
  }
};

// Helper component for share buttons
function ShareButtons({ url, title }: { url: string; title: string }) {
  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);

  return (
    <div className="d-flex align-items-center gap-2">
      <span className="text-dark">Share:</span>
      <div className="d-inline-flex group-social-icons mt-0 rounded-8">
        <a 
          href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="icon-shape icon-46"
        >
          <svg className="" xmlns="http://www.w3.org/2000/svg" width="10" height="17" viewBox="0 0 10 17" fill="none">
            <path d="M8.84863 9.20312H6.5415V16.0938H3.46533V9.20312H0.942871V6.37305H3.46533V4.18896C3.46533 1.72803 4.94189 0.34375 7.1875 0.34375C8.26416 0.34375 9.40234 0.559082 9.40234 0.559082V2.98926H8.14111C6.91064 2.98926 6.5415 3.72754 6.5415 4.52734V6.37305H9.2793L8.84863 9.20312Z" fill="black"></path>
          </svg>
        </a>
        <a 
          href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`}
          target="_blank"
          rel="noopener noreferrer"
          className="icon-shape icon-46"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-twitter-x" viewBox="0 0 16 16">
            <path d="M12.6.75h2.454l-5.36 6.142L16 15.25h-4.937l-3.867-5.07-4.425 5.07H.316l5.733-6.57L0 .75h5.063l3.495 4.633L12.601.75Zm-.86 13.028h1.36L4.323 2.145H2.865z"></path>
          </svg>
        </a>
        <a 
          href={`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="icon-shape icon-46"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-linkedin" viewBox="0 0 16 16">
            <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"></path>
          </svg>
        </a>
        <a 
          href={`mailto:?subject=${shareTitle}&body=${shareUrl}`}
          className="icon-shape icon-46"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope" viewBox="0 0 16 16">
            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1zm13 2.383-4.708 2.825L15 11.105zm-.034 6.876L9.271 8.82 8 9.583 6.728 8.82l-5.694 3.44A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741M1 11.105l4.708-2.897L1 5.383z"/>
          </svg>
        </a>
      </div>
    </div>
  );
}

export default function PostDetail() {
  const { post, relatedPosts, comments, user, isEnvironmentReady, error } = useLoaderData<typeof loader>();
  const [viewCount, setViewCount] = useState(0);
  const fetcher = useFetcher();

  // Simulate view count
  useEffect(() => {
    if (post) {
      setViewCount(Math.floor(Math.random() * 500) + 100);
    }
  }, [post]);

  // Format date helper
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Calculate reading time
  const calculateReadingTime = (content: string | null) => {
    if (!content) return 6;
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  if (!isEnvironmentReady) {
    return (
      <Layout>
        <div className="container py-5">
          <EnvironmentWarning error={error || undefined} />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container py-5">
          <EmptyState 
            icon="📄"
            title="Post not found"
            description="The post you're looking for doesn't exist or has been removed."
          />
        </div>
      </Layout>
    );
  }

  const readingTime = calculateReadingTime(post.content);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero-single-1">
        <div className="container">
          <div className="row">
            <div className="col-lg-9 col-md-10 offset-lg-1 offset-md-1">
              <div className="text-center pt-5 mb-4">
                {post.subdomain && (
                  <Link 
                    to={`/categories/${post.subdomain.name}`} 
                    className={`badge bg-${post.subdomain.theme_color || '1'} fs-8 mb-3`}
                  >
                    {post.subdomain.display_name || post.subdomain.name}
                  </Link>
                )}
                <ul className="d-flex align-items-center justify-content-center gap-4 text-600 m-0">
                  <li>
                    <p className="fs-8 m-0">{readingTime} mins read</p>
                  </li>
                </ul>
                <h2>{post.title}</h2>
              </div>
            </div>
          </div>
          <div className="border-top"></div>
          <div className="row">
            <div className="col-lg-9 col-md-10 offset-lg-1 offset-md-1">
              <div className="bottom mt-auto d-flex flex-wrap align-items-center gap-2 pt-4">
                {post.author && (
                  <Link to={`/author/${post.author.id}`} className="author d-flex align-items-center gap-2">
                    {post.author.avatar_url && (
                      <img 
                        className="avatar avatar-md rounded-circle" 
                        src={post.author.avatar_url} 
                        alt={post.author.name}
                        loading="lazy"
                      />
                    )}
                    <span className="fs-7 text-dark fw-regular">{post.author.name}</span>
                  </Link>
                )}
                <ul className="d-flex align-items-center gap-4 text-600 m-0 ps-3">
                  <li>
                    <p className="fs-8 m-0">{formatDate(post.published_at)}</p>
                  </li>
                </ul>
                <div className="ms-md-auto ms-5 d-flex align-items-center gap-3 me-5">
                  <a href="#comments" className="comment d-flex align-items-center fs-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M2.50018 5.43423C2.50018 4.26961 3.44494 3.3255 4.61035 3.3255H15.39C16.5554 3.3255 17.5002 4.26961 17.5002 5.43422V13.1078C17.5002 14.2724 16.5554 15.2165 15.39 15.2165H6.3295L3.41902 17.3786C3.24443 17.5083 3.01159 17.5285 2.81722 17.4309C2.62285 17.3333 2.50018 17.1345 2.50018 16.9171V5.43423ZM4.61035 4.47571C4.08062 4.47571 3.65118 4.90485 3.65118 5.43423V15.7729L5.79569 14.1799C5.89495 14.1062 6.01534 14.0663 6.13902 14.0663H15.39C15.9197 14.0663 16.3492 13.6372 16.3492 13.1078V5.43422C16.3492 4.90485 15.9197 4.47571 15.39 4.47571H4.61035Z" fill="#626568" />
                    </svg>
                    <span><span className="odometer text-nowrap" data-count={comments?.length || 0}></span> Comments</span>
                  </a>
                  <a href="#" className="readers d-flex align-items-center fs-8">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path fillRule="evenodd" clipRule="evenodd" d="M17.186 10.3224C15.734 13.039 12.9803 14.7266 10.001 14.7266C7.01977 14.7266 4.26612 13.039 2.81407 10.3224C2.70224 10.1114 2.70224 9.88843 2.81407 9.67767C4.26612 6.96107 7.01977 5.27366 10.001 5.27366C12.9803 5.27366 15.7339 6.96107 17.186 9.67767C17.2998 9.88843 17.2998 10.1114 17.186 10.3224ZM18.1135 9.13905C16.4744 6.07185 13.366 4.16669 10.001 4.16669C6.63409 4.16669 3.52561 6.07185 1.88652 9.13905C1.59341 9.68631 1.59341 10.3137 1.88652 10.8606C3.52561 13.9278 6.63409 15.8334 10.001 15.8334C13.366 15.8334 16.4744 13.9278 18.1135 10.8606C18.4066 10.3138 18.4066 9.68631 18.1135 9.13905ZM10.001 12.2707C11.2025 12.2707 12.18 11.2522 12.18 9.99993C12.18 8.7477 11.2025 7.72912 10.001 7.72912C8.79769 7.72912 7.82002 8.7477 7.82002 9.99993C7.82002 11.2522 8.79773 12.2707 10.001 12.2707ZM10.001 6.62215C8.21147 6.62215 6.75752 8.13757 6.75752 9.99997C6.75752 11.8628 8.21151 13.3776 10.001 13.3776C11.7886 13.3776 13.2425 11.8627 13.2425 9.99997C13.2425 8.13757 11.7886 6.62215 10.001 6.62215Z" fill="#626568" />
                    </svg>
                    <span><span className="odometer text-nowrap" data-count={viewCount}></span> views</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="custom-container-2 py-5">
          <img 
            className="rounded-16" 
            src={post.featured_image_url || "/imgs/page/img-112.png"} 
            alt={post.featured_image_alt || post.title}
            loading="lazy"
          />
        </div>
        <div className="container">
          <div className="row">
            <div className="col-lg-9 col-md-10 offset-lg-1 offset-md-1">
              {/* Post Content */}
              <div className="d-flex flex-column gap-3">
                <div 
                  className="post-content"
                  dangerouslySetInnerHTML={{ __html: post.content || '' }}
                />
                
                <div className="border-top mt-5 mb-1"></div>
                
                {/* Tags and Share */}
                <div className="d-flex flex-wrap gap-4 align-items-center justify-content-between mb-4">
                  <div className="d-flex align-items-center gap-2">
                    {post.tags && Array.isArray(post.tags) && post.tags.map((tag: any, index: number) => (
                      <a key={index} href="#" className="tag-item">
                        <span>{typeof tag === 'string' ? tag : tag.name || 'tag'}</span>
                      </a>
                    ))}
                  </div>
                  <ShareButtons url={shareUrl} title={post.title} />
                </div>

                {/* Newsletter Subscription */}
                <div className="block-subscribe h-100 d-flex flex-column flex-lg-row gap-3 justify-content-between bg-200 wow img-custom-anim-top">
                  <div>
                    <div className="block-title d-flex align-items-center gap-1 fs-7 text-600">
                      <svg className="" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M4.75 7.75C4.75 6.64543 5.64543 5.75 6.75 5.75H17.25C18.3546 5.75 19.25 6.64543 19.25 7.75V16.25C19.25 17.3546 18.3546 18.25 17.25 18.25H6.75C5.64543 18.25 4.75 17.3546 4.75 16.25V7.75Z" stroke="#0E0E0F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5.5 6.5L12 12.25L18.5 6.5" stroke="#0E0E0F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <span className="fs-7 fw-regular">Newsletter</span>
                    </div>
                    <div className="title">
                      <h5 className="mb-0">
                        Stay Informed with <br className="d-none d-lg-block" />
                        Top Headlines
                      </h5>
                    </div>
                  </div>
                  <form action="#" className="position-relative">
                    <div className="d-flex flex-wrap flex-md-nowrap gap-2 align-items-center mb-3">
                      <input className="form-control" type="text" placeholder="Your email address" />
                      <button className="btn btn-dark button-effect-1" type="submit">Subscribe</button>
                    </div>
                    <input type="checkbox" id="subscribe" />
                    <label htmlFor="subscribe" className="text-600 fs-8">
                      By clicking the button, you are agreeing with our <a href="#" className="text-dark">Term & Conditions</a>
                    </label>
                  </form>
                </div>

                {/* Comment Form */}
                <h4 className="mt-5 mb-2 pb-4 pt-3" id="comments">Leave a comment</h4>
                {user ? (
                  <fetcher.Form method="post" className="row wow img-custom-anim-top g-3 border-top">
                    <div className="col-12">
                      <div className="d-flex gap-2 align-items-center mb-3">
                        <div className="icon-shape bg-primary">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 10C12.3013 10 14.1667 8.13452 14.1667 5.83333C14.1667 3.53215 12.3013 1.66667 10 1.66667C7.69883 1.66667 5.83335 3.53215 5.83335 5.83333C5.83335 8.13452 7.69883 10 10 10Z" fill="white" />
                            <path d="M10 12.0833C5.66252 12.0833 2.08335 15.6625 2.08335 20H3.33335C3.33335 16.3529 6.35291 13.3333 10 13.3333C13.6471 13.3333 16.6667 16.3529 16.6667 20H17.9167C17.9167 15.6625 14.3375 12.0833 10 12.0833Z" fill="white" />
                          </svg>
                        </div>
                        <span className="text-muted">{user.email}</span>
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="input-group d-flex">
                        <div className="icon-input pt-2 ps-3 align-items-start border border-end-0 rounded-1 rounded-end-0">
                          <svg className="" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <path className="stroke-dark" d="M5.5 2.14844H3C1.89543 2.14844 1 3.04387 1 4.14844V14.6484C1 15.753 1.89543 16.6484 3 16.6484H13.5C14.6046 16.6484 15.5 15.753 15.5 14.6484V12.1484" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path className="fill-dark" d="M17.3285 1.20344L16.4448 0.319749C16.0185 -0.106583 15.3248 -0.106583 14.8984 0.319749L7.82915 7.38907C7.76373 7.45449 7.71914 7.53782 7.70096 7.62854L7.2591 9.83772C7.22839 9.99137 7.27647 10.1502 7.38729 10.261C7.47605 10.3498 7.59561 10.3983 7.71864 10.3983C7.74923 10.3983 7.77997 10.3953 7.81053 10.3892L10.0197 9.94732C10.1104 9.92917 10.1938 9.88455 10.2592 9.81913L17.3285 2.74984C17.3285 2.74984 17.3286 2.74984 17.3286 2.74981C17.7549 2.32351 17.7549 1.6298 17.3285 1.20344ZM9.69678 9.05607L8.31606 9.33225L8.59224 7.95153L14.3461 2.19754L15.4507 3.30214L9.69678 9.05607ZM16.6658 2.0871L16.1135 2.6394L15.0089 1.53479L15.5612 0.982524C15.6221 0.921601 15.7212 0.92157 15.7821 0.982493L16.6658 1.86618C16.7267 1.92707 16.7267 2.0262 16.6658 2.0871Z" fill="black" />
                          </svg>
                        </div>
                        <textarea 
                          className="form-control" 
                          name="content" 
                          placeholder="Share your thoughts..." 
                          aria-label="Comment" 
                          required
                          rows={4}
                        ></textarea>
                      </div>
                    </div>
                    {fetcher.data?.error && (
                      <div className="col-12">
                        <div className="alert alert-danger" role="alert">
                          {fetcher.data.error}
                        </div>
                      </div>
                    )}
                    <div className="col-12">
                      <button 
                        type="submit" 
                        className="btn btn-dark rounded-8 gap-2 button-effect-1"
                        disabled={fetcher.state === "submitting"}
                      >
                        {fetcher.state === "submitting" ? "Submitting..." : "Submit comment"}
                        <svg className=" ms-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                          <path className="stroke-white" d="M21.1059 12.2562H0.5V11.7443H21.1059H22.313L21.4594 10.8907L17.0558 6.48705L17.4177 6.12508L23.2929 12.0002L17.4177 17.8754L17.0558 17.5134L21.4594 13.1098L22.313 12.2562H21.1059Z" stroke="white" />
                        </svg>
                      </button>
                    </div>
                  </fetcher.Form>
                ) : (
                  <div className="alert alert-info">
                    Please <Link to="/login" className="alert-link">sign in</Link> to leave a comment.
                  </div>
                )}

                {/* Comments */}
                <h4 className="mt-5 mb-2 pt-3 wow img-custom-anim-top">Comments ({comments?.length || 0})</h4>
                {comments && comments.length > 0 ? (
                  comments.map((comment: any) => (
                    <div key={comment.id} className="d-flex flex-wrap flex-lg-nowrap gap-4 align-items-start pt-4 border-top wow img-custom-anim-top">
                      <div className="icon-shape bg-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                          <path d="M10 10C12.3013 10 14.1667 8.13452 14.1667 5.83333C14.1667 3.53215 12.3013 1.66667 10 1.66667C7.69883 1.66667 5.83335 3.53215 5.83335 5.83333C5.83335 8.13452 7.69883 10 10 10Z" fill="white" />
                          <path d="M10 12.0833C5.66252 12.0833 2.08335 15.6625 2.08335 20H3.33335C3.33335 16.3529 6.35291 13.3333 10 13.3333C13.6471 13.3333 16.6667 16.3529 16.6667 20H17.9167C17.9167 15.6625 14.3375 12.0833 10 12.0833Z" fill="white" />
                        </svg>
                      </div>
                      <div className="flex-grow-1">
                        <div className="d-flex flex-wrap gap-2 align-items-center">
                          <h6 className="mb-0 fs-6 text-900">{comment.profiles?.full_name || 'Anonymous'}</h6>
                          <span className="mb-0 fs-6 text-500">{formatDate(comment.created_at)}</span>
                        </div>
                        <p className="py-3 m-0 text-500">{comment.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted pt-4 border-top">No comments yet. Be the first to share your thoughts!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="related-post sec-padding bg-white">
          <div className="container">
            <div className="row g-4">
              <div className="col-12">
                <h5 className="mb-0">Recommended for You</h5>
              </div>
              {relatedPosts.map((relatedPost) => (
                <div key={relatedPost.id} className="col-md-6 col-lg-3">
                  <Card5 post={relatedPost} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Custom CSS for post content */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .post-content {
            font-size: 1.1rem;
            line-height: 1.8;
            color: #333;
          }
          .post-content h3,
          .post-content h4,
          .post-content h5 {
            margin: 2rem 0 1rem;
            font-weight: 600;
          }
          .post-content p {
            margin-bottom: 1.5rem;
          }
          .post-content ul,
          .post-content ol {
            margin: 1.5rem 0;
            padding-left: 2rem;
          }
          .post-content li {
            margin-bottom: 0.5rem;
          }
          .post-content blockquote {
            border-left: 4px solid var(--bs-primary);
            padding-left: 1.5rem;
            margin: 2rem 0;
            font-style: italic;
          }
          .post-content img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: 2rem 0;
          }
          .tag-item {
            display: inline-block;
            padding: 0.375rem 1rem;
            background-color: #f8f9fa;
            border-radius: 50px;
            text-decoration: none;
            color: #333;
            font-size: 0.875rem;
            transition: all 0.2s ease;
          }
          .tag-item:hover {
            background-color: #e9ecef;
            transform: translateY(-2px);
          }
          .icon-shape {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 46px;
            height: 46px;
            background-color: #f8f9fa;
            border-radius: 50%;
            transition: all 0.2s ease;
          }
          .icon-shape:hover {
            background-color: #e9ecef;
            transform: translateY(-2px);
          }
          .avatar-xl {
            width: 80px;
            height: 80px;
            object-fit: cover;
          }
          .custom-container-2 {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 15px;
          }
          .block-subscribe {
            padding: 3rem;
            border-radius: 16px;
            position: relative;
            overflow: hidden;
          }
        `
      }} />
    </Layout>
  );
}