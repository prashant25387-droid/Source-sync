import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, AlertCircle, Info } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { speechService } from '../../services/speechService';

interface VoiceGuidanceProps {
  englishText: string;
  hindiText: string;
  autoPlayAfterInteraction?: boolean;
  className?: string;
  compact?: boolean;
}

export const VoiceGuidance: React.FC<VoiceGuidanceProps> = ({
  englishText,
  hindiText,
  className = '',
  compact = false,
}) => {
  const { language, t } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [showHindiNotice, setShowHindiNotice] = useState(false);

  const activeText = language === 'hi' ? hindiText : englishText;

  useEffect(() => {
    setIsSupported(speechService.checkSupport());
    return () => {
      speechService.stop();
    };
  }, []);

  const handleToggleSpeak = () => {
    if (!isSupported) return;

    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
      return;
    }

    if (language === 'hi' && !speechService.hasHindiVoice()) {
      setShowHindiNotice(true);
    } else {
      setShowHindiNotice(false);
    }

    setIsSpeaking(true);
    speechService.speak(activeText, language, {
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: (err) => {
        console.warn('Speech error:', err);
        setIsSpeaking(false);
      },
    });
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <button
          type="button"
          onClick={handleToggleSpeak}
          title={isSpeaking ? t.voice.stopSpeech : t.voice.speakInstruction}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all shadow-sm ${
            isSpeaking
              ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
              : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300'
          }`}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-amber-700" />
              <span>{t.voice.stopSpeech}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t.voice.speakInstruction}</span>
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-emerald-200 bg-emerald-50/80 p-4 shadow-sm transition-all ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800 shrink-0">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-emerald-950">
                {t.voice.title}
              </h4>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-800">
                {language === 'hi' ? 'हिंदी आवाज़' : 'English Voice'}
              </span>
            </div>
            <p className="mt-1 text-sm text-emerald-900 leading-relaxed">
              {activeText}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleSpeak}
          disabled={!isSupported}
          className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all ${
            isSpeaking
              ? 'bg-amber-600 text-white hover:bg-amber-700 ring-2 ring-amber-400'
              : 'bg-emerald-800 text-white hover:bg-emerald-900'
          } ${!isSupported ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4" />
              <span>{t.voice.stopSpeech}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              <span>{t.voice.speakInstruction}</span>
            </>
          )}
        </button>
      </div>

      {!isSupported && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{t.voice.voiceUnsupported}</span>
        </div>
      )}

      {showHindiNotice && language === 'hi' && (
        <div className="mt-3 flex items-center gap-2 text-xs text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
          <Info className="w-4 h-4 shrink-0 text-amber-600" />
          <span>{t.voice.hindiVoiceNotice}</span>
        </div>
      )}
    </div>
  );
};
