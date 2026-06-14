import { Link, useLocation } from "react-router-dom";

const SiteHeader = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-foreground text-primary-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl tracking-wide hover:opacity-80 transition-opacity">
          M Salman Tahir
        </Link>
        <nav className="flex gap-6 font-sans text-xs sm:text-sm tracking-[0.2em] uppercase text-primary-foreground/60">
          <Link
            to="/"
            className={`hover:text-primary-foreground transition-colors ${isActive("/") ? "text-primary-foreground" : ""}`}
          >
            Home
          </Link>
          <Link
            to="/blog"
            className={`hover:text-primary-foreground transition-colors ${isActive("/blog") || location.pathname.startsWith("/blog/") ? "text-primary-foreground" : ""}`}
          >
            Blog
          </Link>
          <Link
            to="/about"
            className={`hover:text-primary-foreground transition-colors ${isActive("/about") ? "text-primary-foreground" : ""}`}
          >
            About
          </Link>
          <a
            href="/#contact"
            className="hover:text-primary-foreground transition-colors"
          >
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
};

export default SiteHeader;
