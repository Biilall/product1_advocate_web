import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Lightbulb } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const IntellectualProperty = () => {
  useEffect(() => {
    document.title = "Intellectual Property Lawyer Lahore — Trademark, Copyright | M Salman Tahir";
  }, []);

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <Lightbulb size={28} className="text-muted-foreground" />
          <h1 className="text-3xl md:text-4xl font-serif">Intellectual Property</h1>
        </div>
        <p className="font-sans text-lg text-foreground/70 mb-10">
          Protect your brand, creative works, and innovations with expert IP legal counsel in Pakistan.
        </p>

        <div className="prose prose-neutral max-w-none font-sans text-foreground/80 space-y-8">
          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">IP Protection in Pakistan</h2>
            <p className="leading-relaxed">
              Intellectual property is one of the most valuable assets for businesses and individuals.
              M Salman Tahir provides comprehensive IP services under the Trade Marks Ordinance 2001,
              the Copyright Ordinance 1962, and the Patents Ordinance 2000, helping clients protect and
              enforce their intellectual property rights in Pakistan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">IP Services We Offer</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {[
                "Trademark Registration — IPO Pakistan filings",
                "Trademark Enforcement — Cease & desist, infringement suits",
                "Copyright Protection — Registration and enforcement",
                "Patent Filing & Advisory",
                "Trade Secret Protection — NDA drafting, enforcement",
                "IP Licensing Agreements",
                "Domain Name Disputes",
                "IP Due Diligence — For mergers, acquisitions, investments",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground mt-1 shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Trademark Registration in Pakistan</h2>
            <p className="leading-relaxed">
              Registering a trademark with the Intellectual Property Organization of Pakistan (IPO) protects
              your brand name, logo, and slogan from unauthorized use. The process involves:
            </p>
            <ol className="space-y-2 text-sm mt-3 list-decimal list-inside">
              <li><strong>Trademark search:</strong> Checking existing registrations to avoid conflicts.</li>
              <li><strong>Application filing:</strong> Filing with IPO Pakistan under the appropriate class.</li>
              <li><strong>Examination:</strong> IPO examines the application for registrability.</li>
              <li><strong>Publication:</strong> The mark is published in the Trademarks Journal for opposition.</li>
              <li><strong>Registration:</strong> If no opposition, the trademark is registered (valid for 10 years, renewable).</li>
            </ol>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-serif text-foreground mb-3">Protect Your Intellectual Property</h2>
            <p className="leading-relaxed mb-4">
              Whether you need to register a trademark, enforce a copyright, or protect trade secrets — get expert legal assistance.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="tel:+923006829799" className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-primary-foreground font-sans text-sm tracking-wider uppercase hover:opacity-90 transition-opacity rounded">
                Call Now
              </a>
              <Link to="/fees" className="inline-flex items-center gap-2 px-6 py-3 border border-border font-sans text-sm tracking-wider uppercase hover:bg-foreground/5 transition-colors rounded">
                View Fees
              </Link>
            </div>
          </section>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
};

export default IntellectualProperty;
