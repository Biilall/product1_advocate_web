import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import courtImg from "@/assets/lahore-high-court.webp";
import SiteHeader from "@/components/SiteHeader";

const PaymentCancel = () => {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    document.title = "Payment Cancelled — M Salman Tahir";
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  useEffect(() => {
    const tracker = searchParams.get("tracker");
    if (tracker) {
      fetch("/api/payment/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracker }),
      }).catch(() => {});
    }
  }, [searchParams]);

  return (
    <main className="min-h-screen flex flex-col">
      <SiteHeader />
      <div
        className="relative flex flex-1 items-center justify-center p-6"
        style={{
          backgroundImage: `url(${courtImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative mx-auto max-w-lg rounded-2xl border border-slate-200 bg-white/90 p-8 text-center shadow-md backdrop-blur-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-red-700">Payment Cancelled</h1>
        <p className="mt-2 text-slate-600">
          Your payment was not completed. No amount has been charged.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/"
            className="rounded-lg border border-slate-200 bg-white px-6 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Back to Home
          </Link>
          <Link
            to="/fees"
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
    </main>
  );
};

export default PaymentCancel;
