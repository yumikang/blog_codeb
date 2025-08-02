import type { MetaFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useState } from "react";
import Layout from "~/components/Layout";

export const meta: MetaFunction = () => {
  return [
    { title: "Login - Magzin Blog" },
    { name: "description", content: "Sign in to Magzin Blog to comment and interact with the community" },
  ];
};

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const supabaseUrl = process.env.SUPABASE_URL || window.ENV?.SUPABASE_URL;
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || window.ENV?.SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error("Supabase configuration is missing");
      }

      // Dynamically import Supabase client to avoid SSR issues
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      
      if (error) {
        throw error;
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign in with Google');
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container py-5">
        <div className="row">
          <div className="col-lg-6 col-md-8 mx-auto">
            <div className="card shadow-sm">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <h2 className="mb-3">Welcome Back</h2>
                  <p className="text-muted">Sign in to comment and interact with the community</p>
                </div>

                {error && (
                  <div className="alert alert-danger" role="alert">
                    {error}
                  </div>
                )}

                <div className="d-grid gap-3">
                  <button 
                    className="btn btn-outline-dark d-flex align-items-center justify-content-center gap-2 py-3"
                    onClick={handleGoogleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19.6 10.2273C19.6 9.51819 19.5364 8.83637 19.4182 8.18182H10V12.05H15.3818C15.15 13.3 14.4455 14.3591 13.3864 15.0682V17.5773H16.6182C18.5091 15.8364 19.6 13.2727 19.6 10.2273Z" fill="#4285F4"/>
                          <path d="M10 20C12.7 20 14.9636 19.1045 16.6181 17.5773L13.3863 15.0682C12.4909 15.6682 11.3454 16.0227 10 16.0227C7.39542 16.0227 5.19087 14.2636 4.40451 11.9H1.06360V14.4909C2.70905 17.7591 6.09087 20 10 20Z" fill="#34A853"/>
                          <path d="M4.40455 11.9C4.20455 11.3 4.09091 10.6591 4.09091 10C4.09091 9.34091 4.20455 8.7 4.40455 8.1V5.50909H1.06364C0.386364 6.85909 0 8.38636 0 10C0 11.6136 0.386364 13.1409 1.06364 14.4909L4.40455 11.9Z" fill="#FBBC05"/>
                          <path d="M10 3.97727C11.4682 3.97727 12.7864 4.48182 13.8227 5.47273L16.6909 2.60455C14.9591 0.990909 12.6955 0 10 0C6.09087 0 2.70905 2.24091 1.06360 5.50909L4.40451 8.1C5.19087 5.73636 7.39542 3.97727 10 3.97727Z" fill="#EA4335"/>
                        </svg>
                        <span>Continue with Google</span>
                      </>
                    )}
                  </button>

                  <div className="position-relative">
                    <hr className="my-4" />
                    <span className="position-absolute top-50 start-50 translate-middle bg-white px-3 text-muted">
                      or
                    </span>
                  </div>

                  <div className="alert alert-info" role="alert">
                    <small>Email and password login coming soon!</small>
                  </div>
                </div>

                <div className="text-center mt-4">
                  <p className="text-muted mb-0">
                    Don't have an account? 
                    <Link to="/register" className="text-primary ms-1">Sign up</Link>
                  </p>
                </div>

                <div className="text-center mt-3">
                  <Link to="/" className="text-muted text-decoration-none">
                    <small>← Back to home</small>
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center mt-4">
              <p className="text-muted small">
                By signing in, you agree to our{" "}
                <a href="#" className="text-dark">Terms of Service</a> and{" "}
                <a href="#" className="text-dark">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add window.ENV type declaration */}
      <script
        dangerouslySetInnerHTML={{
          __html: `window.ENV = ${JSON.stringify({
            SUPABASE_URL: process.env.SUPABASE_URL,
            SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
          })}`,
        }}
      />
    </Layout>
  );
}