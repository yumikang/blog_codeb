import { useRouteError, isRouteErrorResponse, Link } from "@remix-run/react";

/**
 * Generic Error Boundary component for handling route errors
 * Handles different types of errors including 404, 500, and other HTTP errors
 */
export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    // Handle HTTP errors (404, 500, etc.)
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center">
            <div className="error-container">
              <h1 className="display-1 text-muted">{error.status}</h1>
              
              {error.status === 404 ? (
                <>
                  <h2 className="h4 mb-3">Page Not Found</h2>
                  <p className="text-muted mb-4">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                  </p>
                  <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                    <Link to="/" className="btn btn-primary">
                      Go Home
                    </Link>
                    <Link to="/latest" className="btn btn-outline-primary">
                      Latest News
                    </Link>
                  </div>
                </>
              ) : error.status === 500 ? (
                <>
                  <h2 className="h4 mb-3">Server Error</h2>
                  <p className="text-muted mb-4">
                    Something went wrong on our end. Please try again later.
                  </p>
                  <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                    <button 
                      onClick={() => window.location.reload()} 
                      className="btn btn-primary"
                    >
                      Try Again
                    </button>
                    <Link to="/" className="btn btn-outline-primary">
                      Go Home
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="h4 mb-3">Something went wrong</h2>
                  <p className="text-muted mb-4">
                    {error.statusText || error.data || 'An unexpected error occurred'}
                  </p>
                  <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
                    <Link to="/" className="btn btn-primary">
                      Go Home
                    </Link>
                    <button 
                      onClick={() => window.history.back()} 
                      className="btn btn-outline-primary"
                    >
                      Go Back
                    </button>
                  </div>
                </>
              )}\n            </div>\n          </div>\n        </div>\n      </div>
    );
  }

  // Handle JavaScript errors
  const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
  
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 text-center">
          <div className="error-container">
            <div className="display-1 text-danger mb-3">⚠️</div>
            <h2 className="h4 mb-3">Application Error</h2>
            <p className="text-muted mb-4">
              An unexpected error occurred while loading this page.
            </p>
            
            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && (
              <details className="mb-4 text-start">
                <summary className="btn btn-outline-secondary btn-sm mb-2">
                  Show Error Details
                </summary>
                <pre className="bg-light p-3 rounded small text-wrap">
                  {errorMessage}
                  {error instanceof Error && error.stack && (
                    <>
                      \n\nStack trace:\n{error.stack}
                    </>
                  )}
                </pre>
              </details>
            )}
            
            <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
              <button 
                onClick={() => window.location.reload()} 
                className="btn btn-primary"
              >
                Reload Page
              </button>
              <Link to="/" className="btn btn-outline-primary">
                Go Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Loading component for showing loading states
 */
export function LoadingSpinner({ 
  message = "Loading...", 
  size = "default" 
}: { 
  message?: string; 
  size?: "small" | "default" | "large"; 
}) {
  const sizeClasses = {
    small: "spinner-border-sm",
    default: "",
    large: "fs-4"
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div className={`spinner-border text-primary mb-3 ${sizeClasses[size]}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted mb-0">{message}</p>
    </div>
  );
}

/**
 * Environment setup warning component
 */
export function EnvironmentWarning({ error }: { error?: string }) {
  return (
    <div className="alert alert-warning" role="alert">
      <div className="d-flex align-items-start">
        <div className="flex-shrink-0 me-3">
          <span className="fs-4">⚙️</span>
        </div>
        <div className="flex-grow-1">
          <h4 className="alert-heading">Environment Setup Required</h4>
          <p className="mb-2">
            {error || 'Please configure your Supabase environment variables to load dynamic content.'}
          </p>
          <hr />
          <div className="mb-0">
            <p className="mb-2"><strong>Quick Setup:</strong></p>
            <ol className="mb-2 ps-3">
              <li>Create a <code>.env</code> file in the project root</li>
              <li>Add your Supabase credentials:</li>
            </ol>
            <pre className="bg-light p-2 rounded small">
SUPABASE_URL=&quot;https://your-project.supabase.co&quot;
SUPABASE_ANON_KEY=&quot;your_anon_key&quot;
SUPABASE_SERVICE_ROLE_KEY=&quot;your_service_role_key&quot;
            </pre>
            <small className="text-muted">
              You can find these values in your{' '}
              <a 
                href="https://supabase.com/dashboard" 
                target="_blank" 
                rel="noopener noreferrer"
                className="alert-link"
              >
                Supabase dashboard
              </a>
              {' '}under Project Settings → API.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state component for when no data is available
 */
export function EmptyState({ 
  icon = "📝", 
  title = "No data available", 
  description = "There's nothing to show here yet.",
  actionButton
}: {
  icon?: string;
  title?: string;
  description?: string;
  actionButton?: React.ReactNode;
}) {
  return (
    <div className="text-center py-5">
      <div className="display-1 text-muted mb-3">{icon}</div>
      <h3 className="text-muted mb-2">{title}</h3>
      <p className="text-muted mb-4">{description}</p>
      {actionButton && (
        <div className="mt-3">
          {actionButton}
        </div>
      )}
    </div>
  );
}