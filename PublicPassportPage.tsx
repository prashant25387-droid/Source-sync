import React, { useState } from 'react';
import {
  FileCheck2,
  Clock,
  Camera,
  ShieldCheck,
  ShieldAlert,
  Printer,
  Lock,
  Flag,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  Send,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { dataService } from '../services/dataService';
import { ScoreRing } from '../components/common/ScoreRing';
import { EvidenceStatusBadge } from '../components/common/StatusBadge';
import { PassportScoreBreakdown } from '../components/passport/PassportScoreBreakdown';
import { BookingModal } from '../components/marketplace/BookingModal';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { CropEvidence, CropLog, CropListing } from '../types';
import { VoiceGuidance } from '../components/common/VoiceGuidance';

interface PublicPassportPageProps {
  publicId: string;
  navigate: (path: string) => void;
}

export const PublicPassportPage: React.FC<PublicPassportPageProps> = ({
  publicId,
  navigate,
}) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [reported, setReported] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Purchase Interest Form State
  const [buyerName, setBuyerName] = useState('');
  const [reqQty, setReqQty] = useState<number | ''>(25);
  const [offerPrice, setOfferPrice] = useState<number | ''>(1500);
  const [desiredMonth, setDesiredMonth] = useState('January 2027');
  const [minScore, setMinScore] = useState<number>(75);
  const [isSubmittingInterest, setIsSubmittingInterest] = useState(false);

  const passport = dataService.getPassportByPublicId(publicId);
  const crop = passport ? dataService.getCrop(passport.cropRecordId) : null;
  const logs = crop ? dataService.getLogs(crop.id) : [];
  const allEvidence = crop ? dataService.getEvidence(crop.id) : [];

  // Filter evidence: only photos with public sharing enabled
  const publicEvidence = allEvidence.filter(
    (e: CropEvidence) => e.publicSharingEnabled
  );

  // Associated marketplace listing if available
  const listing = dataService
    .getListings()
    .find((l: CropListing) => l.publicPassportId === publicId);

  // Calculate pre-booking stats strictly checking buyer.minPassportScore <= currentScore
  const preBookingStats = passport
    ? dataService.getPassportPreBookingStats(publicId, passport.score)
    : {
        totalQuantity: 100,
        unit: 'Quintals',
        preBookedPercentage: 0,
        eligibleQuantity: 0,
        ineligibleQuantity: 0,
        eligibleCount: 0,
        ineligibleCount: 0,
        interests: [],
      };

  // If passport not found
  if (!passport || !crop) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-700 mb-4">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          {language === 'hi' ? 'क्रॉप पासपोर्ट नहीं मिला' : 'Crop Passport Not Found'}
        </h2>
        <p className="text-xs text-slate-500 mt-2">
          {language === 'hi'
            ? `पासपोर्ट पहचानकर्ता "${publicId}" मौजूद नहीं है या हटा दिया गया है।`
            : `The requested Passport identifier "${publicId}" does not exist or has been removed.`}
        </p>
        <button
          onClick={() => navigate('/marketplace')}
          className="mt-6 px-6 py-2.5 rounded-xl bg-emerald-800 text-white font-bold text-xs"
        >
          {language === 'hi' ? 'उपलब्ध फसल मंडी देखें' : 'Explore Available Produce Marketplace'}
        </button>
      </div>
    );
  }

  // If farmer has disabled public sharing
  if (!passport.publicSharingEnabled) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">
          {language === 'hi' ? 'पासपोर्ट साझाकरण बंद है' : 'Passport Access Restricted'}
        </h2>
        <p className="text-xs text-slate-500 mt-2">
          {language === 'hi'
            ? `किसान ने इस पासपोर्ट (${publicId}) को निजी रखा हुआ है। सार्वजनिक दृश्य अनुपलब्ध है।`
            : `The farmer has set this Crop Passport (${publicId}) to private. Public viewing is currently disabled.`}
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-6 px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs"
        >
          {language === 'hi' ? 'होम पेज पर लौटें' : 'Return to Home'}
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleReport = () => {
    if (confirm('Report this passport for inaccurate records or suspicious submissions?')) {
      setReported(true);
      showToast('Report submitted for agronomist review. Thank you for keeping FasalSetu transparent.', 'info');
    }
  };

  const handleSubmitInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName.trim()) {
      showToast(
        language === 'hi' ? 'कृपया खरीदार का नाम दर्ज करें' : 'Please enter buyer name',
        'error'
      );
      return;
    }
    if (!reqQty || reqQty <= 0) {
      showToast(
        language === 'hi' ? 'कृपया मान्य मात्रा दर्ज करें' : 'Please enter valid quantity',
        'error'
      );
      return;
    }

    setIsSubmittingInterest(true);

    try {
      const res = dataService.submitPurchaseInterest({
        publicPassportId: publicId,
        buyerName: buyerName.trim(),
        requestedQuantity: Number(reqQty),
        offerPrice: Number(offerPrice) || (crop.expectedPricePerUnit || 1500),
        desiredMonth,
        minPassportScore: Number(minScore),
      });

      setIsSubmittingInterest(false);
      showToast(res.message, res.isEligible ? 'success' : 'info');
      setBuyerName('');
      setRefreshKey((prev) => prev + 1);
    } catch (err: any) {
      setIsSubmittingInterest(false);
      showToast(err.message || 'Error submitting interest', 'error');
    }
  };

  // Screen 2 & 3 Spoken Summaries
  const spokenPassportHindi = `इस फसल का पासपोर्ट स्कोर 100 में से ${
    passport.score
  } है, जो ${
    passport.scoreBreakdown.gradeBadge
  } श्रेणी में आता है। जल प्रबंधन में 40 में से ${
    passport.scoreBreakdown.waterManagementScore
  } अंक, फसल देखभाल में 20 में से ${
    passport.scoreBreakdown.cropCareScore
  } अंक मिले हैं। अब तक कुल ${
    logs.length
  } गतिविधियां और ${publicEvidence.length} सत्यापित फोटो दर्ज हैं। पात्र खरीदारों द्वारा ${
    preBookingStats.preBookedPercentage
  }% मात्रा प्री-बुक की जा चुकी है।`;

  const spokenPassportEnglish = `This crop has a Passport Score of ${
    passport.score
  } out of 100, graded ${
    passport.scoreBreakdown.gradeBadge
  }. Water management score is ${
    passport.scoreBreakdown.waterManagementScore
  } of 40, and crop care score is ${
    passport.scoreBreakdown.cropCareScore
  } of 20, with ${
    logs.length
  } verified farming logs. ${
    preBookingStats.preBookedPercentage
  }% of expected yield is pre-booked by eligible buyers meeting the score threshold.`;

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-8 pt-1 px-1 sm:px-4">
      {/* Top Banner Notice for Buyers */}
      <div className="bg-emerald-900 text-white p-3 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-2.5 shadow-xs no-print">
        <div className="flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-emerald-300 shrink-0" />
          <div className="text-[11px] sm:text-xs">
            <span className="font-bold text-emerald-200">
              {language === 'hi' ? 'सार्वजनिक डिजिटल क्रॉप पासपोर्ट:' : 'Public Digital Crop Passport:'}
            </span>{' '}
            {language === 'hi'
              ? 'सत्यापित मौसम-भर का खेती रिकॉर्ड व खरीदार प्री-बुकिंग।'
              : 'Verified season documentation for buyers & food processors.'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors active:scale-95"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print</span>
          </button>

          {listing && (
            <button
              onClick={() => setShowBookingModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-white text-emerald-950 hover:bg-slate-100 text-xs font-bold shadow-xs flex items-center gap-1 transition-colors active:scale-95"
            >
              <span>Pre-Book Lot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Spoken Voice Guidance */}
      <VoiceGuidance
        englishText={spokenPassportEnglish}
        hindiText={spokenPassportHindi}
        compact
      />

      {/* QUICK COMMERCIAL ASSESSMENT FOR BUYERS (MESS / CLOUD KITCHEN / TRADER / FPO) */}
      <div className="bg-gradient-to-br from-emerald-950 to-slate-900 text-white rounded-3xl p-5 border border-emerald-600/40 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-800/80">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 text-[10px] font-bold mb-1">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-300" />
              <span>{t.quickBuyer.sectionTitle}</span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white">
              {crop.cropName} {crop.variety ? `(${crop.variety})` : ''} • {crop.farmName || 'Nashik'}
            </h2>
            <p className="text-xs text-slate-300">
              {t.quickBuyer.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-800/90 text-emerald-200 border border-emerald-500/50">
              {t.farmHistory.farmerLoggedBadge}
            </span>
          </div>
        </div>

        {/* 4 Quick Commercial Pillars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">{t.quickBuyer.reliability}</span>
            <div className="text-lg font-black text-emerald-300 mt-0.5">{passport.score}/100</div>
            <span className="text-[10px] text-slate-300 font-semibold">{passport.scoreBreakdown.gradeBadge} Grade</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">{t.quickBuyer.waterDiscipline}</span>
            <div className="text-lg font-black text-cyan-300 mt-0.5">{passport.scoreBreakdown.waterManagementScore}/40 pts</div>
            <span className="text-[10px] text-slate-300 font-semibold">{logs.filter(l => l.activityType === 'Irrigation').length} water logs</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">{t.quickBuyer.evidencePhotos}</span>
            <div className="text-lg font-black text-amber-300 mt-0.5">{publicEvidence.length} Photos</div>
            <span className="text-[10px] text-slate-300 font-semibold">Stage: {crop.growthStage}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-2xl border border-white/10">
            <span className="text-[10px] text-slate-400 block font-bold uppercase">{t.quickBuyer.preBookingIntent}</span>
            <div className="text-lg font-black text-emerald-300 mt-0.5">{preBookingStats.preBookedPercentage}% Booked</div>
            <span className="text-[10px] text-slate-300 font-semibold">{preBookingStats.eligibleCount} qualifying buyers</span>
          </div>
        </div>

        {/* Commercial Disclaimer */}
        <p className="text-[10px] text-slate-400 italic">
          {t.quickBuyer.nonGuaranteedDisclaimer}
        </p>
      </div>

      {/* Main Passport Header Card */}
      <div className="bg-white rounded-3xl border-2 border-emerald-900/15 shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-950 p-4 sm:p-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-700/80 text-emerald-200">
                PASSPORT: {passport.publicId}
              </span>
              <span className="text-[11px] text-emerald-300 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{t.farmHistory.farmerLoggedBadge}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white">
              {language === 'hi' && crop.cropNameHi ? crop.cropNameHi : crop.cropName}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200 mt-1">
              {crop.variety ? `Variety: ${crop.variety}` : ''} • Farm Region: {crop.farmName || 'Nashik, Maharashtra'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center shrink-0">
            <ScoreRing score={passport.score} size="md" showGrade={false} />
            <div className="text-[11px] font-bold text-emerald-300 mt-1 uppercase tracking-wider">
              {passport.scoreBreakdown.scoreGrade}
            </div>
          </div>
        </div>

        {/* Passport Content Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* Key Farming Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                {language === 'hi' ? 'बुवाई तिथि' : 'Planting Date'}
              </span>
              <span className="text-sm font-extrabold text-slate-800">
                {crop.plantingDate}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                {language === 'hi' ? 'अनुमानित कटाई' : 'Est. Harvest Date'}
              </span>
              <span className="text-sm font-extrabold text-slate-800">
                {crop.expectedHarvestDate}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                {language === 'hi' ? 'रकबा' : 'Cultivated Area'}
              </span>
              <span className="text-sm font-extrabold text-slate-800">
                {crop.cultivatedArea} {crop.cultivatedAreaUnit}
              </span>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold uppercase">
                {language === 'hi' ? 'अनुमानित उपज' : 'Est. Yield Volume'}
              </span>
              <span className="text-sm font-extrabold text-emerald-800">
                {crop.estimatedQuantity} {crop.quantityUnit}
              </span>
            </div>
          </div>

          {/* SECTION: PRE-HARVEST PURCHASE INTEREST & PRE-BOOKED PERCENTAGE */}
          <div className="bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-white rounded-2xl p-4 sm:p-5 border-2 border-emerald-500/40 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-200">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900 text-[10px] font-bold mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Pre-Harvest Pre-Booking</span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                  {t.buyerPassportQr.showInterestTitle}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'hi'
                    ? 'पात्र खरीद प्रस्ताव सीधे प्री-बुकिंग प्रतिशत में जुड़ते हैं।'
                    : 'Verified pre-bookings strictly count when buyer minimum score ≤ current Passport score.'}
                </p>
              </div>

              {/* Pre-Booked Percentage Highlight */}
              <div className="bg-white p-3 rounded-2xl border border-emerald-300 shadow-xs text-center shrink-0 min-w-[140px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  {t.buyerPassportQr.preBookedPercentage}
                </div>
                <div className="text-2xl font-black text-emerald-800">
                  {preBookingStats.preBookedPercentage}%
                </div>
                <div className="text-[10px] font-semibold text-slate-600">
                  {preBookingStats.eligibleQuantity} / {crop.estimatedQuantity} {crop.quantityUnit}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${preBookingStats.preBookedPercentage}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-medium">
                <span>
                  {preBookingStats.eligibleCount} {language === 'hi' ? 'पात्र खरीदार जुड़े' : 'qualifying buyer interests'}
                </span>
                <span>
                  {crop.estimatedQuantity - preBookingStats.eligibleQuantity > 0
                    ? `${crop.estimatedQuantity - preBookingStats.eligibleQuantity} ${crop.quantityUnit} ${
                        language === 'hi' ? 'उपलब्ध' : 'available'
                      }`
                    : language === 'hi'
                    ? 'पूर्णतः प्री-बुक्ड'
                    : 'Fully Pre-Booked'}
                </span>
              </div>
            </div>

            {/* Buyer Show Interest Form */}
            <form onSubmit={handleSubmitInterest} className="pt-2 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t.buyerPassportQr.buyerName} *
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="e.g. Reliance Retail / BigBasket"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t.buyerPassportQr.reqQty} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={crop.estimatedQuantity}
                    value={reqQty}
                    onChange={(e) =>
                      setReqQty(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="e.g. 50"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t.buyerPassportQr.offerPrice} *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={offerPrice}
                    onChange={(e) =>
                      setOfferPrice(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="e.g. 1500"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700 bg-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    {t.buyerPassportQr.minScore} *
                  </label>
                  <select
                    value={minScore}
                    onChange={(e) => setMinScore(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700 bg-white"
                  >
                    <option value={70}>Min 70 (Developing)</option>
                    <option value={75}>Min 75 (Well-Doc)</option>
                    <option value={80}>Min 80 (Well-Doc Gold)</option>
                    <option value={85}>Min 85 (High Grade)</option>
                    <option value={90}>Min 90 (Platinum Strict)</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 inline-block mb-1">
                    {t.farmHistory.preBookingBadge}
                  </span>
                  <p className="text-[10px] text-slate-500 italic max-w-xl">
                    {t.buyerPassportQr.interestDisclaimer}
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingInterest}
                  className="px-5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isSubmittingInterest
                      ? language === 'hi'
                        ? 'भेज रहे हैं...'
                        : 'Submitting...'
                      : t.buyerPassportQr.submitInterestBtn}
                  </span>
                </button>
              </div>
            </form>

            {/* List of Submitted Purchase Interests with Eligibility Tagging */}
            {preBookingStats.interests.length > 0 && (
              <div className="pt-3 border-t border-emerald-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  {language === 'hi' ? 'प्राप्त खरीद प्रस्ताव व पात्रता स्थिति:' : 'Submitted Purchase Interests & Eligibility:'}
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {preBookingStats.interests.map((interest) => {
                    const isEligible = (interest.minPassportScore ?? 0) <= passport.score;

                    return (
                      <div
                        key={interest.id}
                        className={`p-3 rounded-xl border text-xs flex flex-col justify-between ${
                          isEligible
                            ? 'bg-white border-emerald-300 shadow-2xs'
                            : 'bg-amber-50/50 border-amber-200 opacity-90'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {interest.buyerName}
                            </span>
                            <span className="text-[11px] text-slate-600">
                              {interest.requestedQuantity} {crop.quantityUnit} @ ₹
                              {interest.proposedPrice}/{crop.quantityUnit}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                              isEligible
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-amber-100 text-amber-900 border border-amber-300'
                            }`}
                          >
                            Min Score: {interest.minPassportScore ?? 'None'}
                          </span>
                        </div>

                        <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                          <span
                            className={`font-semibold flex items-center gap-1 ${
                              isEligible ? 'text-emerald-700' : 'text-amber-800'
                            }`}
                          >
                            {isEligible ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>{t.buyerPassportQr.eligibleTag}</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-3 h-3 text-amber-600" />
                                <span>{t.buyerPassportQr.ineligibleTag}</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 4 Pillars Score Breakdown */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>{t.score.title} Breakdown</span>
            </h3>
            <PassportScoreBreakdown breakdown={passport.scoreBreakdown} />
          </div>

          {/* Public Photo Evidence */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-700" />
                <span>Verified Crop Photograph Proofs ({publicEvidence.length})</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                Photographs authorized for public inspection
              </span>
            </div>

            {publicEvidence.length === 0 ? (
              <div className="p-6 bg-slate-50 rounded-2xl text-center text-xs text-slate-500">
                No public photographs attached to this passport yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {publicEvidence.map((ev: CropEvidence) => (
                  <div key={ev.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50">
                    <img
                      src={ev.storagePath}
                      alt={ev.description}
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">
                          {ev.category}
                        </span>
                        <EvidenceStatusBadge status={ev.reviewStatus} size="sm" />
                      </div>
                      <p className="text-xs text-slate-800 font-medium">
                        {ev.description}
                      </p>
                      {ev.reviewNote && (
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
                          <strong>Agronomist:</strong> {ev.reviewNote}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400">
                        Date: {ev.captureDate || 'Undated'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chronological Activity Summary */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Season Activity Log History ({logs.length} entries)</span>
            </h3>

            <div className="space-y-3">
              {logs.map((log: CropLog) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900">
                        {log.activityType}
                      </span>
                      {log.waterVolumeKL && log.waterVolumeKL > 0 && (
                        <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded">
                          {log.waterVolumeKL} KL Water
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600">{log.description}</p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(log.activityDate).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mandatory Disclaimers */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">{t.disclaimer.passportTitle}:</span>
                <p className="text-[11px] leading-relaxed mt-0.5">
                  {t.disclaimer.passportText}
                </p>
                <p className="text-[11px] leading-relaxed mt-1 text-amber-900">
                  {language === 'hi'
                    ? 'फसलसेतु पासपोर्ट स्कोर केवल खेती के रिकॉर्ड की पूर्णता और निरंतरता को दर्शाता है।'
                    : 'This document does not represent government certification or an official phytosanitary warranty.'}
                </p>
              </div>
            </div>
          </div>

          {/* Report & Verification Transparency Footer */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
            <span>Last calculated: {new Date(passport.scoreCalculatedAt).toLocaleDateString()}</span>
            <button
              onClick={handleReport}
              disabled={reported}
              className="text-slate-500 hover:text-red-700 flex items-center gap-1 font-semibold transition-colors"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>{reported ? 'Report Submitted' : 'Report This Passport'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pre-Harvest Booking Modal if Buyer wishes to order */}
      {showBookingModal && listing && (
        <BookingModal
          listing={listing}
          onClose={() => setShowBookingModal(false)}
          onSuccess={() => {
            showToast('Booking request sent to farmer!', 'success');
          }}
        />
      )}
    </div>
  );
};
