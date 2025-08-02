import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { ClientScripts } from "~/components/ClientScripts";
import { getSecurityHeaders } from "~/utils/security.server";

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
  
  // Theme CSS Variables
  { rel: "stylesheet", href: "/css/themes.css" },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const securityHeaders = getSecurityHeaders();
  
  return json({
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    },
  }, {
    headers: {
      ...securityHeaders,
      "Cache-Control": "public, max-age=300"
    }
  });
};

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
        {children}
        
        <ScrollRestoration />
        <Scripts />
        <ClientScripts />
      </body>
    </html>
  );
}

export default function App() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <>
      {/* Pass Supabase config securely via meta tags instead of window.ENV */}
      <div 
        id="root"
        data-supabase-url={data.env.SUPABASE_URL}
        data-supabase-anon-key={data.env.SUPABASE_ANON_KEY}
        style={{ display: 'contents' }}
      >
        <Outlet />
      </div>
    </>
  );
}
