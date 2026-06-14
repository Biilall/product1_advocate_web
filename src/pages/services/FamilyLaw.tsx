import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const FamilyLaw = () => {
  useEffect(() => {
    document.title = "Family Lawyer Lahore — Divorce, Khula, Child Custody | M Salman Tahir";
  }, []);

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <Heart size={28} className="text-muted-foreground" />
          <h1 className="text-3xl md:text-4xl font-serif">Family Law</h1>
        </div>
        <p className="font-sans text-lg text-foreground/70 mb-10">
          Compassionate and effective family law representation in Lahore — divorce, khula, custody, maintenance, and more.
        </p>

        <div className="prose prose-neutral max-w-none font-sans text-foreground/80 space-y-8">
          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Family Law Practice in Pakistan</h2>
            <p className="leading-relaxed">
              Family matters are deeply personal and emotionally challenging. M Salman Tahir provides sensitive yet
              assertive legal representation in all areas of family law before the Family Courts of Lahore and Punjab.
              With a deep understanding of the Muslim Family Laws Ordinance 1961, the Family Courts Act 1964,
              and the Dissolution of Muslim Marriages Act 1939, Mr. Tahir ensures your rights are protected.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Family Law Services</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {[
                "Khula — Wife-initiated dissolution of marriage",
                "Divorce — Talaq procedures and legal formalities",
                "Child Custody & Guardianship (Hizanat)",
                "Maintenance Claims (Nafqa) — Wife, children",
                "Dower (Mahr) Recovery",
                "Domestic Violence Protection Orders",
                "Restitution of Conjugal Rights",
                "Marriage Registration & Nikahnama Disputes",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground mt-1 shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Khula Procedure in Pakistan</h2>
            <p className="leading-relaxed">
              Khula is the right of a Muslim wife to seek dissolution of her marriage through the Family Court.
              Under the Dissolution of Muslim Marriages Act 1939, a wife can file a suit for khula even without
              her husband's consent. The process typically involves:
            </p>
            <ol className="space-y-2 text-sm mt-3 list-decimal list-inside">
              <li><strong>Filing the petition:</strong> A suit for dissolution of marriage is filed before the Family Court.</li>
              <li><strong>Pre-trial reconciliation:</strong> The court appoints an arbitration council and attempts reconciliation.</li>
              <li><strong>Court proceedings:</strong> If reconciliation fails, the case proceeds to evidence and arguments.</li>
              <li><strong>Decree of khula:</strong> The court may grant khula, usually requiring the wife to return the dower (mahr).</li>
            </ol>
            <p className="leading-relaxed mt-3">
              The entire process typically takes 3–6 months. Having a knowledgeable family lawyer significantly
              impacts the outcome — particularly in contested cases involving custody or property.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Child Custody (Hizanat) in Pakistan</h2>
            <p className="leading-relaxed">
              Under Pakistani law, the right of hizanat (custody) generally belongs to the mother for sons until
              age 7 and daughters until puberty, subject to the welfare of the child being the paramount consideration.
              The Guardian and Wards Act 1890 governs custody disputes, and the Family Court considers the child's
              best interests above all else.
            </p>
            <p className="leading-relaxed mt-3">
              Whether you are seeking custody, visitation rights, or challenging an existing custody arrangement,
              M Salman Tahir can represent you effectively in Family Court.
            </p>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-serif text-foreground mb-3">Confidential Consultation</h2>
            <p className="leading-relaxed mb-4">
              Family matters require discretion and care. Contact M Salman Tahir for a confidential consultation about your case.
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

export default FamilyLaw;
