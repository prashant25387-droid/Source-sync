import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  QrCode,
  Camera,
  Search,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface BuyerPassportScannerModalProps {
  onClose: () => void;
  onSelectPassport: (publicId: string) => void;
}

/**
 * Robust extraction of Passport Public ID from URL or raw text
 * Handles:
 * - Direct ID: FS-8X29KQ
 * - Query URL: https://example.com/?passport=FS-8X29KQ
 * - Path URL: https://example.com/passport/FS-8X29KQ
 */
export function extractPassportIdFromInput(input: string): string | null {
  if (!input) return null;
  const clean = input.trim();

  // 1. Direct Regex Match for FS-XXXXXX pattern
  const directMatch = clean.match(/FS-[A-Z0-9]{4,10}/i);
  if (directMatch) {
    return directMatch[0].toUpperCase();
  }

  // 2. Try parsing as URL
  try {
    const url = new URL(clean);
    const queryParam = url.searchParams.get('passport');
    if (queryParam && queryParam.trim()) {
      return queryParam.trim().toUpperCase();
    }
    const pathParts = url.pathname.split('/');
    const pIndex = pathParts.indexOf('passport');
    if (pIndex !== -1 && pathParts[pIndex + 1]) {
      return pathParts[pIndex + 1].toUpperCase();
    }
  } catch (e) {
    // Not a full URL string, ignore
  }

  return null;
}

export const BuyerPassportScannerModal: React.FC<BuyerPassportScannerModalProps> = ({
  onClose,
  onSelectPassport,
}) => {
  const { language, t } = useLanguage();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  const [manualInput, setManualInput] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scannedId, setScannedId] = useState<string | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'buyer-qr-scanner-region';

  // Start Camera QR Scanner
  const startScanner = async () => {
    setCameraError(null);
    setIsScanning(true);

    try {
      // Small tick to ensure DOM element is mounted
      await new Promise((r) => setTimeout(r, 100));

      const element = document.getElementById(scannerContainerId);
      if (!element) return;

      const qrCodeScanner = new Html5Qrcode(scannerContainerId);
      html5QrCodeRef.current = qrCodeScanner;

      await qrCodeScanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          const id = extractPassportIdFromInput(decodedText);
          if (id) {
            setScannedId(id);
            stopScanner();
            showToast(
              language === 'hi'
                ? `पासपोर्ट क्यूआर स्कैन हुआ: ${id}`
                : `Passport QR scanned: ${id}`,
              'success'
            );
            setTimeout(() => {
              onSelectPassport(id);
            }, 600);
          } else {
            showToast(
              language === 'hi'
                ? 'अमान्य क्यूआर कोड। कृपया फसलसेतु पासपोर्ट क्यूआर स्कैन करें।'
                : 'Unrecognized QR code. Please scan a FasalSetu Crop Passport QR.',
              'warning'
            );
          }
        },
        () => {
          // ignore per-frame non-matches
        }
      );
    } catch (err: any) {
      console.warn('QR Scanner start error:', err);
      setIsScanning(false);
      setCameraError(
        language === 'hi'
          ? 'कैमरा शुरू नहीं हो सका या अनुमति अस्वीकृत है। कृपया नीचे दिए गए इनपुट में पासपोर्ट आईडी दर्ज करें।'
          : 'Could not access device camera. Please allow camera permissions or enter the Passport ID below.'
      );
      setActiveTab('manual');
    }
  };

  // Stop Camera QR Scanner
  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping QR scanner:', err);
      } finally {
        html5QrCodeRef.current = null;
        setIsScanning(false);
      }
    }
  };

  // Initialize or stop scanner based on tab
  useEffect(() => {
    if (activeTab === 'camera') {
      startScanner();
    } else {
      stopScanner();
    }

    return () => {
      stopScanner();
    };
  }, [activeTab]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const id = extractPassportIdFromInput(manualInput);
    if (!id) {
      showToast(
        language === 'hi'
          ? 'कृपया वैध पासपोर्ट आईडी (उदा. FS-8X29KQ) या पूरा लिंक दर्ज करें'
          : 'Please enter a valid Passport ID (e.g. FS-8X29KQ) or full URL',
        'error'
      );
      return;
    }

    onSelectPassport(id);
  };

  const handleQuickDemoClick = (id: string) => {
    onSelectPassport(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-emerald-900/10 relative overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <QrCode className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {t.buyerPassportQr.sectionTitle}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'hi'
                  ? 'सत्यापित डिजिटल पासपोर्ट व स्कोर देखें'
                  : 'Inspect verified digital passport & scoring'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopScanner();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 p-1 mt-4">
          <button
            type="button"
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'camera'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{t.buyerPassportQr.scanQrBtn}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'manual'
                ? 'bg-white text-emerald-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>{t.buyerPassportQr.openLinkBtn}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-4 flex-1 overflow-y-auto">
          {activeTab === 'camera' ? (
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-emerald-500/30 min-h-[260px] flex flex-col items-center justify-center">
                <div id={scannerContainerId} className="w-full h-full min-h-[260px]"></div>

                {scannedId && (
                  <div className="absolute inset-0 bg-emerald-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 text-center animate-in fade-in">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                    <p className="text-sm font-bold">Passport Detected!</p>
                    <p className="text-xs text-emerald-200 font-mono mt-1">{scannedId}</p>
                    <p className="text-[11px] text-slate-300 mt-2">Opening verified Crop Passport...</p>
                  </div>
                )}
              </div>

              <p className="text-center text-xs text-slate-500">
                {t.buyerPassportQr.cameraScanning}
              </p>

              {cameraError && (
                <div className="flex items-start gap-2 bg-amber-50 p-3 rounded-xl border border-amber-200 text-amber-800 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <p>{cameraError}</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleManualSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {language === 'hi' ? 'पासपोर्ट आईडी या वेब लिंक' : 'Passport Public ID or Link'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder={t.buyerPassportQr.inputPlaceholder}
                    className="w-full pl-3.5 pr-10 py-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700 uppercase"
                    autoFocus
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-2"
              >
                <span>{t.buyerPassportQr.openBtn}</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Chips for Judges */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              {language === 'hi' ? 'त्वरित डेमो पासपोर्ट (एक-टैप परीक्षण):' : 'Quick Demo Passports (One-Tap Test):'}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoClick('FS-8X29KQ')}
                className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/80 text-left transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1">
                    <span>FS-8X29KQ</span>
                    <span className="text-[10px] text-emerald-700 font-semibold">• 83/100</span>
                  </div>
                  <div className="text-[10px] text-slate-600">
                    {language === 'hi' ? 'टमाटर (हाइब्रिड)' : 'Tomato (Hybrid)'}
                  </div>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-emerald-700 opacity-60 group-hover:opacity-100" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoClick('FS-MH742P')}
                className="p-2.5 rounded-xl border border-cyan-300 bg-cyan-50/70 hover:bg-cyan-100/80 text-left transition-all group flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-cyan-950 flex items-center gap-1">
                    <span>FS-MH742P</span>
                    <span className="text-[10px] text-cyan-700 font-semibold">• 78/100</span>
                  </div>
                  <div className="text-[10px] text-slate-600">
                    {language === 'hi' ? 'चना (देसी)' : 'Chana (Bengal Gram)'}
                  </div>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-cyan-700 opacity-60 group-hover:opacity-100" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
