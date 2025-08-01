import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";

export const links: LinksFunction = () => [
  // Favicon
  { 
    rel: "shortcut icon", 
    type: "image/x-icon", 
    href: "/imgs/template/logo/favicon.svg" 
  },
  
  // Vendor CSS
  { rel: "stylesheet", href: "/css/vendors/bootstrap-grid.min.css" },
  { rel: "stylesheet", href: "/css/vendors/swiper-bundle.min.css" },
  { rel: "stylesheet", href: "/css/vendors/aos.css" },
  { rel: "stylesheet", href: "/css/vendors/magnific-popup.css" },
  { rel: "stylesheet", href: "/css/vendors/carouselTicker.css" },
  { rel: "stylesheet", href: "/css/vendors/odometer.css" },
  
  // Main CSS (다크모드 관련 코드는 제거하고 라이트모드 전용으로 사용)
  { rel: "stylesheet", href: "/css/main.css" },
  
  // Custom Light Mode CSS
  { rel: "stylesheet", href: "/css/custom-light-mode.css" },
  
  // Custom Homepage CSS
  { rel: "stylesheet", href: "/assets/css/custom-homepage.css" },
  
  // Custom Pages CSS
  { rel: "stylesheet", href: "/css/custom-pages.css" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="x-ua-compatible" content="ie=edge" />
        <Meta />
        <Links />
      </head>
      <body>
        {/* Preloader */}
        <div id="preloader">
          <div id="loader" className="loader">
            <div className="loader-container">
              <div className="loader-icon">
                <img src="/imgs/template/logo/logo-gradient.svg" alt="Preloader" />
              </div>
            </div>
          </div>
        </div>
        
        {children}
        
        {/* JavaScript Libraries */}
        <script src="/js/vendors/jquery-3.7.1.min.js"></script>
        <script src="/js/vendors/swiper-bundle.min.js"></script>
        <script src="/js/vendors/aos.js"></script>
        <script src="/js/vendors/jquery.magnific-popup.min.js"></script>
        <script src="/js/vendors/jquery.carouselTicker.min.js"></script>
        <script src="/js/vendors/jquery.odometer.min.js"></script>
        <script src="/js/vendors/jquery.appear.js"></script>
        <script src="/js/vendors/gsap.min.js"></script>
        <script src="/js/vendors/ScrollTrigger.min.js"></script>
        <script src="/js/vendors/ScrollToPlugin.min.js"></script>
        <script src="/js/vendors/Splitetext.js"></script>
        <script src="/js/vendors/howler.min.js"></script>
        <script src="/js/vendors/headhesive.min.js"></script>
        <script src="/js/vendors/smart-stick-nav.js"></script>
        <script src="/js/vendors/image-hover-effects.js"></script>
        <script src="/js/vendors/wow.min.js"></script>
        {/* 다크모드 관련 스크립트 제외: color-modes.js */}
        <script src="/js/gsap-custom.js"></script>
        <script src="/js/main.js"></script>
        
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}
