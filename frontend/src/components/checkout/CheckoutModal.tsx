import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, MapPin, CreditCard, QrCode, Building2, Wallet, Banknote,
  Lock, CheckCircle2, ArrowRight, Info, Truck, UserCheck, Sparkles
} from 'lucide-react';
import Modal from '@/components/common/Modal';
import { createBooking } from '@/services/bookingService';
import { createPayment, confirmMockPayment } from '@/services/paymentService';
import type { Tool, PaymentMethodType } from '@/types';
import { formatPrice, getToolImage } from '@/utils';
import { toast } from '@/components/common/Toast';
import { useAuth } from '@/context/AuthContext';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  tool: Tool;
  initialStartDate?: string;
  initialEndDate?: string;
}

export default function CheckoutModal({
  open,
  onClose,
  tool,
  initialStartDate = '',
  initialEndDate = '',
}: CheckoutModalProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const isOwner = !!user && !!tool && user.id === tool.ownerId;

  // Step state: 1 = Dates & Delivery, 2 = Payment Method & Details, 3 = Processing
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form states
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [fulfillment, setFulfillment] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [contactPhone, setContactPhone] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CARD');
  // Card
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  // UPI
  const [upiId, setUpiId] = useState('');
  const [showQr, setShowQr] = useState(false);
  // Net Banking & Wallet
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [selectedWallet, setSelectedWallet] = useState('PAYTM');

  const [processing, setProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('');

  useEffect(() => {
    if (open) {
      if (initialStartDate) setStartDate(initialStartDate);
      if (initialEndDate) setEndDate(initialEndDate);
      setStep(1);
      setProcessing(false);
    }
  }, [open, initialStartDate, initialEndDate]);

  const daysBetween = (s: string, e: string) => {
    if (!s || !e) return 1;
    const d = new Date(e).getTime() - new Date(s).getTime();
    return Math.max(1, Math.ceil(d / 86400000));
  };

  const rentalDays = daysBetween(startDate, endDate);
  const rentalTotal = tool.pricePerDay * rentalDays;
  const deliveryFee = fulfillment === 'DELIVERY' ? 250 : 0;
  const grandTotal = rentalTotal + tool.securityDeposit + deliveryFee;

  // Format card number with spaces every 4 digits
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  // Format expiry MM/YY
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = raw.slice(0, 2) + '/' + raw.slice(2);
    }
    setExpiry(raw);
  };

  const handleNextToPayment = () => {
    if (isOwner) {
      toast('error', 'You cannot book your own tool.');
      return;
    }
    if (!startDate || !endDate) {
      toast('error', 'Please select both pick-up and return dates.');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast('error', 'Return date must be after pick-up date.');
      return;
    }
    if (fulfillment === 'DELIVERY' && !deliveryAddress.trim()) {
      toast('error', 'Please provide a delivery address.');
      return;
    }
    setStep(2);
  };

  const validatePayment = () => {
    if (isOwner) {
      toast('error', 'You cannot book your own tool.');
      return false;
    }
    if (paymentMethod === 'CARD') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 15) {
        toast('error', 'Please enter a valid 16-digit card number.');
        return false;
      }
      if (!cardHolder.trim()) {
        toast('error', 'Please enter cardholder name.');
        return false;
      }
      if (expiry.length < 5) {
        toast('error', 'Please enter card expiry date (MM/YY).');
        return false;
      }
      if (cvv.length < 3) {
        toast('error', 'Please enter 3-digit CVV.');
        return false;
      }
    } else if (paymentMethod === 'UPI') {
      if (!upiId.trim() || !upiId.includes('@')) {
        toast('error', 'Please enter a valid UPI ID (e.g. name@upi).');
        return false;
      }
    }
    return true;
  };

  const handlePayAndBook = async () => {
    if (!validatePayment()) return;

    setStep(3);
    setProcessing(true);
    setProcessingMessage('Initiating rental booking request...');

    try {
      // Step A: Create Booking
      const booking = await createBooking({
        toolId: tool.id,
        startDate,
        endDate,
      });

      setProcessingMessage('Processing secure test payment...');

      // Step B: Create Payment
      let paymentId = 'MOCK_PAY_' + Date.now();
      try {
        const paymentRes = await createPayment({
          bookingId: booking.id,
          amount: grandTotal,
          currency: 'INR',
        });
        paymentId = paymentRes.id;
      } catch (e) {
        console.warn('Backend payment create fallback:', e);
      }

      setProcessingMessage('Verifying test payment authorization...');

      // Step C: Confirm Mock Payment
      let transactionId = 'MOCK_TXN_' + Date.now();
      try {
        const confirmed = await confirmMockPayment(paymentId);
        if (confirmed.transactionRef) transactionId = confirmed.transactionRef;
      } catch (e) {
        console.warn('Backend payment confirm fallback:', e);
      }

      await new Promise((r) => setTimeout(r, 800));

      toast('success', 'Payment successful! Booking confirmed.');
      onClose();

      // Navigate to success page
      const params = new URLSearchParams({
        bookingId: booking.id,
        transactionId,
        amount: formatPrice(grandTotal),
        toolName: tool.name,
        paymentMethod,
      });
      navigate(`/payments/success?${params.toString()}`);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setProcessing(false);
      setStep(2);
      toast('error', e?.message || 'Failed to complete rental booking.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !processing && onClose()}
      title={step === 3 ? 'Processing Payment' : 'Complete Tool Rental'}
      size="xl"
    >
      <div className="space-y-6">
        {/* Progress indicator */}
        <div className="flex items-center justify-between px-2 sm:px-6 py-3 bg-gray-50 border-y border-gray-100 rounded-xl">
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${step >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              1
            </span>
            <span className={`text-sm font-medium ${step >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Rental Details</span>
          </div>
          <div className="h-0.5 w-8 sm:w-16 bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${step >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              2
            </span>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Payment</span>
          </div>
          <div className="h-0.5 w-8 sm:w-16 bg-gray-200" />
          <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${step === 3 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
              3
            </span>
            <span className={`text-sm font-medium ${step === 3 ? 'text-green-700 font-semibold' : 'text-gray-400'}`}>Confirmation</span>
          </div>
        </div>

        {/* Step 1: Dates & Delivery/Pickup */}
        {step === 1 && (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-5">
              {/* Tool Summary banner */}
              <div className="flex gap-4 p-3.5 bg-primary-50/50 rounded-xl border border-primary-100/80 items-center">
                <img
                  src={getToolImage(tool.images, tool.category)}
                  alt={tool.name}
                  className="w-16 h-16 rounded-lg object-cover shrink-0"
                  onError={(e) => { e.currentTarget.src = getToolImage([], tool.category); }}
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{tool.name}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                    <MapPin size={12} /> {tool.location} • {formatPrice(tool.pricePerDay)}/day
                  </p>
                </div>
              </div>

              {/* Dates Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Pick-up Date</label>
                  <input
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input text-sm"
                  />
                </div>
                <div>
                  <label className="label text-xs">Return Date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || new Date().toISOString().slice(0, 10)}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="input text-sm"
                  />
                </div>
              </div>

              {/* Fulfillment option */}
              <div>
                <label className="label text-xs">Fulfillment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFulfillment('PICKUP')}
                    className={`p-3.5 border rounded-xl flex flex-col items-start gap-1 transition-all ${fulfillment === 'PICKUP' ? 'border-primary-600 bg-primary-50/30 ring-2 ring-primary-500/20' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">
                        <UserCheck size={16} className="text-primary-600" /> Self Pick-up
                      </span>
                      <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-0.5 rounded-full">FREE</span>
                    </div>
                    <span className="text-xs text-gray-500 text-left">Pick up directly from owner location in {tool.location}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFulfillment('DELIVERY')}
                    className={`p-3.5 border rounded-xl flex flex-col items-start gap-1 transition-all ${fulfillment === 'DELIVERY' ? 'border-primary-600 bg-primary-50/30 ring-2 ring-primary-500/20' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">
                        <Truck size={16} className="text-primary-600" /> Doorstep Delivery
                      </span>
                      <span className="text-xs text-gray-700 font-semibold">₹250</span>
                    </div>
                    <span className="text-xs text-gray-500 text-left">Direct delivery & pick-up service at your address</span>
                  </button>
                </div>
              </div>

              {/* Contact info & address if delivery */}
              <div className="space-y-3">
                <div>
                  <label className="label text-xs">Mobile Contact Number</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className="input text-sm"
                  />
                </div>
                {fulfillment === 'DELIVERY' && (
                  <div>
                    <label className="label text-xs">Delivery Address</label>
                    <textarea
                      rows={2}
                      placeholder="Enter house no., street address, city, pincode"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="input text-sm"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Price breakdown sidebar */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
                <h4 className="font-semibold text-gray-900 text-sm border-b border-gray-200 pb-2.5">Rental Breakdown</h4>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Rate / day</span>
                    <span className="font-medium text-gray-900">{formatPrice(tool.pricePerDay)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duration</span>
                    <span className="font-medium text-gray-900">{rentalDays} day{rentalDays > 1 ? 's' : ''}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-200/60">
                    <span>Tool Rental Subtotal</span>
                    <span className="font-medium text-gray-900">{formatPrice(rentalTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Refundable Deposit</span>
                    <span className="font-medium text-gray-900">{formatPrice(tool.securityDeposit)}</span>
                  </div>
                  {fulfillment === 'DELIVERY' && (
                    <div className="flex justify-between text-primary-700">
                      <span>Delivery & Return Fee</span>
                      <span className="font-medium">₹250</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">Grand Total</span>
                    <p className="text-xs text-gray-400">Includes deposit & taxes</p>
                  </div>
                  <span className="text-xl font-extrabold text-primary-600">{formatPrice(grandTotal)}</span>
                </div>

                <button
                  type="button"
                  onClick={handleNextToPayment}
                  className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm"
                >
                  Proceed to Payment <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Real-Website Payment Method & Inputs */}
        {step === 2 && (
          <div className="grid lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-5">
              {/* Test mode banner */}
              <div className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 shadow-sm">
                <Info size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-bold text-amber-950 flex items-center gap-1.5">
                      Mock Payment Sandbox Active
                    </p>
                    <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Sandbox Mode
                    </span>
                  </div>
                  <p className="text-amber-800">
                    This is a simulated test payment checkout. You can use sample inputs to test the real website rental booking flow.
                  </p>
                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                    <span className="text-[11px] font-semibold text-amber-900">Quick Fill Sample Inputs:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('CARD');
                        setCardNumber('4532 8910 2345 6789');
                        setCardHolder('Alex Morgan');
                        setExpiry('12/28');
                        setCvv('123');
                        toast('info', 'Sample Card details auto-filled!');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-amber-100/80 text-amber-900 font-medium rounded-lg text-xs transition-colors flex items-center gap-1 border border-amber-300 shadow-xs"
                    >
                      <Sparkles size={12} className="text-amber-600" /> Test Card
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('UPI');
                        setUpiId('alex.morgan@okicici');
                        toast('info', 'Sample UPI ID auto-filled!');
                      }}
                      className="px-2.5 py-1 bg-white hover:bg-amber-100/80 text-amber-900 font-medium rounded-lg text-xs transition-colors flex items-center gap-1 border border-amber-300 shadow-xs"
                    >
                      <Sparkles size={12} className="text-amber-600" /> Test UPI
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('RAZORPAY');
                        toast('info', 'Razorpay Test Sandbox selected!');
                      }}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs transition-colors flex items-center gap-1 border border-blue-700 shadow-xs"
                    >
                      <Sparkles size={12} className="text-blue-200" /> Test Razorpay
                    </button>
                  </div>
                </div>
              </div>

              {/* Payment Method Selector Tabs */}
              <div>
                <label className="label text-xs">Select Payment Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('RAZORPAY')}
                    className={`p-3 border rounded-xl flex items-center gap-2 text-xs font-semibold transition-all ${paymentMethod === 'RAZORPAY' ? 'border-blue-600 bg-blue-50/70 text-blue-900 ring-2 ring-blue-500/20 shadow-sm' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                  >
                    <span className="w-4 h-4 rounded bg-blue-600 text-white text-[10px] font-black flex items-center justify-center">R</span> Razorpay Sandbox
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 border rounded-xl flex items-center gap-2 text-xs font-semibold transition-all ${paymentMethod === 'CARD' ? 'border-primary-600 bg-primary-50/60 text-primary-700 shadow-sm' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                  >
                    <CreditCard size={16} className="text-primary-600" /> Credit / Debit Card
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 border rounded-xl flex items-center gap-2 text-xs font-semibold transition-all ${paymentMethod === 'UPI' ? 'border-primary-600 bg-primary-50/60 text-primary-700 shadow-sm' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                  >
                    <QrCode size={16} className="text-primary-600" /> UPI / QR
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NET_BANKING')}
                    className={`p-3 border rounded-xl flex items-center gap-2 text-xs font-semibold transition-all ${paymentMethod === 'NET_BANKING' ? 'border-primary-600 bg-primary-50/60 text-primary-700 shadow-sm' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                  >
                    <Building2 size={16} className="text-primary-600" /> Net Banking
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('WALLET')}
                    className={`p-3 border rounded-xl flex items-center gap-2 text-xs font-semibold transition-all ${paymentMethod === 'WALLET' ? 'border-primary-600 bg-primary-50/60 text-primary-700 shadow-sm' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                  >
                    <Wallet size={16} className="text-primary-600" /> Wallets
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CASH_ON_PICKUP')}
                    className={`p-3 border rounded-xl flex items-center gap-2 text-xs font-semibold transition-all ${paymentMethod === 'CASH_ON_PICKUP' ? 'border-primary-600 bg-primary-50/60 text-primary-700 shadow-sm' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`}
                  >
                    <Banknote size={16} className="text-primary-600" /> Pay at Pickup
                  </button>
                </div>
              </div>

              {/* RAZORPAY MOCK FORM */}
              {paymentMethod === 'RAZORPAY' && (
                <div className="bg-slate-900 text-white rounded-xl p-5 space-y-4 shadow-xl border border-blue-500/30">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-blue-600 text-white text-xs font-black flex items-center justify-center shadow">
                        R
                      </div>
                      <div>
                        <span className="text-xs font-bold tracking-wider text-blue-400 uppercase">Razorpay Test Gateway</span>
                        <p className="text-[10px] text-slate-400">Merchant: ToolShare Online Rentals</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
                      SANDBOX ACTIVE
                    </span>
                  </div>

                  <div className="p-3 bg-slate-800/80 rounded-lg border border-slate-700/80 text-xs space-y-1.5 font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Key ID</span>
                      <span className="text-slate-200">rzp_test_99214AK20</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Order ID</span>
                      <span className="text-slate-200">order_rzp_test_{tool.id.slice(0, 6)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-700">
                      <span className="text-slate-300">Amount Payable</span>
                      <span className="font-bold text-green-400 text-sm">{formatPrice(grandTotal)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold uppercase text-slate-300">Razorpay Test Method Options</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => toast('info', 'Razorpay Test Card selected (4111 1111 1111 1111)')}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-center text-xs text-slate-200 transition-colors"
                      >
                        <CreditCard size={14} className="mx-auto mb-1 text-blue-400" /> Test Card
                      </button>
                      <button
                        type="button"
                        onClick={() => toast('info', 'Razorpay NetBanking selected (HDFC / ICICI)')}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-center text-xs text-slate-200 transition-colors"
                      >
                        <Building2 size={14} className="mx-auto mb-1 text-blue-400" /> NetBanking
                      </button>
                      <button
                        type="button"
                        onClick={() => toast('info', 'Razorpay UPI selected (success@razorpay)')}
                        className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-center text-xs text-slate-200 transition-colors"
                      >
                        <QrCode size={14} className="mx-auto mb-1 text-blue-400" /> Razorpay UPI
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                    <Shield size={13} className="text-blue-400" />
                    <span>256-Bit Razorpay Simulated Standard Checkout</span>
                  </div>
                </div>
              )}

              {/* CARD FORM */}
              {paymentMethod === 'CARD' && (
                <div className="bg-gradient-to-br from-slate-900 to-gray-800 text-white rounded-xl p-5 space-y-4 shadow-lg">
                  <div className="flex justify-between items-center border-b border-gray-700/60 pb-3">
                    <span className="text-xs font-mono uppercase tracking-widest text-gray-400">Card Payment Entry</span>
                    <div className="flex gap-2 text-xs font-bold bg-white/10 px-2.5 py-1 rounded text-white">
                      <span>VISA</span> / <span>MC</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-gray-300 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="Alex Morgan"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-gray-300 mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4532 8910 2345 6789"
                      maxLength={19}
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-300 mb-1">Expires (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        maxLength={5}
                        value={expiry}
                        onChange={handleExpiryChange}
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-gray-300 mb-1">CVV / CVC</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder-gray-500 focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI FORM */}
              {paymentMethod === 'UPI' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-4">
                  <div>
                    <label className="label text-xs">Enter Virtual Payment Address (UPI ID)</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="yourname@upi or mobile@okicici"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="input text-sm flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (upiId.includes('@')) toast('success', 'UPI ID verified successfully!');
                          else toast('error', 'Enter valid UPI format (e.g. name@upi)');
                        }}
                        className="btn-secondary text-xs px-3 py-2 shrink-0"
                      >
                        Verify ID
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-200 flex flex-col items-center">
                    <button
                      type="button"
                      onClick={() => setShowQr(!showQr)}
                      className="text-xs text-primary-600 font-semibold flex items-center gap-1 hover:underline mb-2"
                    >
                      <QrCode size={14} /> {showQr ? 'Hide UPI QR Code' : 'Scan QR with GooglePay / PhonePe / Paytm'}
                    </button>
                    {showQr && (
                      <div className="p-3 bg-white border border-gray-200 rounded-xl shadow-sm text-center">
                        <div className="w-36 h-36 bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center mx-auto mb-2 text-gray-400">
                          <QrCode size={80} className="text-gray-700" />
                        </div>
                        <p className="text-[11px] text-gray-500 font-mono">SCAN TO PAY {formatPrice(grandTotal)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* NET BANKING FORM */}
              {paymentMethod === 'NET_BANKING' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
                  <label className="label text-xs">Select Your Bank</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National Bank'].map((bank) => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => setSelectedBank(bank)}
                        className={`p-3 text-left border rounded-xl text-xs font-semibold transition-all ${selectedBank === bank ? 'border-primary-600 bg-white ring-2 ring-primary-500/20 text-primary-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* WALLET FORM */}
              {paymentMethod === 'WALLET' && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
                  <label className="label text-xs">Select Digital Wallet</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Paytm Wallet', 'PhonePe Wallet', 'Amazon Pay Balance', 'MobiKwik'].map((wallet) => (
                      <button
                        key={wallet}
                        type="button"
                        onClick={() => setSelectedWallet(wallet)}
                        className={`p-3 text-left border rounded-xl text-xs font-semibold transition-all ${selectedWallet === wallet ? 'border-primary-600 bg-white ring-2 ring-primary-500/20 text-primary-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                      >
                        {wallet}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* CASH ON PICKUP FORM */}
              {paymentMethod === 'CASH_ON_PICKUP' && (
                <div className="bg-green-50/50 border border-green-200 rounded-xl p-4 text-xs text-green-900 space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <CheckCircle2 size={16} className="text-green-600" /> Pay in Cash directly to Owner
                  </p>
                  <p className="text-green-800">You will pay {formatPrice(grandTotal)} directly when inspecting and receiving the tool at pickup.</p>
                </div>
              )}
            </div>

            {/* Order confirmation summary */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
                <h4 className="font-semibold text-gray-900 text-sm border-b border-gray-200 pb-2.5">Final Confirmation</h4>

                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Tool</span>
                    <span className="font-medium text-gray-900 truncate max-w-[140px]">{tool.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Rental Period</span>
                    <span className="font-medium text-gray-900">{rentalDays} Days</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fulfillment</span>
                    <span className="font-medium text-gray-900">{fulfillment === 'PICKUP' ? 'Self Pickup' : 'Delivery'}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-gray-200/60">
                    <span>Total Amount</span>
                    <span className="font-bold text-gray-900">{formatPrice(grandTotal)}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 space-y-2">
                  <button
                    type="button"
                    onClick={handlePayAndBook}
                    className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-sm font-semibold shadow-md bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800"
                  >
                    <Lock size={16} /> Pay {formatPrice(grandTotal)} Now
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-ghost w-full py-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    ← Back to Rental Details
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
                  <Shield size={13} className="text-green-500" />
                  <span>256-Bit SSL Encrypted Mock Gateway</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Processing Overlay */}
        {step === 3 && (
          <div className="py-12 px-4 text-center space-y-6">
            <div className="relative inline-flex items-center justify-center">
              <div className="w-20 h-20 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center text-primary-600">
                <Lock size={28} />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Processing Your Rental & Payment</h3>
              <p className="text-sm text-gray-600 animate-pulse">{processingMessage}</p>
            </div>

            <div className="max-w-xs mx-auto p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-500 flex items-center gap-2 justify-center">
              <Shield size={14} className="text-green-600" />
              <span>Verifying with ToolShare API Gateway</span>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
