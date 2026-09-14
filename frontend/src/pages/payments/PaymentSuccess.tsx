import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Printer, ShieldCheck, AlertCircle } from 'lucide-react';
import { getPaymentById } from '@/services/paymentService';
import { formatPrice } from '@/utils';
import type { Payment } from '@/types';

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const [payment, setPayment] = useState<Payment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!paymentId) {
      setError('Payment reference is missing.');
      setLoading(false);
      return () => { active = false; };
    }

    getPaymentById(paymentId)
      .then((result) => {
        if (!active) return;
        if (result.status !== 'TEST_SUCCESS') {
          setError('This payment has not been confirmed.');
          return;
        }
        setPayment(result);
      })
      .catch(() => {
        if (active) setError('Unable to verify this payment.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [paymentId]);

  if (loading) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-600">Verifying payment…</div>;
  }

  if (!payment || error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle size={48} className="mx-auto text-amber-600" />
        <h1 className="mt-4 text-2xl font-bold text-gray-900">Payment not confirmed</h1>
        <p className="mt-2 text-gray-600">{error || 'No verified payment record was found.'}</p>
        <Link to="/bookings" className="btn-primary inline-block mt-6">View bookings</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="card text-center p-8 sm:p-10 shadow-xl border border-gray-100">
        <CheckCircle2 size={64} className="mx-auto text-green-600" />
        <span className="mt-5 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest text-green-700 bg-green-50 border border-green-200">
          <ShieldCheck size={14} /> Payment confirmed
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Payment verified</h1>

        <div className="mt-8 text-left bg-gray-50 border border-gray-200 rounded-2xl p-5 grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-gray-500">Booking reference</p><p className="font-mono font-semibold break-all">{payment.bookingId}</p></div>
          <div><p className="text-gray-500">Total paid</p><p className="font-bold text-primary-600">{formatPrice(payment.amount)}</p></div>
          <div className="col-span-2"><p className="text-gray-500">Transaction reference</p><p className="font-mono font-semibold break-all">{payment.transactionRef}</p></div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/bookings" className="btn-primary inline-flex items-center justify-center gap-2">
            Manage bookings <ArrowRight size={16} />
          </Link>
          <button type="button" onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Printer size={16} /> Print receipt
          </button>
        </div>
      </div>
    </div>
  );
}
