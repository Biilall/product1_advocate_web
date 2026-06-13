import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import courtImg from "@/assets/lahore-high-court.png";
import SiteHeader from "@/components/SiteHeader";

interface PaymentRecord {
  id: string;
  tracker: string;
  amount: number;
  currency: string;
  description?: string;
  status: string;
  createdAt: string;
}

const feeItems = [
  { label: "Retainer Agreement", amount: 45000, description: "Case strategy, documentation, and communication" },
  { label: "Detailed Consultation (45 min)", amount: 3000, description: "In-depth legal consultation" },
  { label: "Extended Consultation (90 min)", amount: 4200, description: "Comprehensive case analysis" },
  { label: "Follow-up Call (30 min)", amount: 2000, description: "Telephone follow-up advice" },
  { label: "Document Review", amount: 1500, description: "Per document review" },
  { label: "Drafting Contracts", amount: 2200, description: "Contract/agreement drafting" },
  { label: "Legal Research / Case Memo", amount: 5000, description: "Research and case memo preparation" },
  { label: "Court Representation (per day)", amount: 5000, description: "Dependent on jurisdiction" },
];

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
};

const Fees = () => {
  const [payingItem, setPayingItem] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [payingCustom, setPayingCustom] = useState(false);
  const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    const threadId = localStorage.getItem("chatThreadId");
    if (threadId) {
      fetch(`/api/payment/history/${threadId}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setPaymentHistory(data);
        })
        .catch(() => {});
    }
  }, []);

  const handlePayment = async (amount: number, description: string) => {
    setPayingItem(description);
    try {
      const threadId = localStorage.getItem("chatThreadId");
      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, description, threadId }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Payment failed. Please try again.");
        return;
      }

      window.location.href = data.checkoutUrl;
    } catch {
      alert("Could not connect to payment service. Please try again later.");
    } finally {
      setPayingItem(null);
      setPayingCustom(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col">
      <SiteHeader />
      <div
        className="relative flex-1 p-6 text-slate-900"
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
            - Retainer agreement starts at <strong>45,000 PKR</strong> depending on case complexity.
            <br />- Includes case strategy, documentation, and communication.
            <br />- Monthly progress review and action plan updates.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-2xl font-semibold">2. Services & Pricing</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {feeItems.map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div>
                  <p className="font-medium text-slate-800">{item.label}</p>
                  <p className="text-sm text-slate-500">{item.description}</p>
                  <p className="mt-1 text-lg font-bold text-blue-700">{item.amount.toLocaleString()} PKR</p>
                </div>
                <button
                  onClick={() => handlePayment(item.amount, item.label)}
                  disabled={payingItem === item.label}
                  className="ml-3 shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {payingItem === item.label ? "Processing..." : "Pay Now"}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold">Custom Amount</h2>
          <p className="mt-1 text-sm text-slate-500">Enter a custom amount for your payment.</p>
          <div className="mt-3 flex items-center gap-3">
            <input
              type="number"
              min="100"
              placeholder="Enter amount in PKR"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              className="w-48 rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={() => {
                const amt = parseInt(customAmount, 10);
                if (amt >= 100) {
                  handlePayment(amt, "Custom Payment");
                } else {
                  alert("Minimum amount is 100 PKR");
                }
              }}
              disabled={payingCustom}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
            >
              {payingCustom ? "Processing..." : "Pay Custom Amount"}
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold">Other Payment Methods</h2>
          <p className="mt-2 text-slate-600">
            You can also pay via bank transfer or JazzCash.
          </p>
          <div className="mt-3 flex gap-3">
            <Link
              to="/bank-transfer-qr"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Bank Transfer Details
            </Link>
          </div>
        </section>

        {paymentHistory.length > 0 && (
          <section className="mt-8 border-t border-slate-200 pt-6">
            <h2 className="text-xl font-semibold">Your Payment History</h2>
            <div className="mt-3 space-y-2">
              {paymentHistory.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
                >
                  <div>
                    <p className="font-medium text-slate-800">
                      {p.description || "Payment"} — {p.amount.toLocaleString()} {p.currency}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(p.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColors[p.status] || "bg-slate-100 text-slate-500"}`}
                  >
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
    </main>
  );
};

export default Fees;
