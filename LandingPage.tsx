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
  Volume2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  MapPin,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ScoreRing } from '../components/common/ScoreRing';
import { EvidenceStatusBadge } from '../components/common/StatusBadge';
import { VoiceGuidance } from '../components/common/VoiceGuidance';

interface LandingPageProps {
  navigate: (path: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const { switchRole } = useAuth();

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-16 sm:pb-20">
        {/* Subtle decorative agricultural gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/50 via-emerald-50/20 to-transparent -z-10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-xs">
                <Droplets className="w-4 h-4 text-emerald-700" />
                <span>{language === 'hi' ? 'पानी की योजना से भरोसे की बिक्री तक' : 'Water-Aware Crop Planning Platform'}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                <span className="text-emerald-700 font-semibold">{t.hindiTagline}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-emerald-950 tracking-tight leading-[1.15]">
                {t.heroHeadline}
              </h1>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                {t.heroSubheading}
              </p>

              {/* Call to Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    switchRole('farmer');
                    navigate('/farmer/dashboard');
                  }}
                  className="px-6 py-3.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 group"
                >
                  <span>{t.actions.getStartedFarmer}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/marketplace')}
                  className="px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-emerald-950 font-bold text-sm border-2 border-emerald-900/20 shadow-xs hover:border-emerald-800 transition-all flex items-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  <span>{t.actions.exploreMarketplace}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    switchRole('buyer');
                    navigate('/buyer/marketplace');
                  }}
                  className="px-5 py-3.5 rounded-xl bg-emerald-100/70 hover:bg-emerald-100 text-emerald-900 font-bold text-sm border border-emerald-300 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>{t.actions.openBuyerDemo}</span>
                </button>
              </div>

              {/* Quick Persona Access Badges */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Quick Test Workflows:</span>
                <button
                  onClick={() => { switchRole('farmer'); navigate('/farmer/crop-planner'); }}
                  className="text-emerald-800 underline font-medium hover:text-emerald-950"
                >
                  1. Crop Planner
                </button>
                <button
                  onClick={() => { switchRole('farmer'); navigate('/farmer/evidence'); }}
                  className="text-emerald-800 underline font-medium hover:text-emerald-950"
                >
                  2. Photo Evidence
                </button>
                <button
                  onClick={() => { navigate('/passport/FS-8X29KQ'); }}
                  className="text-emerald-800 underline font-medium hover:text-emerald-950"
                >
                  3. Sample Passport
                </button>
                <button
                  onClick={() => { switchRole('admin'); navigate('/admin/evidence-review'); }}
                  className="text-emerald-800 underline font-medium hover:text-emerald-950"
                >
                  4. Reviewer Queue
                </button>
              </div>
            </div>

            {/* Right Column: Illustrative Live Crop Passport Preview Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                <div className="absolute -top-3 -right-3 bg-amber-400 text-amber-950 font-black text-[10px] uppercase px-3 py-1 rounded-full shadow-md z-10">
                  Illustrative Sample Passport Card
                </div>

                <div className="bg-white rounded-3xl border-2 border-emerald-900/15 shadow-2xl overflow-hidden transform hover:-translate-y-1 transition-transform">
                  <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-950 p-6 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold bg-emerald-700/80 px-2.5 py-1 rounded-md text-emerald-200">
                        PASSPORT # FS-8X29KQ
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-300">
                        Rabi 2026-27
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-2xl font-black text-white">
                          Tomato (Hybrid)
                        </h3>
                        <p className="text-xs text-emerald-200 mt-0.5">
                          Abhinav F1 • Drip-Irrigated
                        </p>
                      </div>

                      <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 text-center">
                        <ScoreRing score={83} size="md" showGrade={false} />
                        <div className="text-[10px] font-bold text-emerald-300 mt-1 uppercase tracking-wider">
                          Gold Grade
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-medium">Farm Region</span>
                        <span className="font-bold text-slate-800">Nashik, Maharashtra</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        <span className="text-[10px] text-slate-400 block font-medium">Estimated Harvest</span>
                        <span className="font-bold text-slate-800">10 Jan 2027</span>
                      </div>
                    </div>

                    {/* Progress Score Breakdown Preview */}
                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="font-medium">Water Discipline Records</span>
                        <span className="font-bold text-cyan-800">32 / 40</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="font-medium">Logging Consistency</span>
                        <span className="font-bold text-emerald-800">26 / 30</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="font-medium">Crop Care & Nutrition</span>
                        <span className="font-bold text-teal-800">17 / 20</span>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="font-medium">Plan Adherence</span>
                        <span className="font-bold text-amber-800">8 / 10</span>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Evidence Status:</span>
                      <EvidenceStatusBadge status="Approved as Supporting Evidence" size="sm" />
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => navigate('/passport/FS-8X29KQ')}
                        className="w-full py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                      >
                        <span>{t.actions.viewPassport}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-[10px] text-slate-400 text-center leading-tight">
                      * Illustrative sample data. Score reflects record completeness, not a government laboratory seed certification.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Workflow: PLAN -> GROW -> DOCUMENT -> VERIFY -> BUILD PASSPORT -> CONNECT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            The Continuous Workflow
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-emerald-950 mt-3">
            {t.workflow.title}
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            {t.workflow.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-900/10 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-800 flex items-center justify-center font-black text-sm mb-4">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-600" />
              <span>{t.workflow.step1}</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.workflow.step1Desc}
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-900/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm mb-4">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <span>{t.workflow.step2}</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.workflow.step2Desc}
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-900/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm mb-4">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>{t.workflow.step3}</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.workflow.step3Desc}
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-900/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-sm mb-4">
              04
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>{t.workflow.step4}</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.workflow.step4Desc}
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-900/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-black text-sm mb-4">
              05
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-indigo-600" />
              <span>{t.workflow.step5}</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.workflow.step5Desc}
            </p>
          </div>

          {/* Step 6 */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-900/10 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black text-sm mb-4">
              06
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-rose-600" />
              <span>{t.workflow.step6}</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t.workflow.step6Desc}
            </p>
          </div>
        </div>
      </section>

      {/* Voice Guidance Feature Highlight */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold">
                <Volume2 className="w-4 h-4" />
                <span>Bilingual Voice Guidance (Web Speech API)</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
                {language === 'hi' ? 'बोलकर निर्देश, बिना किसी उलझन के' : 'Voice Assistance for Every Farmer'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed">
                {language === 'hi'
                  ? 'फसलसेतु में हर महत्वपूर्ण कार्य—जैसे फोटो अपलोड करना, सिंचाई लॉग करना और पासपोर्ट बनाना—हिंदी और अंग्रेजी दोनों में आवाज़ द्वारा सुनाया जा सकता है।'
                  : 'FasalSetu speaks critical instructions in clear English and Hindi using native browser speech synthesis. Farmers can tap the speaker button anytime to hear guidance.'}
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/15">
              <VoiceGuidance
                englishText="Welcome to FasalSetu. Plan your crops based on your water budget, upload timestamped growth photos, and build buyer trust before harvest."
                hindiText="फसलसेतु में आपका स्वागत है। अपने पानी के बजट के अनुसार फसल चुनें, खेत की साफ़ तस्वीरें अपलोड करें, और कटाई से पहले खरीदारों का भरोसा जीतें।"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Slide 6 Comparison Matrix: What Exists Today vs FasalSetu */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Market Gap & Unique Value
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            What Exists Today — And Where FasalSetu Fits In
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Other solutions address only disconnected pieces. FasalSetu connects Water Planning, Crop Passport Proof, and Pre-Harvest Selling.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <th className="p-4">Existing Solution</th>
                <th className="p-4">Main Focus</th>
                <th className="p-4">Limitations for Farmers</th>
                <th className="p-4 bg-emerald-100/70 text-emerald-950 font-black">
                  FasalSetu Advantage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              <tr>
                <td className="p-4 font-semibold">Mandi Trades / Trader Networks</td>
                <td className="p-4">Connects farmers and bulk buyers at harvest</td>
                <td className="p-4 text-slate-500">No water-based crop planning; no pre-harvest booking</td>
                <td className="p-4 bg-emerald-50/50 font-semibold text-emerald-900">
                  Water-aware crop mix + Pre-harvest contract discovery
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Agribazaar / e-Mandi Apps</td>
                <td className="p-4">Post-harvest commodity trading & Mandi prices</td>
                <td className="p-4 text-slate-500">No season-long passport; no water-profit optimizer</td>
                <td className="p-4 bg-emerald-50/50 font-semibold text-emerald-900">
                  Transparent 100-Point Crop Passport & QR code access
                </td>
              </tr>
              <tr>
                <td className="p-4 font-semibold">Plantix / Crop Doctor Apps</td>
                <td className="p-4">Photo-based disease detection</td>
                <td className="p-4 text-slate-500">No market or buyer matching; no water management</td>
                <td className="p-4 bg-emerald-50/50 font-semibold text-emerald-900">
                  Photo evidence linked directly to buyer trust & pre-selling
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
