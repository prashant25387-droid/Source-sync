import React from 'react';
import {
  Sprout,
  Droplets,
  ShieldCheck,
  Award,
  Layers,
  Heart,
  BookOpen,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const AboutPage: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { t, language } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-6 pt-1">
      {/* Hero */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-emerald-950 p-4 sm:p-6 rounded-2xl text-white shadow-md text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-bold mb-2">
          <Sprout className="w-3.5 h-3.5 text-emerald-300" />
          <span>FasalSetu Mission & Science</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          {t.brand}
        </h1>
        <p className="text-sm sm:text-base text-emerald-200 font-bold mt-1">
          {t.hindiTagline}
        </p>
        <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl mx-auto mt-2 leading-relaxed">
          {t.heroSubheading}
        </p>
      </div>

      {/* The 3 Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold">
            <Droplets className="w-5 h-5 text-cyan-700" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            1. Plan (Water-Aware)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Farmers select crops based on their seasonal water budget (in kilolitres) and maximize net profit per 1,000L of water.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            2. Prove (Crop Passport)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Season-long dated logs (irrigation, crop care, growth stages) and timestamped photo evidence build a transparent 100-point Passport.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Award className="w-5 h-5 text-amber-700" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900">
            3. Pre-Sell (Buyer Trust)
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Institutional buyers discover verified crops progressing in fields and pre-book before harvest, eliminating price panic at Mandi gates.
          </p>
        </div>
      </div>

      {/* Scoring Methodology Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            Complete Transparency
          </span>
          <h2 className="text-xl font-black text-slate-900 mt-2">
            The 100-Point Passport Scoring Algorithm
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            FasalSetu Passport Score is strictly rule-based and computed dynamically from actual stored farming records:
          </p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-2xl border border-cyan-100 bg-cyan-50/50 flex items-start gap-3">
            <span className="font-mono font-bold text-base text-cyan-800 w-12 shrink-0">40 Pts</span>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Water Management Discipline</h4>
              <p className="text-slate-600 mt-0.5">
                Evaluates whether irrigation methods (Drip / Sprinkler), frequency, and estimated water volumes (in KL) are documented against the farm's seasonal budget.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/50 flex items-start gap-3">
            <span className="font-mono font-bold text-base text-emerald-800 w-12 shrink-0">30 Pts</span>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Consistency of Crop Logs</h4>
              <p className="text-slate-600 mt-0.5">
                Measures regular periodic logging coverage across weeks and major lifecycle milestones rather than a single bulk entry.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-teal-100 bg-teal-50/50 flex items-start gap-3">
            <span className="font-mono font-bold text-base text-teal-800 w-12 shrink-0">20 Pts</span>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Crop Care & Nutrition Records</h4>
              <p className="text-slate-600 mt-0.5">
                Evaluates timely application of nutrients, organic bio-fertilizers, and responsible pest/disease monitoring entries.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50/50 flex items-start gap-3">
            <span className="font-mono font-bold text-base text-amber-800 w-12 shrink-0">10 Pts</span>
            <div>
              <h4 className="font-bold text-slate-900 text-sm">Adherence to Crop Plan</h4>
              <p className="text-slate-600 mt-0.5">
                Measures alignment with baseline planting dates, cultivated acreage, and documented adjustments when weather forces changes.
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">{t.disclaimer.passportTitle}:</span>
            <p className="mt-1 leading-relaxed">
              {t.disclaimer.passportText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
