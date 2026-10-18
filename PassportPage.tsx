import React, { useState } from 'react';
import {
  FileCheck2,
  Share2,
  QrCode,
  Globe,
  Lock,
  ExternalLink,
  Printer,
  Copy,
  Check,
  ShieldAlert,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { PassportCard } from '../../components/passport/PassportCard';
import { PassportScoreBreakdown } from '../../components/passport/PassportScoreBreakdown';
import { PassportQRCodeModal } from '../../components/passport/PassportQRCode';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { VoiceGuidance } from '../../components/common/VoiceGuidance';

interface PassportPageProps {
  navigate: (path: string) => void;
}

export const PassportPage: React.FC<PassportPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const crops = dataService.getCrops('farmer-1');
  const [selectedCropId, setSelectedCropId] = useState<string>(crops[0]?.id || '');
  const [showQrModal, setShowQrModal] = useState(false);

  const selectedCrop = crops.find(c => c.id === selectedCropId) || crops[0];
  const passport = selectedCrop ? dataService.getPassport(selectedCrop.id) : null;
  const logs = selectedCrop ? dataService.getLogs(selectedCrop.id) : [];
  const evidence = selectedCrop ? dataService.getEvidence(selectedCrop.id) : [];

  const handleToggleSharing = (enabled: boolean) => {
    if (!passport) return;
    dataService.setPassportPublicSharing(passport.publicId, enabled);
    showToast(
      enabled ? 'Public sharing enabled! Buyers can view this passport.' : 'Public sharing disabled. Link is now private.',
      'info'
    );
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-4 sm:p-6 rounded-2xl text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-bold mb-2">
            <FileCheck2 className="w-4 h-4 text-emerald-300" />
            <span>Digital Crop Passport Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {language === 'hi' ? 'डिजिटल क्रॉप पासपोर्ट और स्कोर' : 'Digital Crop Passport & Verification Score'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-1.5 leading-relaxed">
            {language === 'hi'
              ? 'आपका क्रॉप पासपोर्ट आपकी फसल के रिकॉर्ड, सहायक प्रमाण और पासपोर्ट स्कोर को एक जगह दिखाता है।'
              : 'Your Crop Passport consolidates water discipline, dated growth logs, photo evidence, and a transparent 100-point score for prospective buyers.'}
          </p>
        </div>
      </div>

      {/* Dynamic Voice Guidance */}
      <VoiceGuidance
        englishText={
          passport
            ? `Your crop ${selectedCrop?.cropName} has a Passport Score of ${passport.score} out of 100 with a ${passport.scoreBreakdown.gradeBadge} grade. Water management score is ${passport.scoreBreakdown.waterManagementScore} of 40, and crop care score is ${passport.scoreBreakdown.cropCareScore} of 20, with ${logs.length} farming activities documented. You can share this passport directly with buyers via QR code or public link.`
            : t.voice.passportPrompt
        }
        hindiText={
          passport
            ? `आपकी फसल ${selectedCrop?.cropNameHi || selectedCrop?.cropName} का पासपोर्ट स्कोर 100 में से ${passport.score} है, जो ${passport.scoreBreakdown.gradeBadge} श्रेणी में है। जल प्रबंधन में 40 में से ${passport.scoreBreakdown.waterManagementScore} अंक और फसल देखभाल में 20 में से ${passport.scoreBreakdown.cropCareScore} अंक मिले हैं। अब तक कुल ${logs.length} गतिविधियां दर्ज की गई हैं। यह डिजिटल पासपोर्ट आप क्यूआर कोड के माध्यम से सीधे खरीदारों को दिखा सकते हैं।`
            : t.voice.passportPrompt
        }
        compact
      />

      {/* Crop Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {crops.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCropId(c.id)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCrop?.id === c.id
                ? 'bg-emerald-800 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {c.cropName} ({c.publicId})
          </button>
        ))}
      </div>

      {selectedCrop && passport && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Passport Card & Controls */}
          <div className="lg:col-span-5 space-y-4">
            <PassportCard
              crop={selectedCrop}
              passport={passport}
              logs={logs}
              evidenceList={evidence}
              onViewPassport={(id) => navigate(`/passport/${id}`)}
              showActions={true}
            />

            {/* Sharing & Privacy Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Public Sharing & Access Controls
              </h3>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  {passport.publicSharingEnabled ? (
                    <Globe className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">
                      {passport.publicSharingEnabled ? 'Public Sharing Active' : 'Private (Hidden)'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {passport.publicSharingEnabled
                        ? 'Buyers can open your passport via public link or QR scan.'
                        : 'Access restricted. Anyone opening the link will see access denied.'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleToggleSharing(!passport.publicSharingEnabled)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    passport.publicSharingEnabled
                      ? 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                      : 'bg-emerald-800 text-white hover:bg-emerald-900'
                  }`}
                >
                  {passport.publicSharingEnabled ? 'Disable Sharing' : 'Enable Sharing'}
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  className="w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-900 hover:bg-emerald-100 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-emerald-200 active:scale-95"
                >
                  <QrCode className="w-4 h-4 text-emerald-700" />
                  <span>Show & Download QR Code</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: 100-Point Score Breakdown */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                    Methodology Transparency
                  </span>
                  <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                    Transparent 100-Point Documentation Index
                  </h2>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-black text-emerald-900">
                    {passport.score}/100
                  </div>
                  <div className="text-[11px] font-bold text-emerald-700">
                    {passport.scoreBreakdown.scoreGrade}
                  </div>
                </div>
              </div>

              <PassportScoreBreakdown breakdown={passport.scoreBreakdown} />
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQrModal && selectedCrop && passport && (
        <PassportQRCodeModal
          publicId={passport.publicId}
          cropName={selectedCrop.cropName}
          score={passport.score}
          onClose={() => setShowQrModal(false)}
        />
      )}
    </div>
  );
};
