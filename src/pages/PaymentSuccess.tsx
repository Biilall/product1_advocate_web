import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import courtImg from "@/assets/lahore-high-court.png";
import SiteHeader from "@/components/SiteHeader";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [paymentData, setPaymentData] = useState<any>(null);

  useEffect(() => {
    const tracker = searchParams.get("tracker");
    const ref = searchParams.get("ref");
    const sig = searchParams.get("sig");

    if (tracker) {
      fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracker, ref, sig }),
      })
        .then((res) => res.json())
        .then((data) => {
          setPaymentData(data);
          setStatus(data.status === "completed" ? "success" : "error");
        })
        .catch(() => setStatus("error"));
    } else {
      setStatus("success");
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
        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <h1 className="text-2xl font-bold text-slate-800">Verifying Payment...</h1>
            <p className="mt-2 text-slate-500">Please wait while we confirm your payment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-green-700">Payment Successful!</h1>
            <p className="mt-2 text-slate-600">
              Thank you for your payment. Your transaction has been completed successfully.
            </p>
            {paymentData?.tracker && (
              <p className="mt-3 text-sm text-slate-500">
                Reference: <span className="font-mono">{paymentData.tracker}</span>
              </p>
            )}
            <div className="mt-6 flex flex-col gap-3">
              <Link
                to="/"
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}

        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 3a9 9 0 100 18 9 9 0 000-18z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-yellow-700">Payment Received</h1>
            <p className="mt-2 text-slate-600">
              We could not verify the payment instantly. If the amount was deducted, it will be confirmed shortly.
            </p>
            <div className="mt-6">
              <Link
                to="/"
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Back to Home
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
    </main>
  );
};

export default PaymentSuccess;
