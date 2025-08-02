import { Link, useSearchParams } from "@remix-run/react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl = "" }: PaginationProps) {
  const [searchParams] = useSearchParams();
  
  // Helper function to get URL with page parameter
  const getPaginationUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl || '/';
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const maxVisible = 5;
    const pages: number[] = [];
    
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

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="d-flex justify-content-center mt-5">
      <nav aria-label="Pagination">
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
  );
}