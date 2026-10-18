import React, { useState } from 'react';
import {
  Layers,
  Plus,
  Sparkles,
  ExternalLink,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { marketplaceService, MatchResult } from '../../services/marketplaceService';
import { BuyerRequirement, CropListing } from '../../types';
import { ScoreRing } from '../../components/common/ScoreRing';
import { BookingModal } from '../../components/marketplace/BookingModal';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

export const BuyerRequirementsPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { showToast } = useToast();
  const { language } = useLanguage();

  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState<string>('');
  const [bookingListing, setBookingListing] = useState<CropListing | null>(null);

  // Form states
  const [cropName, setCropName] = useState('Tomato');
  const [quantity, setQuantity] = useState(100);
  const [targetPrice, setTargetPrice] = useState(1500);
  const [requiredDate, setRequiredDate] = useState('2027-01-15');
  const [location, setLocation] = useState('Nashik, Maharashtra');
  const [minScore, setMinScore] = useState(70);

  const requirements = dataService.getRequirements();
  const activeReq = requirements.find(r => r.id === selectedReqId) || requirements[0];
  const listings = dataService.getListings();

  const matches: MatchResult[] = activeReq
    ? marketplaceService.findMatchesForRequirement(listings, activeReq)
    : [];

  const handleAddRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    const newReq = dataService.addRequirement({
      buyerId: 'buyer-1',
      buyerName: 'AgriMart Procurement Ltd',
      cropName,
      quantity,
      quantityUnit: 'Quintals',
      targetPrice,
      requiredDate,
      location,
      minPassportScore: minScore,
      status: 'Open',
    });

    showToast('Requirement posted! Matching with available crop listings.', 'success');
    setSelectedReqId(newReq.id);
    setShowAddForm(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-4 sm:p-6 rounded-2xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-bold mb-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-300" />
            <span>Institutional Procurement</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {language === 'hi' ? 'खरीदार आवश्यकताएं और फसल मिलान' : 'Buyer Requirements & Matching'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-1">
            Specify crop demand, volume, and minimum passport score. Our algorithm matches active farmer crops.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-emerald-950 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 text-emerald-800" />
          <span>{showAddForm ? 'Close' : 'Post Demand'}</span>
        </button>
      </div>

      {/* Post Requirement Form */}
      {showAddForm && (
        <form onSubmit={handleAddRequirement} className="bg-white rounded-2xl border border-emerald-900/15 p-4 sm:p-6 shadow-xs space-y-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
            Post Institutional Crop Demand
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Crop Needed *
              </label>
              <select
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-700"
              >
                <option value="Tomato">Tomato (Hybrid)</option>
                <option value="Chana">Chana (Bengal Gram)</option>
                <option value="Mustard">Mustard (Sarson)</option>
                <option value="Onion">Rabi Onion</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Quantity (Quintals) *
              </label>
              <input
                type="number"
                min="10"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Buying Price (₹/Quintal) *
              </label>
              <input
                type="number"
                min="100"
                value={targetPrice}
                onChange={(e) => setTargetPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Required Delivery Date *
              </label>
              <input
                type="date"
                value={requiredDate}
                onChange={(e) => setRequiredDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Delivery Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Min. Passport Score Required (0-100)
              </label>
              <input
                type="number"
                min="0"
                max="90"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs shadow-xs hover:bg-emerald-900"
            >
              Post & Run Matching
            </button>
          </div>
        </form>
      )}

      {/* Select Requirement to Match */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {requirements.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReqId(r.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeReq?.id === r.id
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {r.cropName} ({r.quantity} {r.quantityUnit} @ ₹{r.targetPrice})
            </button>
          ))}
        </div>

        {activeReq && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Matches for: {activeReq.cropName} ({activeReq.quantity} {activeReq.quantityUnit})
                </h3>
                <p className="text-xs text-slate-500">
                  Target: ₹{activeReq.targetPrice}/{activeReq.quantityUnit} • Delivery: {activeReq.requiredDate} • Min Score: {activeReq.minPassportScore || 0}
                </p>
              </div>

              <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
                {matches.length} Matches Found
              </span>
            </div>

            {matches.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No active farmer listings meet this criteria currently. Try relaxing minimum score or date requirements.
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match) => (
                  <div
                    key={match.listing.id}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-emerald-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-700">
                          {match.listing.publicPassportId}
                        </span>
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Match Score: {match.overallScore}%
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          Passport Score: {match.listing.passportScore}/100
                        </span>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900">
                        {match.listing.cropName} • {match.listing.farmerName}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        {match.explanation}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2">
                        <span>Available: <strong>{match.listing.quantityAvailable} {match.listing.quantityUnit}</strong></span>
                        <span>Price: <strong>₹{match.listing.expectedPrice}</strong></span>
                        <span>Harvest: <strong>{match.listing.expectedHarvestDate}</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                      <button
                        onClick={() => navigate(`/passport/${match.listing.publicPassportId}`)}
                        className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-100 text-xs font-bold transition-colors"
                      >
                        Inspect Passport
                      </button>
                      <button
                        onClick={() => setBookingListing(match.listing)}
                        className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        Pre-Book
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {bookingListing && (
        <BookingModal
          listing={bookingListing}
          onClose={() => setBookingListing(null)}
          onSuccess={() => {
            showToast('Booking request sent to farmer!', 'success');
          }}
        />
      )}
    </div>
  );
};
