import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shield } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const CriminalDefense = () => {
  useEffect(() => {
    document.title = "Criminal Defense Lawyer Lahore — M Salman Tahir | Bail, Murder, Anti-Terrorism Cases";
  }, []);

  return (
    <main className="bg-background min-h-screen flex flex-col">
      <SiteHeader />
      <div className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link to="/" className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors mb-12">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <Shield size={28} className="text-muted-foreground" />
          <h1 className="text-3xl md:text-4xl font-serif">Criminal Defense</h1>
        </div>
        <p className="font-sans text-lg text-foreground/70 mb-10">
          Experienced criminal defense representation before District Courts, Sessions Courts, and the Lahore High Court.
        </p>

        <div className="prose prose-neutral max-w-none font-sans text-foreground/80 space-y-8">
          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Expert Criminal Defense in Lahore</h2>
            <p className="leading-relaxed">
              M Salman Tahir has defended clients in some of the most complex criminal cases in Punjab since 2016.
              Whether you are facing charges for a bailable or non-bailable offence, pre-arrest or post-arrest
              bail, or a trial in Sessions Court, you need an advocate who understands the Pakistan Penal Code (PPC)
              and the Code of Criminal Procedure (CrPC) inside out.
            </p>
            <p className="leading-relaxed mt-3">
              With an <strong>87% favorable outcome rate</strong>, Mr. Tahir provides aggressive yet strategic
              defense — from the initial FIR stage through appeals before the Lahore High Court.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Areas We Cover</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              {[
                "Murder & Homicide Defense (PPC Sections 299–338)",
                "Anti-Terrorism Act Cases (ATA 1997)",
                "Narcotics & Drug Offenses (CNSA 1997)",
                "Fraud & White-Collar Crime",
                "Cybercrime (PECA 2016)",
                "Bail Applications — Pre-arrest & Post-arrest",
                "Quashment of FIR Petitions",
                "Criminal Appeals & Revisions",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground mt-1 shrink-0">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Bail in Pakistan — How It Works</h2>
            <p className="leading-relaxed">
              Bail is one of the fundamental rights under Pakistan's criminal justice system. There are two main types:
            </p>
            <ul className="space-y-2 text-sm mt-3">
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1 shrink-0">•</span>
                <span><strong>Pre-arrest bail (Section 498 CrPC):</strong> Filed before arrest to prevent detention. Commonly sought in non-bailable offences when there is apprehension of arrest.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground mt-1 shrink-0">•</span>
                <span><strong>Post-arrest bail (Section 497 CrPC):</strong> Filed after arrest. The court considers the nature of the offence, evidence, and likelihood of the accused fleeing.</span>
              </li>
            </ul>
            <p className="leading-relaxed mt-3">
              For bailable offences, bail is a matter of right. For non-bailable offences, an experienced criminal
              lawyer can present compelling grounds — such as lack of evidence, no prior record, or statutory
              entitlement — to secure bail before the Sessions Court or the High Court.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Why Choose Our Criminal Defense Practice?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              {[
                { title: "Courtroom Experience", desc: "10+ years appearing before criminal courts across Punjab" },
                { title: "Bail Expertise", desc: "Hundreds of successful bail applications in bailable and non-bailable matters" },
                { title: "Strategic Approach", desc: "Thorough case analysis, evidence review, and cross-examination preparation" },
                { title: "Urgent Response", desc: "Available for emergencies — arrests, remands, and urgent bail hearings" },
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
                { q: "How much does a criminal lawyer cost in Lahore?", a: "Criminal defense fees vary by case complexity. A simple bail application may start from PKR 20,000–50,000, while murder or anti-terrorism cases involve higher fees. Contact us for an exact assessment based on your case." },
                { q: "Can I get bail for a non-bailable offence in Pakistan?", a: "Yes. While bail is not a right in non-bailable cases, the court can grant bail under Section 497 CrPC based on factors like weak prosecution evidence, no prior criminal record, statutory entitlement, or the accused being a woman or minor." },
                { q: "What happens after an FIR is registered against me?", a: "After FIR registration, police investigate the matter. If the offence is non-bailable, you may be arrested. You should immediately consult a criminal lawyer to file for pre-arrest bail to prevent detention, or post-arrest bail if already arrested." },
                { q: "How long does a criminal case take in Pakistan?", a: "Timelines vary significantly. A bail application may be decided within days. A trial in Sessions Court can take 6 months to several years depending on complexity, number of witnesses, and court scheduling." },
              ].map((faq) => (
                <div key={faq.q} className="border-l border-border pl-4">
                  <h3 className="font-serif text-base mb-1">{faq.q}</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Legal Terms Explained</h2>
            <div className="flex flex-wrap gap-3 mt-3">
              <Link to="/glossary/pre-arrest-bail" className="text-sm border border-border rounded px-4 py-2 hover:bg-foreground/5 transition-colors">What is Pre-Arrest Bail?</Link>
              <Link to="/glossary/post-arrest-bail" className="text-sm border border-border rounded px-4 py-2 hover:bg-foreground/5 transition-colors">What is Post-Arrest Bail?</Link>
              <Link to="/glossary/fir" className="text-sm border border-border rounded px-4 py-2 hover:bg-foreground/5 transition-colors">What is an FIR?</Link>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">Related Services</h2>
            <div className="flex flex-wrap gap-3 mt-3">
              <Link to="/services/civil-litigation" className="text-sm border border-border rounded px-4 py-2 hover:bg-foreground/5 transition-colors">Civil Litigation</Link>
              <Link to="/services/family-law" className="text-sm border border-border rounded px-4 py-2 hover:bg-foreground/5 transition-colors">Family Law</Link>
              <Link to="/services/corporate-law" className="text-sm border border-border rounded px-4 py-2 hover:bg-foreground/5 transition-colors">Corporate & Banking Law</Link>
            </div>
          </section>

          <section className="border-t border-border pt-8">
            <h2 className="text-xl font-serif text-foreground mb-3">Get Legal Help Now</h2>
            <p className="leading-relaxed mb-4">
              If you or a family member is facing criminal charges, contact M Salman Tahir immediately for a confidential consultation.
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

export default CriminalDefense;
