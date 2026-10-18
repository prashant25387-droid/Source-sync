import React, { useState } from 'react';
import {
  Inbox,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck2,
  ExternalLink,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { BookingStatusBadge } from '../../components/common/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface BuyerRequestsPageProps {
  navigate: (path: string) => void;
}

export const BuyerRequestsPage: React.FC<BuyerRequestsPageProps> = ({ navigate }) => {
  const { language } = useLanguage();
  const { showToast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const bookings = dataService.getBookings('buyer-1', 'buyer');

  const handleCancel = (bookingId: string) => {
    if (confirm('Cancel this pre-harvest booking request?')) {
      const result = dataService.updateBookingStatus(
        bookingId,
        'Cancelled',
        'buyer-1',
        'buyer',
        'Cancelled by buyer before confirmation'
      );
      if (result.success) {
        showToast('Booking request cancelled.', 'info');
        setRefreshKey(prev => prev + 1);
      }
    }
  };

  return (
    <div className="space-y-4 pb-6">
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-4 sm:p-6 rounded-2xl text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-bold mb-2">
            <Inbox className="w-3.5 h-3.5 text-emerald-300" />
            <span>Pre-Harvest Commitments</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {language === 'hi' ? 'मेरी अग्रिम बुकिंग और प्रस्ताव' : 'My Booking Inquiries'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-1">
            Track status updates on your pre-harvest produce commitments directly with farmers.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Submitted Bookings ({bookings.length})
        </h2>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400 text-xs">
            You have not submitted any pre-harvest bookings yet. Browse the marketplace to find verified produce.
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {b.id}
                      </span>
                      <BookingStatusBadge status={b.status} size="sm" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900">
                      {b.cropName} • {b.requestedQuantity} {b.quantityUnit}
                    </h3>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block font-semibold">Offered Price</span>
                    <span className="text-xl font-black text-emerald-900">
                      ₹{b.proposedPrice}
                    </span>
                    <span className="text-[10px] text-slate-400">/ {b.quantityUnit}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Target Delivery: <strong>{b.deliveryDate}</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Location: <strong>{b.deliveryLocation}</strong></span>
                  </div>
                </div>

                {b.message && (
                  <p className="text-xs text-slate-600 italic">
                    "{b.message}"
                  </p>
                )}

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Created: {new Date(b.createdAt).toLocaleDateString()}
                  </span>

                  {b.status === 'Submitted' && (
                    <button
                      onClick={() => handleCancel(b.id)}
                      className="text-xs font-bold text-red-600 hover:text-red-800"
                    >
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
