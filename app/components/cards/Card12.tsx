import { Link } from "@remix-run/react";
import type { PostWithSubdomain } from "~/types/database";

interface Card12Props {
  post: PostWithSubdomain;
}

export function Card12({ post }: Card12Props) {
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
    <div className="article card-12 d-flex flex-md-row align-items-stretch flex-column">
      <Link to={`/${post.subdomain?.name || 'blog'}/${post.slug}`} className="card-img-top hover-effect-30 rounded-16 overflow-hidden">
        <img 
          src={post.featured_image_url || "/imgs/page/img-66.png"} 
          alt={post.featured_image_alt || post.title} 
          className="cover-image"
          loading="lazy"
        />
      </Link>
      <div className="card-body">
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

        <div className="left">
          <div className="mb-2">
            {post.subdomain && (
              <Link 
                to={`/categories/${post.subdomain.name}`} 
                className={`badge bg-${post.subdomain.theme_color || '2'} fs-8`}
              >
                {post.subdomain.display_name || post.subdomain.name}
              </Link>
            )}
          </div>
          <Link to={`/${post.subdomain?.name || 'blog'}/${post.slug}`} className="hover-underline">
            <h4 className="card-title mb-0 mt-3">{post.title}</h4>
          </Link>
          <p className="card-text text-600 fs-7 mb-0 mt-3 text-truncate-3">
            {post.excerpt || post.content?.substring(0, 250) + '...'}
          </p>
          <div className="bottom mt-auto d-flex flex-wrap align-items-center gap-2 pt-5">
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
            <div className="ms-lg-auto ms-5 d-flex align-items-center gap-3 me-5">
              <a href="#" className="comment fs-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M2.50018 5.43423C2.50018 4.26961 3.44494 3.3255 4.61035 3.3255H15.39C16.5554 3.3255 17.5002 4.26961 17.5002 5.43422V13.1078C17.5002 14.2724 16.5554 15.2165 15.39 15.2165H6.3295L3.41902 17.3786C3.24443 17.5083 3.01159 17.5285 2.81722 17.4309C2.62285 17.3333 2.50018 17.1345 2.50018 16.9171V5.43423ZM4.61035 4.47571C4.08062 4.47571 3.65118 4.90485 3.65118 5.43423V15.7729L5.79569 14.1799C5.89495 14.1062 6.01534 14.0663 6.13902 14.0663H15.39C15.9197 14.0663 16.3492 13.6372 16.3492 13.1078V5.43422C16.3492 4.90485 15.9197 4.47571 15.39 4.47571H4.61035Z" fill="#626568" />
                </svg>
                <span className="odometer text-nowrap" data-count="98"></span>
              </a>
              <a href="#" className="readers fs-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M17.186 10.3224C15.734 13.039 12.9803 14.7266 10.001 14.7266C7.01977 14.7266 4.26612 13.039 2.81407 10.3224C2.70224 10.1114 2.70224 9.88843 2.81407 9.67767C4.26612 6.96107 7.01977 5.27366 10.001 5.27366C12.9803 5.27366 15.7339 6.96107 17.186 9.67767C17.2998 9.88843 17.2998 10.1114 17.186 10.3224ZM18.1135 9.13905C16.4744 6.07185 13.366 4.16669 10.001 4.16669C6.63409 4.16669 3.52561 6.07185 1.88652 9.13905C1.59341 9.68631 1.59341 10.3137 1.88652 10.8606C3.52561 13.9278 6.63409 15.8334 10.001 15.8334C13.366 15.8334 16.4744 13.9278 18.1135 10.8606C18.4066 10.3138 18.4066 9.68631 18.1135 9.13905ZM10.001 12.2707C11.2024 12.2707 12.18 11.2522 12.18 9.99993C12.18 8.7477 11.2024 7.72912 10.001 7.72912C8.79769 7.72912 7.82002 8.7477 7.82002 9.99993C7.82002 11.2522 8.79773 12.2707 10.001 12.2707ZM10.001 6.62215C8.21147 6.62215 6.75752 8.13757 6.75752 9.99997C6.75752 11.8628 8.21151 13.3776 10.001 13.3776C11.7886 13.3776 13.2425 11.8627 13.2425 9.99997C13.2425 8.13757 11.7886 6.62215 10.001 6.62215Z" fill="#626568" />
                </svg>
                <span className="odometer text-nowrap" data-count="162"></span>
              </a>
            </div>
          </div>
        </div>
        <div className="right">
          <a href="#" className="book-mark">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M5.625 5.62498C5.625 4.7045 6.37119 3.95831 7.29167 3.95831H12.7083C13.6288 3.95831 14.375 4.7045 14.375 5.62498V16.0416L10 12.2916L5.625 16.0416V5.62498Z" stroke="#626568" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}