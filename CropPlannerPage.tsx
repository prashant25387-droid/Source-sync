import React, { useState } from 'react';
import {
  Compass,
  Droplets,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Layers,
  Sliders,
} from 'lucide-react';
import { cropPlannerService, PlanInputs, CropPlanRecommendation } from '../../services/cropPlannerService';
import { dataService } from '../../services/dataService';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { VoiceGuidance } from '../../components/common/VoiceGuidance';

interface CropPlannerPageProps {
  navigate: (path: string) => void;
}

export const CropPlannerPage: React.FC<CropPlannerPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const farms = dataService.getFarms();
  const defaultFarm = farms[0] || {
    id: 'farm-1',
    name: 'Saraswati Agri Farm',
    area: 5,
    soilType: 'Black Soil',
    irrigationMethod: 'Drip',
    waterStorageCapacityKL: 6000,
  };

  const [farmArea, setFarmArea] = useState<number>(defaultFarm.area || 5);
  const [availableWaterKL, setAvailableWaterKL] = useState<number>(defaultFarm.waterStorageCapacityKL || 6000);
  const [soilType, setSoilType] = useState<string>(defaultFarm.soilType || 'Black Soil');
  const [season, setSeason] = useState<'Kharif' | 'Rabi' | 'Zaid'>('Rabi');
  const [irrigationMethod, setIrrigationMethod] = useState<'Drip' | 'Sprinkler' | 'Canal / Flood' | 'Borewell / Tube' | 'Rainfed'>(
    defaultFarm.irrigationMethod || 'Drip'
  );
  const [objective, setObjective] = useState<'profit' | 'water' | 'balanced'>('balanced');
  const [cultivationBudget, setCultivationBudget] = useState<number>(100000);

  const applyPreset = (area: number, water: number, method: any, obj: any) => {
    setFarmArea(area);
    setAvailableWaterKL(water);
    setIrrigationMethod(method);
    setObjective(obj);
    showToast(`Applied preset: ${area} Acres • ${water.toLocaleString()} KL Water • ${method}`, 'info');
  };

  const inputs: PlanInputs = {
    farmAreaAcres: farmArea,
    availableWaterKL,
    soilType,
    season,
    irrigationMethod,
    objective,
    budgetRs: cultivationBudget > 0 ? cultivationBudget : undefined,
  };

  const recommendations = cropPlannerService.getRecommendations(inputs);

  const handleCreateCropFromPlan = (rec: CropPlanRecommendation) => {
    const plantingDate = new Date().toISOString().slice(0, 10);
    const harvestDate = new Date(Date.now() + rec.crop.durationDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .slice(0, 10);

    const newCrop = dataService.addCrop({
      farmerId: 'farmer-1',
      farmId: defaultFarm.id,
      farmName: defaultFarm.name,
      cropName: rec.crop.cropName,
      cropNameHi: rec.crop.nameHi,
      variety: 'Optimal Recommended',
      plantingDate,
      expectedHarvestDate: harvestDate,
      cultivatedArea: farmArea,
      cultivatedAreaUnit: 'acres',
      estimatedQuantity: Math.round(rec.crop.indicativeYieldPerAcreQuintals * farmArea),
      quantityUnit: 'Quintals',
      expectedPricePerUnit: rec.crop.indicativeMarketPricePerQuintalRs,
      growthStage: 'Land Preparation',
      status: 'Active',
      notes: `Planned using FasalSetu Smart Crop Planner with ${inputs.irrigationMethod} irrigation. Water budget: ${rec.totalWaterReqKL} KL.`,
    });

    showToast(`Saved "${newCrop.cropName}" to My Crops! Passport ID: ${newCrop.publicId}`, 'success');
    navigate(`/farmer/crops/${newCrop.id}`);
  };

  const topRec = recommendations.length > 0 ? recommendations[0] : null;

  const spokenPlannerHindi = `आपकी चुनी हुई ${farmArea} एकड़ जमीन और ${availableWaterKL.toLocaleString()} किलोलीटर पानी के आधार पर ${season} सीजन की फसल योजना तैयार है। सबसे अधिक अनुशंसित फसल ${topRec?.crop?.nameHi || 'फसल'} है, जिसका लाभ ₹${Math.round(topRec?.profitPerKLWaterRs || 0)} प्रति किलोलीटर है। अनुमानित कुल लाभ ₹${Math.round(topRec?.expectedNetProfitRs || 0).toLocaleString()} है। ${topRec?.isWaterDeficit ? 'चेतावनी: पानी की आवश्यकता बजट से अधिक है।' : 'पानी का उपयोग बजट के अंदर है।'} नीचे फसलों की रैंकिंग और पानी का आवंटन देखें। यह सलाह है; अंतिम निर्णय आपका है।`;

  const spokenPlannerEnglish = `Your crop plan for ${season} season is ready based on ${farmArea} acres of land and ${availableWaterKL.toLocaleString()} kilolitres of available water. Top recommended crop is ${topRec?.crop?.cropName || 'crop'} with an optimized profit of ₹${Math.round(topRec?.profitPerKLWaterRs || 0)} per kilolitre water. Estimated net profit is ₹${Math.round(topRec?.expectedNetProfitRs || 0).toLocaleString()}. ${topRec?.isWaterDeficit ? 'Warning: water requirement exceeds current budget.' : 'Water allocation is within safe limits.'} Review the crop rankings below. This is advisory information, and the final decision is yours.`;

  return (
    <div className="space-y-4 pb-6">
      {/* Mobile Screen Header */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-4 sm:p-5 rounded-2xl text-white shadow-md">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-[10px] font-bold mb-1.5">
          <Compass className="w-3.5 h-3.5 text-emerald-300" />
          <span>Water-Profit Optimization</span>
        </div>
        <h1 className="text-lg sm:text-xl font-black text-white">
          {language === 'hi' ? 'स्मार्ट फसल योजनाकार' : 'Smart Crop Planner'}
        </h1>
        <p className="text-xs text-emerald-200/90 mt-0.5">
          {language === 'hi'
            ? 'पानी की उपलब्धता के अनुसार सबसे अधिक मुनाफा देने वाली फसलें खोजें।'
            : 'Optimize crops by profit per 1,000L water (₹/KL) within your farm water budget.'}
        </p>
      </div>

      {/* Voice Guidance */}
      <VoiceGuidance
        englishText={spokenPlannerEnglish}
        hindiText={spokenPlannerHindi}
        compact
      />

      {/* Quick Scenario Presets Bar */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block px-1">
          Quick Demo Scenarios (One-Tap Test):
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => applyPreset(5, 6000, 'Drip', 'balanced')}
            className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-950 text-xs font-bold whitespace-nowrap shadow-xs active:scale-95"
          >
            🌾 Pitch Deck: 5 Ac • 6,000 KL
          </button>
          <button
            type="button"
            onClick={() => applyPreset(3, 2000, 'Drip', 'water')}
            className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-950 text-xs font-bold whitespace-nowrap shadow-xs active:scale-95"
          >
            💧 Drought Risk: 3 Ac • 2,000 KL
          </button>
          <button
            type="button"
            onClick={() => applyPreset(4, 8000, 'Sprinkler', 'profit')}
            className="px-3 py-1.5 rounded-xl bg-white border border-cyan-300 text-cyan-950 text-xs font-bold whitespace-nowrap shadow-xs active:scale-95"
          >
            🌊 High Water: 4 Ac • 8,000 KL
          </button>
        </div>
      </div>

      {/* Input Parameters Mobile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-emerald-700" />
            <span>Farm Land & Water Inputs</span>
          </h2>
          <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100 px-2 py-0.5 rounded">
            1 KL = 1,000 Litres
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Farm Area (Acres)
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              value={farmArea}
              onChange={(e) => setFarmArea(Math.max(0.1, Number(e.target.value)))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Water Budget (KL)
            </label>
            <input
              type="number"
              min="100"
              step="500"
              value={availableWaterKL}
              onChange={(e) => setAvailableWaterKL(Math.max(100, Number(e.target.value)))}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Irrigation System
            </label>
            <select
              value={irrigationMethod}
              onChange={(e) => setIrrigationMethod(e.target.value as any)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-700"
            >
              <option value="Drip">Drip (92% Eff.)</option>
              <option value="Sprinkler">Sprinkler (82%)</option>
              <option value="Canal / Flood">Flood (70%)</option>
              <option value="Rainfed">Rainfed</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-1">
              Objective
            </label>
            <select
              value={objective}
              onChange={(e) => setObjective(e.target.value as any)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white focus:ring-2 focus:ring-emerald-700"
            >
              <option value="balanced">Balanced (Profit+Water)</option>
              <option value="water">Save Water (Max ₹/KL)</option>
              <option value="profit">Max Net Revenue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suggested Multi-Crop Mix (Slide 5 Pitch Deck) */}
      <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-2xl border border-emerald-200 p-3.5 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-emerald-950 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Optimal Crop Mix Recommendation ({farmArea} Acres):</span>
          </span>
          <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded">
            Water Safe
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-white p-2 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="font-bold text-slate-900 block text-[11px]">Chana</span>
            <span className="text-[10px] text-slate-500">3 Acres</span>
            <span className="text-[10px] font-bold text-cyan-800 block mt-0.5">3,000 KL</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="font-bold text-slate-900 block text-[11px]">Tomato</span>
            <span className="text-[10px] text-slate-500">1 Acre</span>
            <span className="text-[10px] font-bold text-cyan-800 block mt-0.5">2,000 KL</span>
          </div>
          <div className="bg-white p-2 rounded-xl border border-emerald-100 shadow-2xs">
            <span className="font-bold text-slate-900 block text-[11px]">Mustard</span>
            <span className="text-[10px] text-slate-500">1 Acre</span>
            <span className="text-[10px] font-bold text-cyan-800 block mt-0.5">1,000 KL</span>
          </div>
        </div>
      </div>

      {/* Recommendations Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Ranked Crops by Profit / 1,000L Water
          </h3>
          <span className="text-[10px] text-slate-500">
            {recommendations.length} Options
          </span>
        </div>

        <div className="space-y-3">
          {recommendations.map((rec, index) => {
            const isTop = index === 0;

            return (
              <div
                key={rec.crop.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs transition-all ${
                  rec.isWaterDeficit
                    ? 'border-red-300 bg-red-50/20'
                    : isTop
                    ? 'border-2 border-emerald-600 bg-emerald-50/15'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {rec.crop.category}
                      </span>
                      {isTop && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-700 text-white flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" />
                          Rank #1
                        </span>
                      )}
                      {rec.isWaterDeficit && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white flex items-center gap-1">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Deficit
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-black text-slate-900">
                      {rec.crop.cropName}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {rec.crop.nameHi} • {rec.crop.durationDays} Days ({rec.crop.expectedHarvestWindow})
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xl font-black text-emerald-900 block">
                      {rec.score}<span className="text-xs text-slate-400">/100</span>
                    </span>
                    <span className="text-[9px] font-bold uppercase text-slate-400">Fit Score</span>
                  </div>
                </div>

                {/* Metrics 2x2 */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">
                      Profit / 1,000L Water
                    </span>
                    <span className="text-sm font-extrabold text-cyan-800">
                      ₹{rec.profitPerKLWaterRs} / KL
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">
                      Est. Total Net Profit
                    </span>
                    <span className="text-sm font-extrabold text-emerald-800">
                      ₹{rec.expectedNetProfitRs.toLocaleString()}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">
                      Water Req ({farmArea} Ac)
                    </span>
                    <span className={`text-xs font-extrabold ${rec.isWaterDeficit ? 'text-red-600' : 'text-slate-800'}`}>
                      {rec.totalWaterReqKL.toLocaleString()} KL
                    </span>
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <span className="text-[9px] font-bold uppercase text-slate-400 block">
                      Cultivation Cost
                    </span>
                    <span className="text-xs font-extrabold text-slate-800">
                      ₹{rec.expectedCostRs.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Reasons or Deficit Warning */}
                {rec.isWaterDeficit ? (
                  <div className="mt-2.5 p-2 rounded-xl bg-red-100/60 border border-red-200 text-[11px] text-red-900 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
                    <span>Exceeds your water budget by {rec.waterDeficitKL.toLocaleString()} KL. Reduce area or adopt drip.</span>
                  </div>
                ) : (
                  <div className="mt-2.5 text-[11px] text-emerald-950 font-medium">
                    ✓ {rec.reasonsFor[0]}
                  </div>
                )}

                {/* Save to Crop button */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleCreateCropFromPlan(rec)}
                    className="w-full py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5"
                  >
                    <span>Save as Active Crop Record</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
