import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Building } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const CivilLitigation = () => {
  useEffect(() => {
    document.title = "Civil Litigation Lawyer Lahore — Property Disputes, Contract Cases | M Salman Tahir";
  }, []);

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <Building size={28} className="text-muted-foreground" />
          <h1 className="text-3xl md:text-4xl font-serif">Civil Litigation</h1>
        </div>
        <p className="font-sans text-lg text-foreground/70 mb-10">
          Strategic civil litigation before District Courts, Civil Courts, and the Lahore High Court.
        </p>

        <div className="prose prose-neutral max-w-none font-sans text-foreground/80 space-y-8">
          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Civil Law Practice in Lahore</h2>
            <p className="leading-relaxed">
              Civil disputes in Pakistan — whether involving property, contracts, or constitutional rights — require
              meticulous legal strategy and deep knowledge of the Civil Procedure Code (CPC) and relevant special laws.
              M Salman Tahir brings over a decade of courtroom experience in civil litigation across Punjab.
            </p>
            <p className="leading-relaxed mt-3">
              From filing declaratory suits under Section 42 of the Specific Relief Act to constitutional petitions
              under Article 199 of the Constitution, Mr. Tahir provides comprehensive civil law representation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Types of Civil Cases We Handle</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {[
                "Property & Land Disputes — Title, possession, partition",
                "Contract Disputes — Breach, specific performance, injunctions",
                "Constitutional Petitions — Article 199 writ jurisdiction",
                "Declaratory & Injunctive Suits — Section 42 SRA",
                "Recovery Suits — Money, rent, and damages recovery",
                "Succession & Inheritance — Succession certificates, estate division",
                "Landlord-Tenant Disputes — Eviction, rent controller matters",
                "Civil Appeals & Revisions",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground mt-1 shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Property Disputes in Pakistan</h2>
            <p className="leading-relaxed">
              Property disputes are among the most common civil matters in Lahore. Whether it's a dispute over
              ownership, possession, or boundaries, having an experienced property lawyer is essential. Common
              property cases include:
            </p>
            <ul className="space-y-2 text-sm mt-3">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1 shrink-0">•</span>
                <span><strong>Mutation disputes:</strong> Challenging or defending revenue record entries (intiqal) before Revenue Courts.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1 shrink-0">•</span>
                <span><strong>Possession suits:</strong> Recovery of possession under Section 8 and 9 of the Specific Relief Act.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1 shrink-0">•</span>
                <span><strong>Partition suits:</strong> Division of jointly-owned property among co-owners or heirs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1 shrink-0">•</span>
                <span><strong>Fraudulent transfers:</strong> Challenging illegal sale, gift, or mortgage of property.</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Our Approach to Civil Litigation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {[
                { title: "Thorough Documentation", desc: "Complete review of title deeds, agreements, and relevant records before filing" },
                { title: "Strategic Filing", desc: "Choosing the right forum, jurisdiction, and cause of action for optimal results" },
                { title: "Negotiation First", desc: "Exploring settlement and mediation before costly litigation where appropriate" },
                { title: "Aggressive Advocacy", desc: "Vigorous representation when a case must be fought in court" },
              ].map((item) => (
                <div key={item.title} className="border border-border rounded-lg p-4">
                  <h3 className="font-serif text-base mb-1">{item.title}</h3>
                  <p className="text-sm text-foreground/60">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Frequently Asked Questions</h2>
            <div className="space-y-6 mt-4">
              {[
                { q: "How do I resolve a property dispute in Lahore?", a: "Property disputes are resolved through Civil Courts by filing a declaratory suit, possession suit, or partition suit. You need a title document, revenue records, and evidence of ownership. An experienced property lawyer can assess your case and file the appropriate suit." },
                { q: "How long does a civil case take in Pakistan?", a: "Simple civil suits may take 1–2 years, while complex property disputes or constitutional petitions can take 3–5 years at the trial level. Appeals before the High Court add more time. Using injunctions and settlement negotiations can expedite resolution." },
                { q: "What is a declaratory suit under Pakistani law?", a: "A declaratory suit under Section 42 of the Specific Relief Act 1877 is filed when a person is entitled to a legal right (e.g., ownership of property) and needs a court declaration to establish that right. It's one of the most common civil suits in Pakistan." },
                { q: "Can I get an injunction to stop someone from selling my property?", a: "Yes. Under Order XXXIX of the CPC, you can apply for a temporary injunction to restrain a party from transferring, alienating, or dealing with disputed property until the case is decided. This is often filed alongside the main suit." },
              ].map((faq) => (
                <div key={faq.q} className="border-l border-border pl-4">
                  <h3 className="font-serif text-base mb-1">{faq.q}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Related Services</h2>
            <div className="flex flex-wrap gap-3 mt-3">
              <Link to="/services/criminal-defense" className="text-sm border border-border rounded px-4 py-2 hover:bg-foreground/5 transition-colors">Criminal Defense</Link>
              <Link to="/services/family-law" className="text-sm border border-border rounded px-4 py-2 hover:bg-foreground/5 transition-colors">Family Law</Link>
              <Link to="/services/corporate-law" className="text-sm border border-border rounded px-4 py-2 hover:bg-foreground/5 transition-colors">Corporate & Banking Law</Link>
            </div>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-serif text-foreground mb-3">Schedule a Consultation</h2>
            <p className="leading-relaxed mb-4">
              Facing a property dispute, contract issue, or need to file a civil suit? Contact M Salman Tahir for expert legal advice.
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

export default CivilLitigation;
