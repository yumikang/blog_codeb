import { Link } from "@remix-run/react";
import type { PostWithSubdomain } from "~/types/database";

interface Card1Props {
  post: PostWithSubdomain;
}

export function Card1({ post }: Card1Props) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const readingTime = Math.ceil((post.content?.length || 0) / 1000) || 5; // Estimate reading time

  return (
    <div className="article card-1">
      <div className="hover-effect-1">
        <Link to={`/${post.subdomain?.name || 'blog'}/${post.slug}`} className="card-img-top">
          <img 
            src={post.featured_image_url || "/imgs/page/img-1.png"} 
            className="w-100 h-100 lazyloaded" 
            alt={post.featured_image_alt || post.title}
            loading="lazy"
          />
        </Link>
      </div>
      <div className="card-body hover-up">
        <div className="card-corner">
          <Link to={`/${post.subdomain?.name || 'blog'}/${post.slug}`} className="arrow-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M13.75 6.75L19.25 12L13.75 17.25" stroke="#0E0E0F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 12H4.75" stroke="#0E0E0F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="curve-one"></div>
          <div className="curve-two"></div>
        </div>
        {post.subdomain && (
          <Link 
            to={`/categories/${post.subdomain.name}`} 
            className={`badge bg-${post.subdomain.theme_color || 'primary'} mb-1 fs-8`}
          >
            {post.subdomain.display_name || post.subdomain.name}
          </Link>
        )}
        <Link to={`/${post.subdomain?.name || 'blog'}/${post.slug}`}>
          <h4 className="card-title hover-underline">
            {post.title}
          </h4>
        </Link>
        {post.excerpt && (
          <p className="text-600">
            {post.excerpt}
          </p>
        )}
        <div className="d-flex align-items-center justify-content-between text-600">
          <div className="d-flex align-items-center">
            <img 
              src="/imgs/template/author/author-1.png" 
              className="avatar-xs circle object-fit-cover" 
              alt="Author"
              loading="lazy"
            />
            <p className="fs-8 ps-2 m-0">Admin</p>
          </div>
          <span className="fs-8">{formatDate(post.published_at)}</span>
          <ul className="ps-4 m-0">
            <li>
              <span className="fs-8">{readingTime} mins read</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}