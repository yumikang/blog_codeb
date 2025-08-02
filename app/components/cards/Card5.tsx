import { Link } from "@remix-run/react";
import type { PostWithSubdomain } from "~/types/database";

interface Card5Props {
  post: PostWithSubdomain;
}

export function Card5({ post }: Card5Props) {
  return (
    <div className="article card-5">
      <div className="post-link">
        <div className="hover-effect-1">
          <div className="position-relative card-img-top thumbnail">
            <Link to={`/${post.subdomain?.name || 'blog'}/${post.slug}`}>
              <img 
                src={post.featured_image_url || "/imgs/other/img-other-9.png"} 
                alt={post.featured_image_alt || post.title} 
                className="cover-image"
                loading="lazy"
              />
            </Link>
            {post.subdomain && (
              <Link 
                to={`/categories/${post.subdomain.name}`} 
                className={`badge bg-${post.subdomain.theme_color || '1'} fs-8`}
              >
                {post.subdomain.display_name || post.subdomain.name}
              </Link>
            )}
          </div>
        </div>
        <div className="card-corner white no-border">
          <Link to={`/${post.subdomain?.name || 'blog'}/${post.slug}`} className="arrow-box">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M13.75 6.75L19.25 12L13.75 17.25" stroke="#0E0E0F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M19 12H4.75" stroke="#0E0E0F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <div className="curve-one"></div>
          <div className="curve-two"></div>
        </div>
      </div>
      <div className="card-body mt-4">
        <Link to={`/${post.subdomain?.name || 'blog'}/${post.slug}`} className="hover-underline">
          <h6 className="card-title mb-0">{post.title}</h6>
        </Link>
      </div>
    </div>
  );
}