import React, { useState } from 'react';
import {
  ShoppingBag,
  Inbox,
  FileCheck2,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  MapPin,
  CheckCircle2,
  QrCode,
  Camera,
  Search,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { ScoreRing } from '../../components/common/ScoreRing';
import { BookingStatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { VoiceGuidance } from '../../components/common/VoiceGuidance';
import { BuyerPassportScannerModal } from '../../components/buyer/BuyerPassportScannerModal';

interface BuyerDashboardProps {
  navigate: (path: string) => void;
}

export const BuyerDashboard: React.FC<BuyerDashboardProps> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const { language, t } = useLanguage();
  const [showScannerModal, setShowScannerModal] = useState(false);

  const listings = dataService.getListings();
  const bookings = dataService.getBookings('buyer-1', 'buyer');
  const requirements = dataService.getRequirements();

  const acceptedBookings = bookings.filter((b) => b.status === 'Accepted');

  // Stats for the top featured listing (e.g. Tomato FS-8X29KQ)
  const topListing = listings[0];
  const topStats = topListing
    ? dataService.getPassportPreBookingStats(
        topListing.publicPassportId,
        topListing.passportScore
      )
    : { preBookedPercentage: 33, eligibleCount: 1 };

  const spokenHindi = `खरीदार मंच पर आपका स्वागत है। मुख्य फसल ${
    topListing?.cropNameHi || 'टमाटर'
  } का पासपोर्ट स्कोर 100 में से ${
    topListing?.passportScore || 83
  } है। पात्र खरीदारों द्वारा ${
    topStats.preBookedPercentage
  }% मात्रा प्री-बुक की जा चुकी है, जिसमें ${
    topStats.eligibleCount
  } खरीद प्रस्ताव स्कोर पात्रता पूरी करते हैं। आप नीचे क्यूआर कोड स्कैन करके किसान का डिजिटल पासपोर्ट सीधे खोल सकते हैं।`;

  const spokenEnglish = `Welcome to the Buyer Sourcing Dashboard. Top featured crop is ${
    topListing?.cropName || 'Tomato'
  } with a Passport Score of ${
    topListing?.passportScore || 83
  }. ${
    topStats.preBookedPercentage
  }% of crop volume is pre-booked by eligible buyers, with ${
    topStats.eligibleCount
  } qualifying purchase interests meeting the score threshold. Use the QR scanner or enter a Passport ID below to inspect field documentation.`;

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-4 sm:p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-bold mb-1.5">
            <ShoppingBag className="w-3.5 h-3.5 text-emerald-300" />
            <span>Buyer & Institutional Sourcing</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {currentUser?.fullName || 'AgriMart Procurement'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-1">
            Pre-harvest contract monitoring and verified Crop Passport discovery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScannerModal(true)}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95 border border-emerald-500/50"
          >
            <QrCode className="w-4 h-4 text-emerald-200" />
            <span>{t.buyerPassportQr.scanQrBtn}</span>
          </button>
          <button
            onClick={() => navigate('/buyer/marketplace')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-emerald-950 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-800" />
            <span>Browse Produce</span>
          </button>
        </div>
      </div>

      {/* Spoken Voice Guidance for Screen 3 */}
      <VoiceGuidance
        englishText={spokenEnglish}
        hindiText={spokenHindi}
        compact
      />

      {/* PROMINENT SECTION: SCAN OR OPEN FARMER PASSPORT */}
      <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-emerald-700/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 text-[10px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Direct Passport Access</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white">
              {t.buyerPassportQr.sectionTitle}
            </h2>
            <p className="text-xs text-slate-300 max-w-xl">
              {t.buyerPassportQr.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowScannerModal(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 active:scale-95"
            >
              <Camera className="w-4 h-4" />
              <span>{t.buyerPassportQr.scanQrBtn}</span>
            </button>
            <button
              onClick={() => setShowScannerModal(true)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-600 shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Search className="w-4 h-4 text-slate-400" />
              <span>{t.buyerPassportQr.openLinkBtn}</span>
            </button>
          </div>
        </div>

        {/* Quick Demo Access Bar */}
        <div className="mt-4 pt-3 border-t border-emerald-800/60 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase whitespace-nowrap">
            Try Sample Passport:
          </span>
          <button
            onClick={() => navigate('/passport/FS-8X29KQ')}
            className="px-3 py-1 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-200 text-[11px] font-mono font-bold whitespace-nowrap flex items-center gap-1 transition-colors"
          >
            <span>FS-8X29KQ (Tomato • Score 83)</span>
            <ExternalLink className="w-3 h-3 text-emerald-400" />
          </button>
          <button
            onClick={() => navigate('/passport/FS-MH742P')}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono font-bold whitespace-nowrap flex items-center gap-1 transition-colors"
          >
            <span>FS-MH742P (Chana • Score 78)</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/buyer/marketplace')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-900/10 shadow-xs cursor-pointer hover:border-emerald-700 transition-all"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Available Listings</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{listings.length} Lots</div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Inspect passports →</span>
        </div>

        <div
          onClick={() => navigate('/buyer/requests')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-900/10 shadow-xs cursor-pointer hover:border-emerald-700 transition-all"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Active Bookings</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{bookings.length}</div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Track status →</span>
        </div>

        <div
          onClick={() => navigate('/buyer/requests')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-900/10 shadow-xs cursor-pointer hover:border-emerald-700 transition-all"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Accepted Orders</span>
          <div className="text-2xl font-black text-emerald-900 mt-1">{acceptedBookings.length}</div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Confirmed pre-harvest</span>
        </div>

        <div
          onClick={() => navigate('/buyer/requirements')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-900/10 shadow-xs cursor-pointer hover:border-emerald-700 transition-all"
        >
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Demand Requirements</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{requirements.length}</div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">Manage demand →</span>
        </div>
      </div>

      {/* Recommended Produce Listings Preview with Pre-Booking Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">
            {language === 'hi'
              ? 'कटाई-पूर्व अग्रिम बुकिंग के लिए अनुशंसित फसलें'
              : 'Recommended Verified Crops Ready for Pre-Booking'}
          </h2>
          <button
            onClick={() => navigate('/buyer/marketplace')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950"
          >
            View All ({listings.length}) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.slice(0, 2).map((l) => {
            const stats = dataService.getPassportPreBookingStats(
              l.publicPassportId,
              l.passportScore
            );

            return (
              <div
                key={l.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase">
                        {l.publicPassportId}
                      </span>
                      <h3 className="text-base font-black text-slate-900">
                        {language === 'hi' && l.cropNameHi ? l.cropNameHi : l.cropName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Farmer: {l.farmerName} • {l.generalLocation}
                      </p>
                    </div>
                    <ScoreRing score={l.passportScore} size="sm" showGrade={false} />
                  </div>

                  {/* Pre-Booking Progress Bar */}
                  <div className="mt-3 bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                    <div className="flex items-center justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-700">
                        {language === 'hi' ? 'प्री-बुकिंग स्थिति:' : 'Pre-Booked:'}
                      </span>
                      <span className="font-extrabold text-emerald-900">
                        {stats.preBookedPercentage}% ({stats.eligibleQuantity} / {stats.totalQuantity} {stats.unit})
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${stats.preBookedPercentage}%` }}
                      ></div>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 flex items-center justify-between">
                      <span>
                        {stats.eligibleCount} {language === 'hi' ? 'पात्र खरीदार प्रस्ताव' : 'eligible buyer interest(s)'}
                      </span>
                      {stats.ineligibleCount > 0 && (
                        <span className="text-amber-700">
                          {stats.ineligibleCount} {language === 'hi' ? 'अपात्र (उच्च स्कोर मांग)' : 'held (score deficit)'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 my-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Available Qty</span>
                      <span className="font-extrabold text-slate-800">
                        {l.quantityAvailable} {l.quantityUnit}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Expected Price</span>
                      <span className="font-extrabold text-slate-800">
                        ₹{l.expectedPrice} / {l.quantityUnit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => navigate(`/passport/${l.publicPassportId}`)}
                    className="px-3.5 py-2 rounded-xl border border-emerald-800 text-emerald-900 hover:bg-emerald-50 text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Inspect Passport</span>
                  </button>
                  <button
                    onClick={() => navigate(`/passport/${l.publicPassportId}`)}
                    className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    {language === 'hi' ? 'खरीद रुचि दर्ज करें' : 'Show Interest'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for QR Code Scanner & Manual Link Opener */}
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
