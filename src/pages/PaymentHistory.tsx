import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import courtImg from "@/assets/lahore-high-court.webp";
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

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  cancelled: "bg-slate-100 text-slate-500",
};

const statusLabels: Record<string, string> = {
  completed: "Completed",
  pending: "Pending",
  failed: "Failed",
  cancelled: "Cancelled",
};

const PaymentHistory = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Payment History — M Salman Tahir";
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  useEffect(() => {
    const threadId = localStorage.getItem("chatThreadId");
    if (threadId) {
      fetch(`/api/payment/history/${threadId}`)
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setPayments(data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const totalPaid = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

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
      <div className="relative mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white/90 p-8 shadow-md backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Payment History</h1>
            <p className="text-sm text-slate-500">View all your past and pending payments.</p>
          </div>
          <div className="flex gap-2">
            <Link
              to="/fees"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Make a Payment
            </Link>
            <Link
              to="/"
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
            >
              Home
            </Link>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-blue-700">{payments.length}</p>
            <p className="text-xs text-slate-500">Total Payments</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-green-700">
              {payments.filter((p) => p.status === "completed").length}
            </p>
            <p className="text-xs text-slate-500">Completed</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
            <p className="text-2xl font-bold text-slate-800">
              {totalPaid.toLocaleString()} PKR
            </p>
            <p className="text-xs text-slate-500">Total Paid</p>
          </div>
        </div>

        {/* Payment List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center">
            <p className="text-lg font-medium text-slate-500">No payments yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Your payment history will appear here after you make a payment.
            </p>
            <Link
              to="/fees"
              className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              View Fee Structure
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">
                    {p.description || "Payment"}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {new Date(p.createdAt).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  <p className="mt-0.5 font-mono text-xs text-slate-400">
                    Ref: {p.tracker.slice(0, 20)}...
                  </p>
                </div>
                <div className="ml-4 flex flex-col items-end gap-1">
                  <p className="text-lg font-bold text-slate-800">
                    {p.amount.toLocaleString()} {p.currency}
                  </p>
                  <span
                    className={`rounded-full px-3 py-0.5 text-xs font-semibold ${statusColors[p.status] || "bg-slate-100 text-slate-500"}`}
                  >
                    {statusLabels[p.status] || p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </main>
  );
};

export default PaymentHistory;
