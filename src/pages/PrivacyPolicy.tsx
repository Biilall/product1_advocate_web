import { Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const PrivacyPolicy = () => {
  useEffect(() => { document.title = "Privacy Policy — M Salman Tahir | Advocate"; }, []);
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

        <h1 className="text-3xl md:text-4xl font-serif mb-4">Privacy Policy</h1>
        <p className="font-sans text-sm text-muted-foreground mb-12">
          Last updated: May 25, 2026
        </p>

        <div className="prose prose-neutral max-w-none font-sans text-foreground/80 space-y-8">
          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">1. Information We Collect</h2>
            <p className="leading-relaxed">
              When you contact our law office, submit a consultation request, or use our website,
              we may collect the following personal information:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Full name, phone number, and email address</li>
              <li>Postal address and city of residence</li>
              <li>Case details and legal matter descriptions you share with us</li>
              <li>Payment and billing information for legal services</li>
              <li>Website usage data such as browser type, IP address, and pages visited</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">2. How We Use Your Information</h2>
            <p className="leading-relaxed">We use the collected information to:</p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Provide legal consultation and representation services</li>
              <li>Communicate with you regarding your case or inquiry</li>
              <li>Process payments for legal services rendered</li>
              <li>Comply with legal and regulatory obligations</li>
              <li>Improve our website and services</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">3. Confidentiality & Attorney-Client Privilege</h2>
            <p className="leading-relaxed">
              All information shared with our office in the course of seeking or receiving legal
              representation is protected under attorney-client privilege as recognized under
              Pakistani law. We do not disclose confidential client information to third parties
              unless required by law or with your express written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">4. Data Security</h2>
            <p className="leading-relaxed">
              We implement reasonable administrative, technical, and physical safeguards to protect
              your personal information from unauthorized access, use, alteration, or disclosure.
              However, no method of electronic storage or transmission is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">5. Third-Party Services</h2>
            <p className="leading-relaxed">
              Our website may use third-party services (such as Google Maps for office location display).
              These services have their own privacy policies. We do not sell or rent your personal
              information to any third party.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">6. Your Rights</h2>
            <p className="leading-relaxed">
              You have the right to request access to, correction of, or deletion of your personal
              information held by us. To exercise these rights, please contact our office directly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">7. Contact Us</h2>
            <p className="leading-relaxed">
              If you have questions about this Privacy Policy, please contact us at:
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
      <SiteFooter />
    </main>
  );
};

export default PrivacyPolicy;
