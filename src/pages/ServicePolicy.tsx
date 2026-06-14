import { Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const ServicePolicy = () => {
  useEffect(() => { document.title = "Service Delivery Policy — M Salman Tahir | Advocate"; }, []);
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

        <h1 className="text-3xl md:text-4xl font-serif mb-4">Service Delivery Policy</h1>
        <p className="font-sans text-sm text-muted-foreground mb-12">
          Last updated: May 25, 2026
        </p>

        <div className="prose prose-neutral max-w-none font-sans text-foreground/80 space-y-8">
          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">1. Our Services</h2>
            <p className="leading-relaxed">
              M Salman Tahir, Advocate, provides the following legal services from our
              Lahore office:
            </p>
            <ul className="list-disc pl-6 mt-3 space-y-2">
              <li>Criminal Defense — Murder, anti-terrorism, narcotics, fraud, cybercrime, and bail applications</li>
              <li>Civil Litigation — Property disputes, contract disputes, and constitutional petitions</li>
              <li>Family Law — Divorce, custody, guardianship, and maintenance matters</li>
              <li>Corporate & Banking Law — Financial litigation, banking disputes, and commercial contracts</li>
              <li>Intellectual Property — Trademark, copyright, and patent matters</li>
              <li>Legal Consultation — In-person and telephonic legal advice sessions</li>
              <li>Document Drafting — Legal notices, contracts, affidavits, and court filings</li>
              <li>Court Representation — Appearances before District Courts, Sessions Courts, and the Lahore High Court</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">2. Service Delivery Process</h2>
            <p className="leading-relaxed">Our service delivery follows these steps:</p>
            <ol className="list-decimal pl-6 mt-3 space-y-2">
              <li><strong>Initial Contact:</strong> Clients may reach out via phone, email, or in-person visit.</li>
              <li><strong>Consultation:</strong> An initial meeting to discuss the legal matter, assess merits, and advise on the way forward.</li>
              <li><strong>Engagement:</strong> Upon agreement, a fee structure is discussed and the engagement formally begins.</li>
              <li><strong>Case Management:</strong> Active handling of the matter including research, drafting, filing, and court appearances.</li>
              <li><strong>Updates:</strong> Regular case status updates are provided to keep clients informed.</li>
              <li><strong>Resolution:</strong> Final disposition of the matter with complete documentation provided to the client.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">3. Service Area</h2>
            <p className="leading-relaxed">
              We primarily serve clients in Lahore and across Punjab, Pakistan. Court
              appearances are made before the District &amp; Sessions Courts in Lahore and the
              Lahore High Court. For matters in other jurisdictions, arrangements can be
              discussed during consultation.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">4. Timelines</h2>
            <p className="leading-relaxed">
              Legal matters are subject to court schedules and procedural requirements.
              While we strive to handle every case efficiently, timelines depend on the
              nature and complexity of the matter, court availability, and cooperation of
              involved parties. We do not guarantee specific outcomes or timeframes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">5. Office Hours</h2>
            <p className="leading-relaxed">
              Our office operates Monday through Saturday, 9:00 AM to 6:00 PM (PKT).
              Appointments are recommended. Urgent matters may be accommodated outside
              regular hours at the advocate's discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">6. Contact Us</h2>
            <p className="leading-relaxed">
              For service-related inquiries, please contact:
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

export default ServicePolicy;
