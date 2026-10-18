import React, { useState } from 'react';
import {
  CropRecord,
  PassportRecord,
  CropLog,
  CropEvidence,
} from '../../types';
import { ScoreRing } from '../common/ScoreRing';
import { EvidenceStatusBadge } from '../common/StatusBadge';
import { PassportQRCodeModal } from './PassportQRCode';
import {
  Share2,
  QrCode,
  ExternalLink,
  Calendar,
  MapPin,
  Clock,
  Camera,
  CheckCircle2,
  ShieldAlert,
  Copy,
  Check,
  Printer,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface PassportCardProps {
  crop: CropRecord;
  passport: PassportRecord;
  logs: CropLog[];
  evidenceList: CropEvidence[];
  onViewPassport?: (publicId: string) => void;
  showActions?: boolean;
}

export const PassportCard: React.FC<PassportCardProps> = ({
  crop,
  passport,
  logs,
  evidenceList,
  onViewPassport,
  showActions = true,
}) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const cropLogs = logs.filter(l => l.cropRecordId === crop.id);
  const cropEvidence = evidenceList.filter(e => e.cropRecordId === crop.id);
  const approvedEvidence = cropEvidence.filter(e => e.reviewStatus === 'Approved as Supporting Evidence');

  // Compute public URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fasalsetu.in';
  const publicUrl = `${origin}/passport/${passport.publicId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast(`${t.actions.copied} (${publicUrl})`, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `FasalSetu Digital Crop Passport: ${crop.cropName} (${passport.publicId})`,
          text: `Check out the verified Crop Passport for ${crop.cropName} with a record score of ${passport.score}/100.`,
          url: publicUrl,
        });
      } catch (err) {
        // Ignored or cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const latestEvidenceStatus = cropEvidence.length > 0
    ? cropEvidence[0].reviewStatus
    : 'Uploaded';

  return (
    <>
      <div className="bg-white rounded-2xl border border-emerald-900/15 shadow-md hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
        {/* Top Header Card */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-4 sm:p-5 text-white flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-widest uppercase bg-emerald-700/80 px-2 py-0.5 rounded text-emerald-200">
                Digital Crop Passport
              </span>
              <span className="text-xs font-mono font-bold text-emerald-300">
                {passport.publicId}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              {crop.cropName}
            </h3>
            {crop.variety && (
              <p className="text-xs text-emerald-200">
                Variety: {crop.variety}
              </p>
            )}
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-2 sm:p-3 border border-white/15 shrink-0 text-center">
            <ScoreRing score={passport.score} size="md" showGrade={false} />
            <div className="text-[10px] font-bold text-emerald-200 mt-1 uppercase">
              {passport.scoreBreakdown.scoreGrade.split(' ')[0]}
            </div>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
          {/* Key Facts */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Location</span>
                <span className="font-semibold text-slate-800">
                  {crop.farmName || 'Nashik, Maharashtra'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block font-medium">Est. Harvest</span>
                <span className="font-semibold text-slate-800">
                  {crop.expectedHarvestDate}
                </span>
              </div>
            </div>
          </div>

          {/* Record Stats Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 border-y border-slate-100 bg-emerald-50/40 rounded-xl">
            <div className="p-1">
              <div className="font-extrabold text-sm text-emerald-950">
                {cropLogs.length}
              </div>
              <div className="text-[10px] text-emerald-800 font-medium">
                Dated Logs
              </div>
            </div>
            <div className="p-1 border-x border-emerald-100">
              <div className="font-extrabold text-sm text-emerald-950">
                {cropEvidence.length}
              </div>
              <div className="text-[10px] text-emerald-800 font-medium">
                Crop Photos
              </div>
            </div>
            <div className="p-1">
              <div className="font-extrabold text-sm text-emerald-700">
                {approvedEvidence.length}
              </div>
              <div className="text-[10px] text-emerald-800 font-medium">
                Reviewed Proof
              </div>
            </div>
          </div>

          {/* Review Status & Transparency Tag */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-slate-500 font-medium text-[11px]">Latest Evidence Status:</span>
            <EvidenceStatusBadge status={latestEvidenceStatus} size="sm" />
          </div>

          {/* Verification Disclosure Box */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <span className="leading-tight">
              {language === 'hi'
                ? 'यह पासपोर्ट किसान द्वारा दर्ज रिकॉर्ड की नियमितता दर्शाता है। यह स्वतंत्र फसल गुणवत्ता प्रमाणपत्र नहीं है।'
                : 'Score measures record completeness & water discipline. Not a certified laboratory seed or food quality seal.'}
            </span>
          </div>

          {/* Card Actions */}
          {showActions && (
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="p-2 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Generate QR Code"
                >
                  <QrCode className="w-4 h-4 text-emerald-700" />
                  <span className="hidden sm:inline">QR Code</span>
                </button>

                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="p-2 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Share link"
                >
                  <Share2 className="w-4 h-4 text-slate-600" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-2 rounded-lg bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Copy link"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600" />}
                </button>
              </div>

              {onViewPassport && (
                <button
                  type="button"
                  onClick={() => onViewPassport(passport.publicId)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors ml-auto"
                >
                  <span>{t.actions.viewPassport}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <PassportQRCodeModal
          publicId={passport.publicId}
          cropName={crop.cropName}
          score={passport.score}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </>
  );
};
