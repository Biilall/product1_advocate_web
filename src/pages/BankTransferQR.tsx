import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import courtImg from "@/assets/lahore-high-court.png";
import qrBankImage from "@/assets/QR_bank.jpeg";

const BankTransferQR = () => {
  const [bankName, setBankName] = useState("Standard Chartered")
  const [accountName, setAccountName] = useState("M Bilal Tahir")
  const [accountNumber, setAccountNumber] = useState("01001001201")
  const [iban, setIban] = useState("PK19SCBL0000001001001201")
  const [ifsc, setIfsc] = useState("SCBL0000001") // or use actual SWIFT/IFSC as needed
  const [amount, setAmount] = useState("5000")
  const [note, setNote] = useState("Lawyer Retainer Fee")

  const qrText = useMemo(() => {
    // Basic bank transfer format text (for human and mobile scanner apps)
    return `Bank name: ${bankName}\nAccount name: ${accountName}\nAccount number: ${accountNumber}\nIBAN: ${iban}\nIFSC/Swift: ${ifsc}\nAmount: ${amount}\nNote: ${note}`;
  }, [bankName, accountName, accountNumber, iban, ifsc, amount, note]);

  const qrImageUrl = qrBankImage;

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
      <div className="relative mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white/85 p-6 shadow-md backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Bank Transfer QR Code</h1>
            <p className="text-sm text-slate-500">Use this QR for client-to-bank payments.</p>
          </div>
          <Link
            to="/"
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            Back to Home
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Bank Name</label>
            <input
              value={bankName}
              readOnly
              className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-slate-100"
            />

            <label className="block text-sm font-medium">Account Name</label>
            <input
              value={accountName}
              readOnly
              className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-slate-100"
            />

            <label className="block text-sm font-medium">Account Number</label>
            <input
              value={accountNumber}
              readOnly
              className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-slate-100"
            />

            <label className="block text-sm font-medium">IBAN</label>
            <input
              value={iban}
              readOnly
              className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-slate-100"
            />

            <label className="block text-sm font-medium">IFSC / SWIFT Code</label>
            <input
              value={ifsc}
              readOnly
              className="w-full rounded-lg border border-slate-300 px-3 py-2 bg-slate-100"
            />

            <label className="block text-sm font-medium">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />

            <label className="block text-sm font-medium">Note</label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-center">
            <h2 className="text-lg font-semibold">QR Code Preview</h2>
            <img
              src={qrImageUrl}
              alt="Bank transfer QR code"
              className="mx-auto mt-4 h-80 w-80 rounded-xl border border-slate-300" />

            <div className="mt-4 rounded-lg bg-white p-3 text-left text-sm text-slate-700">
              <pre className="whitespace-pre-wrap break-words">{qrText}</pre>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Scan this code with your bank app or QR reader. You can copy the transfer details above.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BankTransferQR;
