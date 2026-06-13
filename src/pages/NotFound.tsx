import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <div className="flex flex-1 items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-serif font-bold">404</h1>
          <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
          <a href="/" className="font-sans text-sm text-muted-foreground border-b border-border hover:border-foreground transition-colors">
            Return to Home
          </a>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
};

export default NotFound;
