import { useEffect } from "react";
import { useLocation } from "@remix-run/react";
import Header from "./Header";
import Footer from "./Footer";
import { LayoutProps } from "~/types/layout";

export default function Layout({ children, className = "" }: LayoutProps) {
  const location = useLocation();

  useEffect(() => {
    // Extract subdomain from the pathname
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const subdomain = pathSegments[0];
    
    // Remove all theme classes
    const themes = ['tech', 'food', 'travel', 'lifestyle', 'business', 'health', 'sports', 'entertainment', 'science', 'education'];
    themes.forEach(theme => document.body.classList.remove(`theme-${theme}`));
    
    // Apply appropriate theme class based on subdomain
    if (subdomain && themes.includes(subdomain)) {
      document.body.classList.add(`theme-${subdomain}`);
    }
  }, [location.pathname]);

  return (
    <div className={`layout-wrapper ${className}`}>
      <Header />
      
      <main className="main-content">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}