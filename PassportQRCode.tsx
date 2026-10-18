import React, { useRef } from 'react';
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react';
import {
  Download,
  Copy,
  Printer,
  ExternalLink,
  X,
  ShieldCheck,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

interface PassportQRCodeModalProps {
  publicId: string;
  cropName: string;
  score: number;
  onClose: () => void;
}

export const PassportQRCodeModal: React.FC<PassportQRCodeModalProps> = ({
  publicId,
  cropName,
  score,
  onClose,
}) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const qrCanvasRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fasalsetu.in';
  const publicUrl = `${origin}/passport/${publicId}`;
  const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    showToast(t.actions.copied, 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPng = () => {
    const canvas = qrCanvasRef.current?.querySelector('canvas');
    if (!canvas) {
      showToast('Could not generate download image', 'error');
      return;
    }
    const pngUrl = canvas.toDataURL('image/png');
    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `FasalSetu-Passport-${publicId}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    showToast('QR Code downloaded as high-resolution PNG!', 'success');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-emerald-900/10 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
            <span>Digital Crop Passport QR</span>
          </div>

          <h3 className="text-xl font-extrabold text-slate-900">
            {cropName}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Unique ID: {publicId} • Record Score: {score}/100
          </p>

          {/* QR Code Container with proper quiet zone margin */}
          <div className="mt-5 p-5 bg-white rounded-2xl border-2 border-emerald-800/20 inline-block shadow-inner mx-auto">
            <div ref={qrCanvasRef}>
              <QRCodeCanvas
                value={publicUrl}
                size={220}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: 'https://api.iconify.design/lucide:sprout.svg?color=%23166534',
                  x: undefined,
                  y: undefined,
                  height: 32,
                  width: 32,
                  excavate: true,
                }}
              />
            </div>
            <div className="mt-2 text-[11px] font-mono font-bold text-slate-700">
              {publicId}
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-3 px-4 leading-relaxed">
            {language === 'hi'
              ? 'किसी भी स्मार्टफोन कैमरे से स्कैन करने पर यह सार्वजनिक क्रॉप पासपोर्ट खुल जाएगा।'
              : 'Scan with any smartphone camera to open the public Crop Passport directly.'}
          </p>

          {isLocalhost && (
            <div className="mt-3 text-left p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Notice:</strong> Running in local development mode ({origin}). When deployed to a public server, this QR code will resolve on any smartphone outside your local network.
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="mt-6 grid grid-cols-2 gap-2.5">
            <button
              onClick={handleDownloadPng}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>{t.actions.downloadQr}</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied!' : t.actions.copyLink}</span>
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-emerald-800 font-medium p-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Passport Card</span>
            </button>

            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-bold p-1"
            >
              <span>Open Public Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
