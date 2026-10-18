import React, { useState } from 'react';
import { X, Calendar, MapPin, IndianRupee, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { CropListing } from '../../types';
import { dataService } from '../../services/dataService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  listing: CropListing;
  onClose: () => void;
  onSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  listing,
  onClose,
  onSuccess,
}) => {
  const { showToast } = useToast();
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();

  const [quantity, setQuantity] = useState<number>(Math.min(50, listing.quantityAvailable));
  const [proposedPrice, setProposedPrice] = useState<number>(listing.expectedPrice);
  const [deliveryDate, setDeliveryDate] = useState<string>(listing.expectedHarvestDate);
  const [deliveryLocation, setDeliveryLocation] = useState<string>('APMC Wholesale Warehouse, Mumbai/Nashik');
  const [message, setMessage] = useState<string>(
    `We reviewed your verified Crop Passport (${listing.publicPassportId}) with score ${listing.passportScore}/100 and would like to pre-book this lot.`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      showToast('Quantity must be greater than zero.', 'error');
      return;
    }
    if (quantity > listing.quantityAvailable) {
      showToast(`Quantity cannot exceed available stock (${listing.quantityAvailable} ${listing.quantityUnit}).`, 'error');
      return;
    }

    setIsSubmitting(true);
    const result = dataService.createBooking({
      buyerId: currentUser?.id || 'buyer-1',
      buyerName: currentUser?.fullName || 'Institutional Buyer',
      farmerId: listing.farmerId,
      listingId: listing.id,
      cropName: listing.cropName,
      requestedQuantity: quantity,
      quantityUnit: listing.quantityUnit,
      proposedPrice: proposedPrice,
      deliveryDate: deliveryDate,
      deliveryLocation: deliveryLocation.trim(),
      message: message.trim(),
    });

    setIsSubmitting(false);

    if (result.success) {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback
      }
      showToast(result.message, 'success');
      onSuccess();
      onClose();
    } else {
      showToast(result.message, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-emerald-900/10 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
            Pre-Harvest Advance Booking
          </span>
          <h3 className="text-lg font-extrabold text-slate-900 mt-1">
            Pre-Book {listing.cropName}
          </h3>
          <p className="text-xs text-slate-500">
            Farmer: {listing.farmerName} • Passport: <span className="font-mono font-bold text-emerald-700">{listing.publicPassportId}</span> (Score {listing.passportScore}/100)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Requested Quantity ({listing.quantityUnit}) *
              </label>
              <input
                type="number"
                min="1"
                max={listing.quantityAvailable}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700"
                required
              />
              <span className="text-[10px] text-slate-400">
                Available: {listing.quantityAvailable} {listing.quantityUnit}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Offered Price (₹ / {listing.quantityUnit}) *
              </label>
              <input
                type="number"
                min="1"
                value={proposedPrice}
                onChange={(e) => setProposedPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700"
                required
              />
              <span className="text-[10px] text-slate-400">
                Listing Price: ₹{listing.expectedPrice}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Delivery Date *
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Delivery / APMC Location *
              </label>
              <input
                type="text"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Message to Farmer (Quality specs, packaging requirements)
            </label>
            <textarea
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Mandatory Pre-Harvest Booking Disclaimer */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span className="leading-tight text-[11px]">
              {t.disclaimer.bookingText}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting...' : 'Send Pre-Harvest Booking Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
