import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const SiteHeader = () => {
  const location = useLocation();
  const [servicesOpen, setServicesOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isServicesActive = location.pathname.startsWith("/services/");

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
          <div
            className="relative"
            onMouseEnter={() => setServicesOpen(true)}
            onMouseLeave={() => setServicesOpen(false)}
          >
            <button
              className={`hover:text-primary-foreground transition-colors ${isServicesActive ? "text-primary-foreground" : ""}`}
            >
              Services
            </button>
            {servicesOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-foreground border border-primary-foreground/20 rounded shadow-lg py-2 z-50">
                <Link to="/services/criminal-defense" className="block px-4 py-2 text-xs tracking-[0.15em] hover:bg-primary-foreground/10 transition-colors">Criminal Defense</Link>
                <Link to="/services/civil-litigation" className="block px-4 py-2 text-xs tracking-[0.15em] hover:bg-primary-foreground/10 transition-colors">Civil Litigation</Link>
                <Link to="/services/family-law" className="block px-4 py-2 text-xs tracking-[0.15em] hover:bg-primary-foreground/10 transition-colors">Family Law</Link>
                <Link to="/services/corporate-law" className="block px-4 py-2 text-xs tracking-[0.15em] hover:bg-primary-foreground/10 transition-colors">Corporate & Banking Law</Link>
                <Link to="/services/intellectual-property" className="block px-4 py-2 text-xs tracking-[0.15em] hover:bg-primary-foreground/10 transition-colors">Intellectual Property</Link>
              </div>
            )}
          </div>
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
