import React, { useState } from 'react';
import {
  Sprout,
  Calendar,
  Clock,
  Plus,
  Camera,
  FileCheck2,
  Droplets,
  Bug,
  ShieldCheck,
  Wrench,
  ArrowLeft,
  ChevronRight,
  Filter,
  Mic,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { GrowthStage, ActivityType } from '../../types';
import { ActivityLogModal } from '../../components/crops/ActivityLogModal';
import { CropPhotoUploader } from '../../components/crops/CropPhotoUploader';
import { ScoreRing } from '../../components/common/ScoreRing';
import { EvidenceStatusBadge } from '../../components/common/StatusBadge';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';

const ALL_STAGES: GrowthStage[] = [
  'Land Preparation',
  'Sowing / Planting',
  'Germination & Establishment',
  'Vegetative Growth',
  'Flowering',
  'Fruiting / Grain Formation',
  'Maturity',
  'Harvested',
];

interface CropDetailsPageProps {
  cropId: string;
  navigate: (path: string) => void;
}

export const CropDetailsPage: React.FC<CropDetailsPageProps> = ({ cropId, navigate }) => {
  const { showToast } = useToast();
  const { language } = useLanguage();

  const [refreshKey, setRefreshKey] = useState(0);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'Irrigation' | 'care'>('all');

  const crop = dataService.getCrop(cropId) || dataService.getCrops()[0];
  const logs = dataService.getLogs(crop?.id);
  const evidence = dataService.getEvidence(crop?.id);
  const passport = crop ? dataService.getPassport(crop.id) : null;

  if (!crop) {
    return (
      <div className="p-8 text-center">
        <p>Crop not found.</p>
        <button onClick={() => navigate('/farmer/crops')} className="text-emerald-800 underline mt-2">
          Back to My Crops
        </button>
      </div>
    );
  }

  const currentStageIndex = ALL_STAGES.indexOf(crop.growthStage);

  const handleStageChange = (newStage: GrowthStage) => {
    dataService.updateCrop(crop.id, { growthStage: newStage });
    // Also record an automatic growth observation log
    dataService.addLog({
      cropRecordId: crop.id,
      farmerId: crop.farmerId,
      activityType: 'Growth Observation',
      activityDate: new Date().toISOString(),
      description: `Crop transitioned to "${newStage}" stage.`,
    });
    showToast(`Updated growth stage to ${newStage}`, 'success');
    setRefreshKey(prev => prev + 1);
  };

  const filteredLogs = logs.filter(log => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'Irrigation') return log.activityType === 'Irrigation';
    return log.activityType === 'Fertilizer Application' ||
           log.activityType === 'Pest / Disease Observation' ||
           log.activityType === 'Pest Control Action' ||
           log.activityType === 'Crop Maintenance';
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Mobile Top Action Bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => navigate('/farmer/crops')}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My Crops</span>
        </button>

        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
          {crop.publicId}
        </span>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setShowLogModal(true)}
          className="p-2.5 rounded-xl bg-emerald-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-transform flex flex-col items-center justify-center gap-1 text-center"
        >
          <div className="flex items-center gap-1">
            <Mic className="w-3.5 h-3.5 text-emerald-300" />
            <Plus className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[11px] leading-tight">
            {language === 'hi' ? 'बोलकर / लॉग' : 'Log / Voice'}
          </span>
        </button>

        <button
          onClick={() => setShowPhotoModal(true)}
          className="p-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-xs active:scale-95 transition-transform flex flex-col items-center justify-center gap-1 text-center"
        >
          <Camera className="w-4 h-4" />
          <span className="text-[11px] leading-tight">Add Photo</span>
        </button>

        <button
          onClick={() => navigate(`/passport/${crop.publicId}`)}
          className="p-2.5 rounded-xl bg-white border border-emerald-800 text-emerald-950 text-xs font-bold shadow-xs active:scale-95 transition-transform flex flex-col items-center justify-center gap-1 text-center"
        >
          <FileCheck2 className="w-4 h-4 text-emerald-700" />
          <span className="text-[11px] leading-tight">Passport</span>
        </button>
      </div>

      {/* Main Crop Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <span className="text-[10px] text-slate-400">
              Sown: {crop.plantingDate}
            </span>
            <h1 className="text-3xl font-black text-slate-900">
              {crop.cropName}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Variety: {crop.variety || 'Standard'} • Farm: {crop.farmName} ({crop.cultivatedArea} {crop.cultivatedAreaUnit})
            </p>
          </div>

          {passport && (
            <div className="flex items-center gap-4 bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
              <ScoreRing score={passport.score} size="md" showGrade={false} />
              <div>
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Passport Score
                </div>
                <div className="text-lg font-black text-emerald-900">
                  {passport.scoreBreakdown.scoreGrade}
                </div>
                <div className="text-[10px] text-slate-500">
                  {logs.length} activities • {evidence.length} photos
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Growth Stages Pipeline */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Crop Lifecycle & Growth Stage Progress
            </h3>
            <span className="text-xs font-medium text-emerald-800">
              Current: <strong>{crop.growthStage}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {ALL_STAGES.map((stg, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;

              return (
                <button
                  key={stg}
                  type="button"
                  onClick={() => handleStageChange(stg)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-sm font-bold scale-[1.02]'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100 font-semibold'
                      : 'bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <div className="text-[10px] mb-1 font-mono">Stage {idx + 1}</div>
                  <div className="text-[11px] leading-tight truncate">{stg}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Activity Timeline and Photos Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Chronological Activity Timeline */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-700" />
              <span>Chronological Activity Timeline ({filteredLogs.length})</span>
            </h2>

            {/* Filter Pills */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeFilter === 'all' ? 'bg-white shadow-xs font-bold text-slate-800' : 'text-slate-600'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter('Irrigation')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeFilter === 'Irrigation' ? 'bg-white shadow-xs font-bold text-slate-800' : 'text-slate-600'
                }`}
              >
                Paani (Water)
              </button>
              <button
                onClick={() => setActiveFilter('care')}
                className={`px-2.5 py-1 rounded-lg transition-colors ${
                  activeFilter === 'care' ? 'bg-white shadow-xs font-bold text-slate-800' : 'text-slate-600'
                }`}
              >
                Crop Care
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
            {filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No activities recorded in this category yet. Click "Log Activity" above to add your first record.
              </div>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-emerald-200">
                {filteredLogs.map((log) => {
                  let badgeColor = 'bg-slate-100 text-slate-700';
                  if (log.activityType === 'Irrigation') badgeColor = 'bg-cyan-100 text-cyan-800';
                  if (log.activityType.includes('Pest')) badgeColor = 'bg-rose-100 text-rose-800';
                  if (log.activityType === 'Fertilizer Application') badgeColor = 'bg-emerald-100 text-emerald-800';

                  return (
                    <div key={log.id} className="relative group">
                      <div className="absolute -left-[27px] top-1.5 w-3 h-3 rounded-full bg-emerald-700 border-2 border-white ring-2 ring-emerald-300" />
                      
                      <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                            {log.activityType}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(log.activityDate).toLocaleDateString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-800">
                          {log.description}
                        </p>

                        {log.waterVolumeKL && log.waterVolumeKL > 0 && (
                          <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded-md border border-cyan-200">
                            <Droplets className="w-3 h-3 text-cyan-600" />
                            <span>Water Applied: {log.waterVolumeKL} KL</span>
                          </div>
                        )}

                        {log.notes && (
                          <p className="mt-1 text-[11px] text-slate-500 italic">
                            "{log.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Photo Evidence Gallery */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Camera className="w-4 h-4 text-emerald-700" />
              <span>Supporting Photo Evidence ({evidence.length})</span>
            </h2>
            <button
              onClick={() => setShowPhotoModal(true)}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950"
            >
              + Add Photo
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            {evidence.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No photographs uploaded yet. Adding photo proof strengthens your Crop Passport for buyers.
              </div>
            ) : (
              <div className="space-y-4">
                {evidence.map((ev) => (
                  <div key={ev.id} className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50">
                    <img
                      src={ev.storagePath}
                      alt={ev.description}
                      className="w-full h-44 object-cover"
                    />
                    <div className="p-3.5 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          {ev.category}
                        </span>
                        <EvidenceStatusBadge status={ev.reviewStatus} size="sm" />
                      </div>

                      <p className="text-xs text-slate-800 font-medium leading-snug">
                        {ev.description}
                      </p>

                      {ev.reviewNote && (
                        <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-900">
                          <strong>Reviewer:</strong> {ev.reviewNote}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Captured: {ev.captureDate || 'Undated'}</span>
                        <span>{ev.publicSharingEnabled ? 'Public on Passport' : 'Private'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showLogModal && (
        <ActivityLogModal
          crop={crop}
          onClose={() => setShowLogModal(false)}
          onSuccess={() => setRefreshKey(prev => prev + 1)}
        />
      )}

      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CropPhotoUploader
              crops={[crop]}
              selectedCropId={crop.id}
              onUploadSuccess={() => {
                setShowPhotoModal(false);
                setRefreshKey(prev => prev + 1);
              }}
              onCancel={() => setShowPhotoModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
