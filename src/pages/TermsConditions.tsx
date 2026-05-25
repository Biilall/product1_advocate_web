import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const TermsConditions = () => {
  return (
    <main className="bg-background min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 font-sans text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>

        <h1 className="text-3xl md:text-4xl font-serif mb-4">Terms & Conditions</h1>
        <p className="font-sans text-sm text-muted-foreground mb-12">
          Last updated: May 25, 2026
        </p>

        <div className="prose prose-neutral max-w-none font-sans text-foreground/80 space-y-8">
          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing and using this website or engaging the legal services of M Salman Tahir,
              Advocate, you agree to be bound by these Terms & Conditions. If you do not agree,
              please do not use this website or our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">2. Legal Disclaimer</h2>
            <p className="leading-relaxed">
              The information provided on this website is for general informational purposes only
              and does not constitute legal advice. No attorney-client relationship is formed by
              your use of this website or by sending us an inquiry. An attorney-client relationship
              is only established through a formal written engagement agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">3. Services</h2>
            <p className="leading-relaxed">
              M Salman Tahir provides legal services including but not limited to criminal defense,
              civil litigation, family law, corporate law, intellectual property, legal consultation,
              document drafting, and court representation before the courts of Pakistan. The scope of
              services for any engagement will be defined in a written agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">4. Fees & Payment</h2>
            <p className="leading-relaxed">
              Legal fees are discussed and agreed upon prior to commencement of services. Fees may
              be charged as a fixed amount, retainer, or on a per-appearance basis depending on the
              nature of the matter. All fee arrangements will be documented in writing. Payment terms
              are as specified in the engagement agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">5. No Guarantee of Outcome</h2>
            <p className="leading-relaxed">
              While we strive for the best possible results, no legal professional can guarantee the
              outcome of any legal matter. Past results do not guarantee future outcomes. The
              statistics and track record displayed on this website are historical and should not be
              construed as a promise of similar results.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">6. Intellectual Property</h2>
            <p className="leading-relaxed">
              All content on this website, including text, images, graphics, and design, is the
              property of M Salman Tahir and is protected under applicable intellectual property laws.
              You may not reproduce, distribute, or use any content without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">7. Limitation of Liability</h2>
            <p className="leading-relaxed">
              To the fullest extent permitted by law, M Salman Tahir shall not be liable for any
              indirect, incidental, or consequential damages arising from the use of this website
              or reliance on any information provided herein.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">8. Governing Law</h2>
            <p className="leading-relaxed">
              These Terms & Conditions are governed by and construed in accordance with the laws of
              Pakistan. Any disputes arising from these terms shall be subject to the exclusive
              jurisdiction of the courts in Lahore, Pakistan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">9. Changes to Terms</h2>
            <p className="leading-relaxed">
              We reserve the right to update these Terms & Conditions at any time. Changes will be
              posted on this page with an updated revision date. Continued use of the website after
              changes constitutes acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">10. Contact Us</h2>
            <p className="leading-relaxed">
              For questions regarding these terms, please contact:
            </p>
            <p className="mt-3 leading-relaxed">
              <strong>M Salman Tahir — Advocate</strong><br />
              Office No. 401, 4th Floor, Qureshi Building, Lower Mall Road, Lahore<br />
              Phone: +92 300 6829799<br />
              Email: Salman.tahir14@yahoo.com
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default TermsConditions;
