import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Landmark } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const CorporateLaw = () => {
  useEffect(() => {
    document.title = "Corporate & Banking Lawyer Lahore — Commercial Disputes | M Salman Tahir";
  }, []);

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <Landmark size={28} className="text-muted-foreground" />
          <h1 className="text-3xl md:text-4xl font-serif">Corporate & Banking Law</h1>
        </div>
        <p className="font-sans text-lg text-foreground/70 mb-10">
          Legal counsel for businesses, banks, and financial institutions in Lahore and across Punjab.
        </p>

        <div className="prose prose-neutral max-w-none font-sans text-foreground/80 space-y-8">
          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Corporate Legal Services</h2>
            <p className="leading-relaxed">
              M Salman Tahir provides comprehensive corporate and banking legal services to businesses of all sizes.
              From company incorporation to complex commercial disputes, Mr. Tahir's decade-long practice covers the
              full spectrum of corporate law under the Companies Act 2017, the Partnership Act 1932, and the
              Financial Institutions (Recovery of Finances) Ordinance 2001.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Areas of Corporate Practice</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {[
                "Banking & Financial Litigation — Recovery suits, NI Act matters",
                "Commercial Contract Disputes — Breach, enforcement, injunctions",
                "Company Formation & Registration — SECP filings, MOA/AOA drafting",
                "Regulatory Compliance — SBP, SECP, competition law",
                "Partnership Disputes — Dissolution, accounting, exit disputes",
                "Debt Recovery — Negotiable Instruments Act, banking courts",
                "Joint Ventures & Shareholder Agreements",
                "Due Diligence & Corporate Advisory",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground mt-1 shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Banking Court Litigation</h2>
            <p className="leading-relaxed">
              Banking disputes in Pakistan are handled by specialized Banking Courts established under the
              Financial Institutions (Recovery of Finances) Ordinance 2001. These courts deal with loan
              defaults, guarantee enforcement, mortgage foreclosure, and related financial disputes.
            </p>
            <p className="leading-relaxed mt-3">
              Whether you are a financial institution seeking recovery or a borrower defending against
              a claim, M Salman Tahir has extensive experience appearing before Banking Courts in Lahore.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Why Businesses Choose Us</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {[
                { title: "Retained Since 2019", desc: "Multiple businesses retain us as their standing legal counsel" },
                { title: "Practical Advice", desc: "Business-oriented solutions, not just legal theory" },
                { title: "Contract Expertise", desc: "Hundreds of commercial contracts drafted and reviewed" },
                { title: "Court & Arbitration", desc: "Representation before civil courts, banking courts, and arbitration tribunals" },
              ].map((item) => (
                <div key={item.title} className="border border-border rounded-lg p-4">
                  <h3 className="font-serif text-base mb-1">{item.title}</h3>
                  <p className="text-sm text-foreground/60">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-serif text-foreground mb-3">Corporate Legal Consultation</h2>
            <p className="leading-relaxed mb-4">
              Need legal counsel for your business? Contact M Salman Tahir for a consultation on corporate, banking, or commercial law matters.
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

export default CorporateLaw;
