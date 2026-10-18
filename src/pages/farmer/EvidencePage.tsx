import React, { useState } from 'react';
import {
  Camera,
  Plus,
  Filter,
  Globe,
  Lock,
  CheckCircle2,
  Clock,
  Sparkles,
  XCircle,
  RotateCcw,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { CropEvidence } from '../../types';
import { CropPhotoUploader } from '../../components/crops/CropPhotoUploader';
import { EvidenceStatusBadge } from '../../components/common/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export const EvidencePage: React.FC = () => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();

  const [refreshKey, setRefreshKey] = useState(0);
  const [showUploader, setShowUploader] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const crops = dataService.getCrops('farmer-1');
  const allEvidence = dataService.getEvidence();

  const filteredEvidence = allEvidence.filter((ev) => {
    if (statusFilter === 'all') return true;
    return ev.reviewStatus === statusFilter;
  });

  const handleToggleSharing = (evId: string, current: boolean) => {
    const item = allEvidence.find(e => e.id === evId);
    if (item) {
      item.publicSharingEnabled = !current;
      showToast(
        !current ? 'Photo enabled on public Crop Passport' : 'Photo set to private',
        'info'
      );
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Mobile Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-4 sm:p-5 rounded-2xl text-white shadow-md flex items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-[10px] font-bold mb-1">
            <Camera className="w-3.5 h-3.5 text-emerald-300" />
            <span>Verifiable Field Proofs</span>
          </div>
          <h1 className="text-lg font-black text-white">
            {language === 'hi' ? 'फसल फोटो और प्रमाण' : 'Crop Photos & Evidence'}
          </h1>
          <p className="text-xs text-emerald-200/90 mt-0.5">
            Timestamped photos verified by agronomists.
          </p>
        </div>

        <button
          onClick={() => setShowUploader(!showUploader)}
          className="px-4 py-2 rounded-xl bg-white text-emerald-950 font-extrabold text-xs shadow-md active:scale-95 transition-transform flex items-center gap-1.5 shrink-0"
        >
          <Camera className="w-4 h-4 text-emerald-800" />
          <span>{showUploader ? 'Close' : '+ Add Photo'}</span>
        </button>
      </div>

      {/* Uploader Card */}
      {showUploader && (
        <div className="relative">
          <CropPhotoUploader
            crops={crops}
            onUploadSuccess={() => {
              setShowUploader(false);
              setRefreshKey(prev => prev + 1);
            }}
            onCancel={() => setShowUploader(false)}
          />
        </div>
      )}

      {/* Android Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'all', label: 'All Photos' },
          { key: 'Approved as Supporting Evidence', label: '✓ Approved' },
          { key: 'Pending Review', label: '⏳ In Review' },
          { key: 'Rejected', label: '✕ Rejected' },
        ].map((chip) => (
          <button
            key={chip.key}
            onClick={() => setStatusFilter(chip.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              statusFilter === chip.key
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {/* Photo Evidence Stream */}
      <div className="space-y-3">
        {filteredEvidence.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200">
            No photos found under this filter. Tap "+ Add Photo" to upload proof.
          </div>
        ) : (
          filteredEvidence.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-2.5"
            >
              {/* Photo */}
              <div className="relative h-52 bg-slate-900">
                <img
                  src={ev.storagePath}
                  alt={ev.description}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 left-2.5">
                  <EvidenceStatusBadge status={ev.reviewStatus} size="sm" />
                </div>
                <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                  {ev.growthStage}
                </div>
              </div>

              {/* Body */}
              <div className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider">
                    {ev.cropName} • {ev.category}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {ev.captureDate || 'Today'}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-900 leading-snug">
                  {ev.description}
                </p>

                {/* Reviewer Note */}
                {ev.reviewNote && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-950">
                    <span className="font-bold text-emerald-900 block flex items-center gap-1 mb-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{ev.reviewerName || 'KVK Agronomist'}</span>
                    </span>
                    <p className="text-[11px] leading-relaxed">
                      "{ev.reviewNote}"
                    </p>
                  </div>
                )}

                {/* Privacy & Action */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-[11px] text-slate-500">
                    {ev.publicSharingEnabled ? (
                      <>
                        <Globe className="w-3 h-3 text-emerald-700" />
                        <span>Public on Passport</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-slate-400" />
                        <span>Private</span>
                      </>
                    )}
                  </span>

                  <button
                    onClick={() => handleToggleSharing(ev.id, ev.publicSharingEnabled)}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950"
                  >
                    {ev.publicSharingEnabled ? 'Make Private' : 'Make Public'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
