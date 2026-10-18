import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  MapPin,
  ExternalLink,
  ArrowRight,
  QrCode,
  FileCheck2,
  TrendingUp,
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { CropListing } from '../types';
import { ScoreRing } from '../components/common/ScoreRing';
import { EvidenceStatusBadge } from '../components/common/StatusBadge';
import { BookingModal } from '../components/marketplace/BookingModal';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { BuyerPassportScannerModal } from '../components/buyer/BuyerPassportScannerModal';

interface MarketplacePageProps {
  navigate: (path: string) => void;
}

export const MarketplacePage: React.FC<MarketplacePageProps> = ({ navigate }) => {
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [minScore, setMinScore] = useState<number>(0);
  const [bookingListing, setBookingListing] = useState<CropListing | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);

  const listings = dataService.getListings();

  const filteredListings = listings.filter((l: CropListing) => {
    if (selectedCrop !== 'all' && !l.cropName.toLowerCase().includes(selectedCrop.toLowerCase())) {
      return false;
    }
    if (minScore > 0 && l.passportScore < minScore) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        l.cropName.toLowerCase().includes(q) ||
        l.generalLocation.toLowerCase().includes(q) ||
        l.publicDisplayName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenBooking = (listing: CropListing) => {
    if (listing.quantityAvailable <= 0) {
      showToast('This lot is fully booked.', 'warning');
      return;
    }
    setBookingListing(listing);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-4 sm:p-6 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-bold mb-2">
            <ShoppingBag className="w-4 h-4 text-emerald-300" />
            <span>Direct Farmer-to-Buyer Pre-Harvest Marketplace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {language === 'hi' ? 'कटाई-पूर्व फसल मंडी' : 'Pre-Harvest Produce Marketplace'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-1.5 leading-relaxed">
            {language === 'hi'
              ? 'खेतों में बढ़ रही सत्यापित फसलों को खोजें, पासपोर्ट स्कोर देखें और कटाई से पहले सुरक्षित अग्रिम बुकिंग करें।'
              : 'Discover standing crops progressing in fields. Inspect season-long Crop Passports and secure pre-harvest contracts.'}
          </p>
        </div>

        <button
          onClick={() => setShowScannerModal(true)}
          className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-emerald-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-2 self-start sm:self-auto shrink-0 active:scale-95"
        >
          <QrCode className="w-4 h-4 text-emerald-800" />
          <span>{t.buyerPassportQr.scanQrBtn}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl border border-emerald-900/10 shadow-sm p-4 sm:p-5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by crop, region, or farmer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="sm:col-span-3">
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-emerald-700 bg-white"
            >
              <option value="all">All Crops</option>
              <option value="Tomato">Tomato</option>
              <option value="Chana">Chana (Bengal Gram)</option>
              <option value="Mustard">Mustard</option>
              <option value="Onion">Onion</option>
            </select>
          </div>

          <div className="sm:col-span-4 flex items-center gap-2">
            <span className="text-xs font-bold text-slate-600 shrink-0">Min Score:</span>
            <input
              type="range"
              min="0"
              max="90"
              step="10"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full accent-emerald-800"
            />
            <span className="text-xs font-black text-emerald-900 w-8 text-right">
              {minScore}+
            </span>
          </div>
        </div>
      </div>

      {/* Produce Listings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredListings.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Crops Match Your Filters</h3>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your minimum Passport Score or search keywords.
            </p>
          </div>
        ) : (
          filteredListings.map((listing: CropListing) => {
            const stats = dataService.getPassportPreBookingStats(
              listing.publicPassportId,
              listing.passportScore
            );

            return (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-emerald-900/10 shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Photo or Crop Banner */}
                  {listing.sampleImageUrl && (
                    <div className="relative h-40 sm:h-48 bg-slate-900">
                      <img
                        src={listing.sampleImageUrl}
                        alt={listing.cropName}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-mono font-bold bg-black/70 text-emerald-300 px-2.5 py-1 rounded-md backdrop-blur-xs">
                          {listing.publicPassportId}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs rounded-xl p-1.5 shadow-sm">
                        <ScoreRing score={listing.passportScore} size="sm" showGrade={false} />
                      </div>
                    </div>
                  )}

                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">
                          {language === 'hi' && listing.cropNameHi ? listing.cropNameHi : listing.cropName}{' '}
                          {listing.variety ? `(${listing.variety})` : ''}
                        </span>
                        <h3 className="text-base font-black text-slate-900 mt-0.5">
                          {listing.publicDisplayName}
                        </h3>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{listing.generalLocation}</span>
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-xs text-slate-400 font-semibold block">Asking Price</span>
                        <span className="text-xl font-black text-slate-900">
                          ₹{listing.expectedPrice}
                        </span>
                        <span className="text-[10px] text-slate-400">/ {listing.quantityUnit}</span>
                      </div>
                    </div>

                    {/* Pre-Booking Metric Tag */}
                    <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Pre-Booked:</span>
                      </span>
                      <span className="font-extrabold text-emerald-900">
                        {stats.preBookedPercentage}% ({stats.eligibleQuantity}/{stats.totalQuantity} {stats.unit})
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {listing.publicDescription}
                    </p>

                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Available Quantity</span>
                        <span className="font-extrabold text-slate-800">
                          {listing.quantityAvailable} {listing.quantityUnit}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">Harvest Window</span>
                        <span className="font-extrabold text-slate-800">
                          {listing.expectedHarvestDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500 font-medium text-[11px]">Supporting Evidence:</span>
                      <EvidenceStatusBadge
                        status={listing.evidenceSummary.evidenceStatus}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/passport/${listing.publicPassportId}`)}
                    className="px-4 py-2 rounded-xl border border-emerald-800 text-emerald-900 hover:bg-emerald-100/50 text-xs font-bold transition-colors flex items-center gap-1"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Inspect Passport</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate(`/passport/${listing.publicPassportId}`)}
                    className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1 active:scale-95"
                  >
                    <span>{language === 'hi' ? 'खरीद रुचि दर्ज करें' : 'Show Interest'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Booking Modal */}
      {bookingListing && (
        <BookingModal
          listing={bookingListing}
          onClose={() => setBookingListing(null)}
          onSuccess={() => {
            showToast('Pre-booking request submitted successfully!', 'success');
            setBookingListing(null);
          }}
        />
      )}

      {/* Buyer Passport QR Scanner Modal */}
      {showScannerModal && (
        <BuyerPassportScannerModal
          onClose={() => setShowScannerModal(false)}
          onSelectPassport={(id) => {
            setShowScannerModal(false);
            navigate(`/passport/${id}`);
          }}
        />
      )}
    </div>
  );
};
