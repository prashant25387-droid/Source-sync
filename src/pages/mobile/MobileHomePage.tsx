import React from 'react';
import {
  Compass,
  FileCheck2,
  ShoppingBag,
  Droplets,
  CalendarCheck,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Camera,
  CloudSun,
  MapPin,
  TrendingUp,
  Award,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { ScoreRing } from '../../components/common/ScoreRing';
import { EvidenceStatusBadge } from '../../components/common/StatusBadge';
import { VoiceGuidance } from '../../components/common/VoiceGuidance';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

interface MobileHomePageProps {
  navigate: (path: string) => void;
}

export const MobileHomePage: React.FC<MobileHomePageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const { role, switchRole } = useAuth();

  const crops = dataService.getCrops('farmer-1');
  const primaryCrop = crops.find(c => c.cropName.includes('Tomato')) || crops[0];
  const passport = primaryCrop ? dataService.getPassport(primaryCrop.id) : null;
  const listings = dataService.getListings();

  return (
    <div className="space-y-4 pb-4">
      {/* App Top Welcome Banner */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 p-5 rounded-3xl text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-600/30 rounded-full blur-2xl" />

        <div className="relative z-10 space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/80 border border-emerald-500/30 text-emerald-200 text-[11px] font-bold">
            <Droplets className="w-3.5 h-3.5 text-cyan-300" />
            <span>{t.hindiTagline}</span>
          </div>

          <h2 className="text-xl font-black text-white leading-tight">
            {language === 'hi' ? 'हर बूंद का हिसाब। भरोसे से बिक्री।' : 'Make Every Drop Count. Build Trust Before Harvest.'}
          </h2>

          <p className="text-xs text-emerald-200/90 leading-relaxed">
            {language === 'hi'
              ? 'पानी के अनुसार फसल चुनें, खेत की प्रगति दर्ज करें, और कटाई से पहले पक्के खरीदारों से जुड़ें।'
              : 'Water-aware crop planning, season-long digital Crop Passport, and pre-harvest buyer commitments.'}
          </p>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/farmer/crop-planner')}
              className="px-4 py-2 rounded-xl bg-white text-emerald-950 font-extrabold text-xs shadow-md active:scale-95 transition-transform flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-emerald-800" />
              <span>{language === 'hi' ? 'फसल योजना बनाएं' : 'Plan Next Crop'}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/marketplace')}
              className="px-4 py-2 rounded-xl bg-emerald-800/90 hover:bg-emerald-700 text-white font-bold text-xs border border-emerald-600 active:scale-95 transition-transform flex items-center gap-1.5"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-300" />
              <span>{language === 'hi' ? 'मंडी देखें' : 'Marketplace'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Voice Assistant Audio Guidance Pill */}
      <VoiceGuidance
        englishText="Welcome to FasalSetu. Plan your crops within your farm water budget, document growth evidence, and build buyer trust before harvest."
        hindiText="फसलसेतु में आपका स्वागत है। अपने पानी के बजट के अनुसार फसल चुनें, खेत की तस्वीरें दर्ज करें, और कटाई से पहले खरीदारों से जुड़ें।"
      />

      {/* Live Agro-Weather & Irrigation Alert Widget */}
      <div
        onClick={() => navigate('/farmer/weather')}
        className="bg-white rounded-2xl border border-emerald-900/10 p-3.5 shadow-xs flex items-center justify-between gap-3 active:scale-[0.99] transition-transform cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 shrink-0">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-800">Nashik, Maharashtra</span>
              <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100 px-1.5 py-0.2 rounded">
                28°C Sunny
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5 line-clamp-1">
              Advice: Proceed with scheduled drip cycle. Dry weather forecast.
            </p>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
      </div>

      {/* 3 Core Pillars (From Pitch Deck Slides 4 & 5) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            One Platform. Three Steps.
          </h3>
          <span className="text-[10px] font-bold text-emerald-800">
            Plan • Prove • Pre-Sell
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {/* 1. PLAN CARD */}
          <div
            onClick={() => navigate('/farmer/crop-planner')}
            className="bg-white rounded-2xl p-4 border border-cyan-100 shadow-xs hover:border-cyan-300 active:scale-[0.99] transition-transform cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-800 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">
                    PLAN (Before Sowing)
                  </h4>
                  <span className="text-[10px] text-cyan-800 font-semibold">
                    Rank by profit per 1,000L water (₹/KL)
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-cyan-700 shrink-0 mt-1" />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1.5 text-center text-xs">
              <div className="bg-cyan-50/60 p-2 rounded-xl border border-cyan-100">
                <span className="text-[10px] text-slate-500 block">Chana</span>
                <span className="font-extrabold text-cyan-900">₹40.2 / KL</span>
              </div>
              <div className="bg-cyan-50/60 p-2 rounded-xl border border-cyan-100">
                <span className="text-[10px] text-slate-500 block">Tomato</span>
                <span className="font-extrabold text-cyan-900">₹27.5 / KL</span>
              </div>
              <div className="bg-cyan-50/60 p-2 rounded-xl border border-cyan-100">
                <span className="text-[10px] text-slate-500 block">Mustard</span>
                <span className="font-extrabold text-cyan-900">₹25.7 / KL</span>
              </div>
            </div>
          </div>

          {/* 2. PROVE CARD */}
          <div
            onClick={() => navigate('/farmer/passport')}
            className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-xs hover:border-emerald-300 active:scale-[0.99] transition-transform cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">
                    PROVE (During Season)
                  </h4>
                  <span className="text-[10px] text-emerald-800 font-semibold">
                    Build verifiable season log & score
                  </span>
                </div>
              </div>

              {passport && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <ScoreRing score={passport.score} size="sm" showGrade={false} />
                  <span className="text-xs font-extrabold text-emerald-900">
                    {passport.score}/100
                  </span>
                </div>
              )}
            </div>

            <p className="mt-2 text-[11px] text-slate-600 leading-snug">
              Paani logs, crop checks, and agronomist-reviewed photo evidence compiled into an immutable digital Passport.
            </p>
          </div>

          {/* 3. PRE-SELL CARD */}
          <div
            onClick={() => navigate('/marketplace')}
            className="bg-white rounded-2xl p-4 border border-amber-100 shadow-xs hover:border-amber-300 active:scale-[0.99] transition-transform cursor-pointer"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-slate-900">
                    PRE-SELL (Before Harvest)
                  </h4>
                  <span className="text-[10px] text-amber-800 font-semibold">
                    Connect directly with verified bulk buyers
                  </span>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-700 shrink-0 mt-1" />
            </div>

            <p className="mt-2 text-[11px] text-slate-600 leading-snug">
              Buyers view your passport score and pre-book before harvest, avoiding distress selling at Mandi gates.
            </p>
          </div>
        </div>
      </div>

      {/* Verified Crops Showcase */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Active Crops & Passport Status
          </h3>
          <button
            onClick={() => navigate('/farmer/crops')}
            className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950"
          >
            All Crops ({crops.length}) →
          </button>
        </div>

        <div className="space-y-3">
          {crops.slice(0, 2).map((crop) => {
            const pass = dataService.getPassport(crop.id);

            return (
              <div
                key={crop.id}
                onClick={() => navigate(`/farmer/crops/${crop.id}`)}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs active:scale-[0.99] transition-transform cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {crop.publicId}
                    </span>
                    <h4 className="text-sm font-black text-slate-900 mt-1">
                      {crop.cropName}
                    </h4>
                    <span className="text-xs text-slate-500 font-medium">
                      Stage: <strong className="text-slate-800">{crop.growthStage}</strong>
                    </span>
                  </div>

                  {pass && (
                    <div className="text-center shrink-0">
                      <ScoreRing score={pass.score} size="sm" showGrade={false} />
                      <span className="text-[10px] font-bold text-emerald-800 block mt-0.5">
                        {pass.scoreBreakdown.scoreGrade.split(' ')[0]}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Harvest: <strong>{crop.expectedHarvestDate}</strong></span>
                  <span className="font-bold text-emerald-800">Track Field Logs →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pre-Harvest Buyer Demand Board (From Slide 7) */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Institutional Buyer Demand Board
          </h3>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
            Pre-Booking Active
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100 text-xs">
          <div className="p-3.5 flex items-center justify-between gap-2">
            <div>
              <span className="font-extrabold text-slate-900 block">Tomato • 500 Quintals</span>
              <span className="text-[10px] text-slate-500">Buyer: FreshFoods Ltd • Delivery: Nov 2026</span>
            </div>
            <div className="text-right">
              <span className="font-black text-emerald-900 block">₹1,200/Qtl</span>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                Min Score 70
              </span>
            </div>
          </div>

          <div className="p-3.5 flex items-center justify-between gap-2">
            <div>
              <span className="font-extrabold text-slate-900 block">Chana • 800 Quintals</span>
              <span className="text-[10px] text-slate-500">Buyer: AgriMart Sourcing • Delivery: Mar 2027</span>
            </div>
            <div className="text-right">
              <span className="font-black text-emerald-900 block">₹5,200/Qtl</span>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                Min Score 70
              </span>
            </div>
          </div>

          <div className="p-3.5 flex items-center justify-between gap-2">
            <div>
              <span className="font-extrabold text-slate-900 block">Mustard • 400 Quintals</span>
              <span className="text-[10px] text-slate-500">Buyer: GrainPlus Traders • Delivery: Feb 2027</span>
            </div>
            <div className="text-right">
              <span className="font-black text-emerald-900 block">₹5,000/Qtl</span>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                Min Score 70
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
