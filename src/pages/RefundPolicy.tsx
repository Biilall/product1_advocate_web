import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const RefundPolicy = () => {
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

        <h1 className="text-3xl md:text-4xl font-serif mb-4">Return & Refund Policy</h1>
        <p className="font-sans text-sm text-muted-foreground mb-12">
          Last updated: May 25, 2026
        </p>

        <div className="prose prose-neutral max-w-none font-sans text-foreground/80 space-y-8">
          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">1. Nature of Legal Services</h2>
            <p className="leading-relaxed">
              Legal services provided by M Salman Tahir, Advocate, are professional services
              that involve time, expertise, and effort. Due to the nature of legal work, all
              services rendered are non-returnable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">2. Consultation Fees</h2>
            <p className="leading-relaxed">
              Initial consultation fees are non-refundable once the consultation has been
              provided. If a scheduled consultation is cancelled at least 24 hours in advance,
              a full refund or rescheduling will be offered at the client's discretion.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">3. Retainer Fees</h2>
            <p className="leading-relaxed">
              Retainer fees are applied toward legal services as work is performed. Any unused
              portion of a retainer may be refundable upon termination of the engagement, subject
              to deductions for services already rendered and costs incurred. A detailed accounting
              will be provided upon request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">4. Court Fees & Government Charges</h2>
            <p className="leading-relaxed">
              Court fees, stamp duties, filing fees, and other government charges paid on behalf
              of the client are non-refundable, as these are paid to government authorities and
              cannot be recovered.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">5. Termination of Services</h2>
            <p className="leading-relaxed">
              Either party may terminate the legal engagement with written notice. Upon
              termination, the client will be billed for all services rendered and expenses
              incurred up to the date of termination. Any excess retainer balance will be
              refunded within 15 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">6. Dispute Resolution</h2>
            <p className="leading-relaxed">
              Any disputes regarding fees or refunds should be raised directly with our office.
              We are committed to resolving all billing concerns amicably and transparently.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-serif text-foreground mb-3">7. Contact Us</h2>
            <p className="leading-relaxed">
              For refund requests or billing inquiries, please contact:
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

export default RefundPolicy;
