import React from 'react';
import { Sprout, Droplets, ShieldAlert, Award, Heart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-emerald-950 text-emerald-100 border-t border-emerald-900/60 no-print mt-auto">
      {/* Important Transparency Notice */}
      <div className="bg-emerald-900/70 border-b border-emerald-800/80 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-emerald-200/90 leading-relaxed">
            <span className="font-bold text-amber-300 mr-1">
              {t.disclaimer.passportTitle}:
            </span>
            {t.disclaimer.passportText}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                <Sprout className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="text-lg font-black text-white">{t.brand}</span>
            </div>
            <p className="text-xs text-emerald-300/80 leading-relaxed">
              {t.tagline}
            </p>
            <div className="text-xs text-emerald-400 font-semibold italic">
              {t.hindiTagline}
            </div>
          </div>

          {/* Core Workflow links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
              FasalSetu Workflow
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li>
                <button onClick={() => navigate('/farmer/crop-planner')} className="hover:text-white transition-colors">
                  1. Water-Aware Crop Planning
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/farmer/weather')} className="hover:text-white transition-colors">
                  2. Irrigation & Weather Advisory
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/farmer/evidence')} className="hover:text-white transition-colors">
                  3. Timestamped Photo Evidence
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/farmer/passport')} className="hover:text-white transition-colors">
                  4. Digital Crop Passport & Score
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/marketplace')} className="hover:text-white transition-colors">
                  5. Pre-Harvest Buyer Marketplace
                </button>
              </li>
            </ul>
          </div>

          {/* Technology & Transparency */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-3">
              Transparency & Science
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">
                  Scoring Methodology (100 Pts)
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">
                  ICAR / Agmarknet Reference Data
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">
                  Independent Verification Limits
                </button>
              </li>
              <li>
                <button onClick={() => navigate('/about')} className="hover:text-white transition-colors">
                  Privacy & Data Sovereignty
                </button>
              </li>
            </ul>
          </div>

          {/* Water Conservation Commitment */}
          <div className="bg-emerald-900/50 p-4 rounded-xl border border-emerald-800/80">
            <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs mb-2">
              <Droplets className="w-4 h-4" />
              <span>Water-First Agriculture</span>
            </div>
            <p className="text-[11px] text-emerald-200/80 leading-relaxed">
              Every drop saved protects the groundwater table and increases farmer income per kilolitre. FasalSetu connects responsible water discipline directly with verified buyers.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-emerald-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-emerald-400/80">
          <div>
            © 2026 FasalSetu AgriTech. Built for India's hardworking farmers.
          </div>
          <div className="flex items-center gap-1 text-[11px]">
            <span>Designed with</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 inline" />
            <span>for sustainable, transparent agriculture</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
