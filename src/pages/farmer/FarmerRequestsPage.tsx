import React, { useState } from 'react';
import {
  Inbox,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Clock,
  Calendar,
  MapPin,
  IndianRupee,
  ShieldAlert,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { BookingStatusBadge } from '../../components/common/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import confetti from 'canvas-confetti';

export const FarmerRequestsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const bookings = dataService.getBookings('farmer-1', 'farmer');

  const handleStatusChange = (bookingId: string, newStatus: 'Accepted' | 'Rejected' | 'Under Discussion') => {
    const result = dataService.updateBookingStatus(
      bookingId,
      newStatus,
      'farmer-1',
      'farmer',
      `Farmer responded: ${newStatus}`
    );

    if (result.success) {
      if (newStatus === 'Accepted') {
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}
      }
      showToast(result.message, 'success');
      setRefreshKey(prev => prev + 1);
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-4 sm:p-6 rounded-2xl text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-bold mb-2">
            <Inbox className="w-3.5 h-3.5 text-emerald-300" />
            <span>Pre-Harvest Contracts Inbox</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {language === 'hi' ? 'खरीदारों के अग्रिम प्रस्ताव' : 'Buyer Inquiries & Bookings'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-1.5 leading-relaxed">
            {language === 'hi'
              ? 'खरीदारों ने आपके क्रॉप पासपोर्ट का सत्यापन करके अग्रिम खरीद प्रस्ताव भेजे हैं।'
              : 'Review pre-harvest booking inquiries submitted by buyers based on your verified Crop Passport.'}
          </p>
        </div>
      </div>

      {/* Mandatory Notice */}
      <div className="p-3 sm:p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Notice on Pre-Harvest Bookings:</span>
          <span>{t.disclaimer.bookingText}</span>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Incoming Inquiries ({bookings.length})
        </h2>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400 text-xs">
            No booking inquiries received yet. Publish your crops in the marketplace to receive buyer inquiries.
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => {
              const isPending = b.status === 'Submitted' || b.status === 'Under Discussion';

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {b.id}
                        </span>
                        <BookingStatusBadge status={b.status} size="sm" />
                      </div>
                      <h3 className="text-lg font-black text-slate-900">
                        {b.cropName} • {b.requestedQuantity} {b.quantityUnit}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Buyer: <strong className="text-slate-800">{b.buyerName}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-semibold">Offered Price</span>
                      <span className="text-xl font-black text-emerald-900">
                        ₹{b.proposedPrice}
                      </span>
                      <span className="text-[10px] text-slate-400">/ {b.quantityUnit}</span>
                    </div>
                  </div>

                  {/* Booking Specifics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Delivery Target: <strong>{b.deliveryDate}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700">
                      <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Location: <strong>{b.deliveryLocation}</strong></span>
                    </div>
                  </div>

                  {b.message && (
                    <div className="p-3 rounded-xl bg-slate-50 text-xs text-slate-700 border border-slate-100 italic">
                      "{b.message}"
                    </div>
                  )}

                  {/* Actions for Farmer */}
                  {isPending && (
                    <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(b.id, 'Under Discussion')}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
                      >
                        Propose Terms
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(b.id, 'Rejected')}
                        className="px-4 py-2 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 text-xs font-bold transition-colors"
                      >
                        Reject
                      </button>

                      <button
                        type="button"
                        onClick={() => handleStatusChange(b.id, 'Accepted')}
                        className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Pre-Harvest Booking</span>
                      </button>
                    </div>
                  )}

                  {!isPending && (
                    <div className="text-right text-[11px] text-slate-400 pt-1">
                      Status: <strong>{b.status}</strong> • Last updated {new Date(b.updatedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
