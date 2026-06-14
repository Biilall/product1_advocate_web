import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Scale, BookOpen, Briefcase, Award, MapPin, Phone, Mail } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const About = () => {
  useEffect(() => {
    document.title = "About M Salman Tahir — Advocate, High Court of Pakistan";
  }, []);

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif mb-4">About M Salman Tahir</h1>
        <p className="font-sans text-lg text-foreground/70 mb-12">
          Advocate — High Court of Pakistan | Practising Since 2016
        </p>

        <div className="prose prose-neutral max-w-none font-sans text-foreground/80 space-y-8">
          <section>
            <h2 className="text-xl font-serif text-foreground mb-3 flex items-center gap-2">
              <Scale size={20} className="text-muted-foreground" />
              Professional Background
            </h2>
            <p className="leading-relaxed">
              M Salman Tahir is a seasoned Advocate enrolled with the Lahore High Court of Pakistan,
              with a distinguished practice spanning over a decade since 2016. He provides comprehensive
              legal representation before the District Courts, Sessions Courts, and the Lahore High Court
              across Punjab province.
            </p>
            <p className="leading-relaxed mt-3">
              With an impressive track record of <strong>87% favorable outcomes</strong>, Mr. Tahir has
              built a reputation for thorough case preparation, strategic legal thinking, and unwavering
              dedication to his clients' interests.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3 flex items-center gap-2">
              <BookOpen size={20} className="text-muted-foreground" />
              Areas of Practice
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {[
                "Criminal Defense — Murder, anti-terrorism, narcotics, cybercrime, bail applications",
                "Civil Litigation — Property disputes, contract disputes, constitutional petitions",
                "Family Law — Divorce, khula, custody, maintenance, dower recovery",
                "Corporate & Banking Law — Banking litigation, commercial disputes, company formation",
                "Intellectual Property — Trademark registration, copyright protection, IP enforcement",
                "Document Drafting — Legal notices, contracts, affidavits, power of attorney, wills",
                "Legal Consultation — Case assessments, strategic counsel, telephonic advice",
                "Court Representation — Appearances before District, Sessions & High Courts",
              ].map((area) => (
                <div key={area} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground mt-1 shrink-0">•</span>
                  <span>{area}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3 flex items-center gap-2">
              <Briefcase size={20} className="text-muted-foreground" />
              Education & Credentials
            </h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1 shrink-0">•</span>
                <span>Licensed Advocate — Lahore High Court, Punjab Bar Council</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1 shrink-0">•</span>
                <span>LL.B — Bachelor of Laws</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1 shrink-0">•</span>
                <span>Member — Lahore Bar Association</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1 shrink-0">•</span>
                <span>Active practice since 2016 — 10+ years of courtroom experience</span>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3 flex items-center gap-2">
              <Award size={20} className="text-muted-foreground" />
              Why Choose M Salman Tahir?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {[
                { title: "87% Success Rate", desc: "Proven track record of favorable outcomes since 2016" },
                { title: "AI-Powered Consultation", desc: "24/7 free legal AI chatbot — the only advocate in Lahore offering this" },
                { title: "Transparent Fees", desc: "Clear fee structure with online payment options" },
                { title: "Client-Centered", desc: "Personalized attention to every case, direct communication" },
              ].map((item) => (
                <div key={item.title} className="border border-border rounded-lg p-4">
                  <h3 className="font-serif text-base mb-1">{item.title}</h3>
                  <p className="text-sm text-foreground/60">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-serif text-foreground mb-3 flex items-center gap-2">
              <MapPin size={20} className="text-muted-foreground" />
              Office Location
            </h2>
            <div className="text-sm space-y-2">
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-muted-foreground shrink-0" />
                Office No. 401, 4th Floor, Qureshi Building, Lower Mall Road, Lahore, Pakistan
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-muted-foreground shrink-0" />
                <a href="tel:+923006829799" className="border-b border-border hover:border-foreground transition-colors">
                  +92 300 6829799
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-muted-foreground shrink-0" />
                <a href="mailto:Salman.tahir14@yahoo.com" className="border-b border-border hover:border-foreground transition-colors">
                  Salman.tahir14@yahoo.com
                </a>
              </p>
            </div>
            <div className="mt-6">
              <Link
                to="/fees"
                className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-primary-foreground font-sans text-sm tracking-wider uppercase hover:opacity-90 transition-opacity rounded"
              >
                View Fee Structure
              </Link>
            </div>
          </section>
        </div>
      </div>
      <SiteFooter />
    </main>
  );
};

export default About;
