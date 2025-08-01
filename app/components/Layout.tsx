import Header from "./Header";
import Footer from "./Footer";
import { LayoutProps } from "~/types/layout";

export default function Layout({ children, className = "" }: LayoutProps) {
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