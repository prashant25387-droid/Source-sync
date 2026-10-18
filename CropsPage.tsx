import React, { useState } from 'react';
import {
  Sprout,
  Plus,
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  TrendingUp,
  FileCheck2,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { CropRecord } from '../../types';
import { ScoreRing } from '../../components/common/ScoreRing';
import { useLanguage } from '../../context/LanguageContext';

interface CropsPageProps {
  navigate: (path: string) => void;
}

export const CropsPage: React.FC<CropsPageProps> = ({ navigate }) => {
  const { t, language } = useLanguage();
  const crops = dataService.getCrops('farmer-1');

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-800 to-emerald-950 p-4 sm:p-6 rounded-2xl text-white shadow-md">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-bold mb-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-300" />
            <span>Farm Production Records</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {language === 'hi' ? 'मेरी फसलें और विकास ट्रैकर' : 'My Crops & Field Tracking'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-1">
            Track growth stages, log field events, and build verifiable passport records.
          </p>
        </div>

        <button
          onClick={() => navigate('/farmer/crop-planner')}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-emerald-950 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 self-start sm:self-auto active:scale-95"
        >
          <Plus className="w-4 h-4 text-emerald-800" />
          <span>{t.actions.addCrop}</span>
        </button>
      </div>

      {/* Crop Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {crops.map((crop) => {
          const pass = dataService.getPassport(crop.id);
          const logs = dataService.getLogs(crop.id);
          const evidence = dataService.getEvidence(crop.id);

          return (
            <div
              key={crop.id}
              className="bg-white rounded-2xl border border-emerald-900/10 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                      {crop.publicId}
                    </span>
                    <h3 className="text-lg font-black text-slate-900 mt-1.5">
                      {crop.cropName}
                    </h3>
                    {crop.variety && (
                      <p className="text-xs text-slate-500 font-medium">
                        Variety: {crop.variety}
                      </p>
                    )}
                  </div>

                  {pass && (
                    <ScoreRing score={pass.score} size="sm" showGrade={false} />
                  )}
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>{crop.farmName} ({crop.cultivatedArea} {crop.cultivatedAreaUnit})</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Clock className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Stage: <strong className="text-slate-800">{crop.growthStage}</strong></span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                    <span>Harvest: <strong className="text-slate-800">{crop.expectedHarvestDate}</strong></span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-1">
                    <div className="font-extrabold text-slate-900">{logs.length}</div>
                    <div className="text-[10px] text-slate-400">Logs</div>
                  </div>
                  <div className="p-1 border-x border-slate-100">
                    <div className="font-extrabold text-slate-900">{evidence.length}</div>
                    <div className="text-[10px] text-slate-400">Photos</div>
                  </div>
                  <div className="p-1">
                    <div className="font-extrabold text-emerald-800">{pass?.score || 0}/100</div>
                    <div className="text-[10px] text-slate-400">Score</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => navigate(`/farmer/crops/${crop.id}`)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold transition-colors flex items-center gap-1.5 w-full justify-center"
                >
                  <span>Track Growth & Logs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
