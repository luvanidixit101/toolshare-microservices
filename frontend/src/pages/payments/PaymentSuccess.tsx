import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Printer, ShieldCheck } from 'lucide-react';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId') || 'BK-' + Math.floor(Math.random() * 9000 + 1000);
  const transactionId = searchParams.get('transactionId') || 'MOCK_TXN_' + Date.now();
  const amount = searchParams.get('amount') || '₹1,500';
  const toolName = searchParams.get('toolName') || 'Rented Tool';
  const paymentMethod = searchParams.get('paymentMethod') || 'CARD';

  const formatMethodLabel = (m: string) => {
    switch (m) {
      case 'RAZORPAY': return 'Razorpay Test Sandbox (Simulated Gateway)';
      case 'CARD': return 'Credit / Debit Card (SSL Test Gateway)';
      case 'UPI': return 'UPI / QR Payment';
      case 'NET_BANKING': return 'Net Banking Direct Transfer';
      case 'WALLET': return 'Digital Wallet';
      case 'CASH_ON_PICKUP': return 'Pay at Pickup (Cash)';
      default: return m;
    }
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="card text-center p-8 sm:p-10 shadow-xl border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-green-100/90 text-green-600 flex items-center justify-center shadow-inner animate-bounce-short">
            <CheckCircle2 size={44} />
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-green-700 bg-green-50 border border-green-200">
          <ShieldCheck size={14} /> Payment & Booking Confirmed
        </span>

        <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Your Rental is Secured!</h1>
        <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
          Your payment for <span className="font-semibold text-gray-900">{toolName}</span> has been processed successfully.
        </p>

        {/* Detailed receipt box */}
        <div className="mt-8 text-left bg-gray-50 border border-gray-200/80 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3">
            <div>
              <p className="text-[11px] font-semibold text-gray-400 uppercase">Item Rented</p>
              <p className="text-sm font-bold text-gray-900">{toolName}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-green-100 text-green-800 rounded-md">
              APPROVED
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-gray-400 font-medium">Booking Reference</p>
              <p className="font-mono font-bold text-gray-800 text-sm mt-0.5">{bookingId}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Total Paid</p>
              <p className="font-extrabold text-primary-600 text-sm mt-0.5">{amount}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Payment Method</p>
              <p className="font-semibold text-gray-800 mt-0.5">{formatMethodLabel(paymentMethod)}</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium">Date & Time</p>
              <p className="font-semibold text-gray-800 mt-0.5">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            </div>
            <div className="col-span-2 pt-2 border-t border-gray-200/60">
              <p className="text-gray-400 font-medium">Transaction Reference ID</p>
              <p className="font-mono text-gray-800 font-semibold select-all mt-0.5">{transactionId}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/bookings"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 text-sm font-semibold text-white hover:bg-primary-700 shadow-md transition-all"
          >
            Manage Bookings
            <ArrowRight size={16} />
          </Link>
          <button
            type="button"
            onClick={handlePrintReceipt}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Printer size={16} /> Print / Save Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
