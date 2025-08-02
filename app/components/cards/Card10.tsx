import { Link } from "@remix-run/react";
import type { PostWithSubdomain } from "~/types/database";

interface Card10Props {
  post: PostWithSubdomain;
  style?: 1 | 2; // style-1 or style-2
}

export function Card10({ post, style = 1 }: Card10Props) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const readingTime = Math.ceil((post.content?.length || 0) / 1000) || 6; // Estimate reading time

  return (
    <div className={`article card-10 style-${style}`}>
      <div className="hover-effect-1">
        <Link to={`/${post.subdomain?.name || 'blog'}/${post.slug}`} className="card-img">
          <img 
            className="w-100" 
            src={post.featured_image_url || "/imgs/other/img-other-1.png"} 
            alt={post.featured_image_alt || post.title}
            loading="lazy"
          />
        </Link>
      </div>
      <div className="card-body">
        <Link to={`/${post.subdomain?.name || 'blog'}/${post.slug}`}>
          <h6 className="fs-7 mb-2 text-truncate-2">{post.title}</h6>
        </Link>
        <div className="d-flex align-items-center text-600">
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