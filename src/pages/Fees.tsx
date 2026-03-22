import { Link } from "react-router-dom";
import courtImg from "@/assets/lahore-high-court.png";

const Fees = () => {
  return (
    <main
      className="relative min-h-screen p-6 text-slate-900"
      style={{
        backgroundImage: `url(${courtImg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white/85 p-8 shadow-md backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Fee Structure</h1>
            <p className="text-sm text-slate-500">Transparent pricing for legal guidance and support.</p>
          </div>
          <Link
            to="/"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Back to Home
          </Link>
        </div>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold">1. Hire Me</h2>
          <p className="mt-2 text-slate-600">
            - Retainer agreement starts at <strong>45000PKR</strong> depending on case complexity.
            <br />- Includes case strategy, documentation, and communication.
            <br />- Monthly progress review and action plan updates.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold">2. Consultation Fee</h2>
          <ul className="mt-2 list-disc space-y-2 pl-6 text-slate-600">
            <li>Initial 15-minute screening: <strong>Free</strong></li>
            <li>Detailed consultation (45 minutes): <strong>3000PKR</strong></li>
            <li>Extended consultation (90 minutes): <strong>4200PKR</strong></li>
            <li>Follow-up telephone advice: <strong>2000PKR per 30 min</strong></li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold">3. Other Services</h2>
          <ul className="mt-2 list-disc space-y-2 pl-6 text-slate-600">
            <li>Document review (per document): <strong>1500PKR</strong></li>
            <li>Drafting contracts/agreements: <strong>2200PKR</strong></li>
            <li>Legal research / case memo: <strong>5000PKR</strong></li>
            <li>Court representation/day rate: <strong>5000PKR</strong> (dependent on jurisdiction)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Need custom pricing?</h2>
          <p className="mt-2 text-slate-600">
            Contact us with your case details and we can provide a tailored quotation.
          </p>
          <Link
            to="#contact"
            className="mt-4 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Go to Contact Section
          </Link>
        </section>
      </div>
    </main>
  );
};

export default Fees;
