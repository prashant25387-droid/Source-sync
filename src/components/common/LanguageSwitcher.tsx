import React from 'react';
import { Languages } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const LanguageSwitcher: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-lg bg-emerald-950/20 p-1 border border-emerald-800/30">
      {!compact && <Languages className="w-4 h-4 ml-2 mr-1 text-emerald-800" />}
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
          language === 'en'
            ? 'bg-emerald-800 text-white shadow-sm'
            : 'text-emerald-900 hover:text-emerald-950'
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage('hi')}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
          language === 'hi'
            ? 'bg-emerald-800 text-white shadow-sm'
            : 'text-emerald-900 hover:text-emerald-950'
        }`}
      >
        हिंदी
      </button>
    </div>
  );
};
