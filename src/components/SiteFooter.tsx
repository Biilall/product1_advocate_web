import { Link } from "react-router-dom";

const SiteFooter = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          <div>
            <h4 className="font-serif text-base mb-3">M Salman Tahir</h4>
            <p className="font-sans text-sm text-primary-foreground/70 leading-relaxed">
              Advocate — High Court of Pakistan.<br />
              Practising since 2016 in criminal and civil law.
            </p>
          </div>
          <div>
            <h4 className="font-serif text-base mb-3">Office</h4>
            <p className="font-sans text-sm text-primary-foreground/70 leading-relaxed">
              Office No. 401, 4th Floor,<br />
              Qureshi Building, Lower Mall Road,<br />
              Lahore, Pakistan
            </p>
            <p className="font-sans text-sm text-primary-foreground/70 mt-2">
              Phone:{" "}
              <a href="tel:+923006829799" className="border-b border-primary-foreground/30 hover:border-primary-foreground transition-colors">
                +92 300 6829799
              </a>
            </p>
          </div>
          <div>
            <h4 className="font-serif text-base mb-3">Links</h4>
            <ul className="space-y-2 font-sans text-sm text-primary-foreground/70">
              <li>
                <Link to="/" className="hover:text-primary-foreground transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-primary-foreground transition-colors">Blog</Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-primary-foreground transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-primary-foreground transition-colors">Return & Refund Policy</Link>
              </li>
              <li>
                <Link to="/terms-and-conditions" className="hover:text-primary-foreground transition-colors">Terms & Conditions</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-8 border-t border-primary-foreground/20">
          <p className="font-sans text-xs text-primary-foreground/50 tracking-wider uppercase">
            © {new Date().getFullYear()} M Salman Tahir — All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
