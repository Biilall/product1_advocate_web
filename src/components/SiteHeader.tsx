import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Phone } from "lucide-react";

const SiteHeader = () => {
  const location = useLocation();
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const isServicesActive = location.pathname.startsWith("/services/");

  useEffect(() => {
    setMobileMenuOpen(false);
    setMobileServicesOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const serviceLinks = [
    { to: "/services/criminal-defense", label: "Criminal Defense" },
    { to: "/services/civil-litigation", label: "Civil Litigation" },
    { to: "/services/family-law", label: "Family Law" },
    { to: "/services/corporate-law", label: "Corporate & Banking Law" },
    { to: "/services/intellectual-property", label: "Intellectual Property" },
  ];

  return (
    <header className={`sticky top-0 z-50 bg-foreground text-primary-foreground transition-shadow duration-300 ${scrolled ? "shadow-lg" : ""}`}>
      {/* Top bar with phone */}
      <div className="border-b border-primary-foreground/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between">
          <a
            href="tel:+923006829799"
            className="flex items-center gap-1.5 font-sans text-xs text-primary-foreground/60 hover:text-primary-foreground transition-colors"
          >
            <Phone size={12} />
            +92 300 6829799
          </a>
          <div className="flex gap-3">
            <a href="https://www.facebook.com/SalmanTahirAdvocate" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-primary-foreground/40 hover:text-primary-foreground transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://www.linkedin.com/in/m-salman-tahir" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-primary-foreground/40 hover:text-primary-foreground transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </a>
            <a href="https://www.instagram.com/salmantahir_advocate" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-primary-foreground/40 hover:text-primary-foreground transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-xl tracking-wide hover:opacity-80 transition-opacity">
          M Salman Tahir
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6 font-sans text-xs sm:text-sm tracking-[0.2em] uppercase text-primary-foreground/60">
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
              className={`hover:text-primary-foreground transition-colors flex items-center gap-1 ${isServicesActive ? "text-primary-foreground" : ""}`}
            >
              Services <ChevronDown size={12} />
            </button>
            {servicesOpen && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-foreground border border-primary-foreground/20 rounded shadow-lg py-2 z-50">
                {serviceLinks.map((s) => (
                  <Link key={s.to} to={s.to} className="block px-4 py-2 text-xs tracking-[0.15em] hover:bg-primary-foreground/10 transition-colors">{s.label}</Link>
                ))}
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
          <Link
            to="/reviews"
            className={`hover:text-primary-foreground transition-colors ${isActive("/reviews") ? "text-primary-foreground" : ""}`}
          >
            Reviews
          </Link>
          <a
            href="/#contact"
            className="hover:text-primary-foreground transition-colors"
          >
            Contact
          </a>
        </nav>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-primary-foreground/70 hover:text-primary-foreground transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-primary-foreground/10 bg-foreground">
          <nav className="max-w-5xl mx-auto px-4 py-4 space-y-1 font-sans text-sm tracking-[0.15em] uppercase">
            <Link to="/" className={`block py-2.5 px-3 rounded hover:bg-primary-foreground/10 transition-colors ${isActive("/") ? "text-primary-foreground bg-primary-foreground/5" : "text-primary-foreground/70"}`}>
              Home
            </Link>
            <div>
              <button
                onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                className={`w-full flex items-center justify-between py-2.5 px-3 rounded hover:bg-primary-foreground/10 transition-colors ${isServicesActive ? "text-primary-foreground bg-primary-foreground/5" : "text-primary-foreground/70"}`}
              >
                Services
                <ChevronDown size={14} className={`transition-transform ${mobileServicesOpen ? "rotate-180" : ""}`} />
              </button>
              {mobileServicesOpen && (
                <div className="pl-4 space-y-0.5 mt-1">
                  {serviceLinks.map((s) => (
                    <Link key={s.to} to={s.to} className="block py-2 px-3 text-xs tracking-[0.12em] text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded transition-colors">{s.label}</Link>
                  ))}
                </div>
              )}
            </div>
            <Link to="/blog" className={`block py-2.5 px-3 rounded hover:bg-primary-foreground/10 transition-colors ${isActive("/blog") || location.pathname.startsWith("/blog/") ? "text-primary-foreground bg-primary-foreground/5" : "text-primary-foreground/70"}`}>
              Blog
            </Link>
            <Link to="/about" className={`block py-2.5 px-3 rounded hover:bg-primary-foreground/10 transition-colors ${isActive("/about") ? "text-primary-foreground bg-primary-foreground/5" : "text-primary-foreground/70"}`}>
              About
            </Link>
            <Link to="/reviews" className={`block py-2.5 px-3 rounded hover:bg-primary-foreground/10 transition-colors ${isActive("/reviews") ? "text-primary-foreground bg-primary-foreground/5" : "text-primary-foreground/70"}`}>
              Reviews
            </Link>
            <a href="/#contact" className="block py-2.5 px-3 rounded text-primary-foreground/70 hover:bg-primary-foreground/10 transition-colors">
              Contact
            </a>
            <div className="pt-3 border-t border-primary-foreground/10 mt-2">
              <a
                href="https://wa.me/923006829799"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded text-xs tracking-wider uppercase transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp Consultation
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default SiteHeader;
