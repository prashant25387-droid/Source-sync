import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Eye,
  AlertTriangle,
  Calendar,
  Layers,
  FileCheck2,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { CropEvidence } from '../../types';
import { EvidenceStatusBadge } from '../../components/common/StatusBadge';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';

export const EvidenceReviewPage: React.FC = () => {
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);

  const [selectedEvidence, setSelectedEvidence] = useState<CropEvidence | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'reviewed'>('pending');

  const evidenceList = dataService.getEvidence();

  const pendingList = evidenceList.filter(e => e.reviewStatus === 'Pending Review' || e.reviewStatus === 'Uploaded');
  const reviewedList = evidenceList.filter(e => e.reviewStatus !== 'Pending Review' && e.reviewStatus !== 'Uploaded');

  const handleReviewAction = (
    status: 'Approved as Supporting Evidence' | 'Rejected' | 'Resubmission Requested'
  ) => {
    if (!selectedEvidence) return;

    if (status === 'Rejected' && !reviewNote.trim()) {
      showToast('A reviewer reason is required when rejecting evidence.', 'error');
      return;
    }

    const note = reviewNote.trim() || (status === 'Approved as Supporting Evidence' ? 'Visual verification confirms crop growth stage and stated inputs.' : 'Please upload a clearer photograph.');

    dataService.reviewEvidence(
      selectedEvidence.id,
      'admin-1',
      'Dr. Sunita Deshmukh (KVK)',
      status,
      note
    );

    showToast(`Evidence marked as "${status}". Audit log recorded.`, 'success');
    setSelectedEvidence(null);
    setReviewNote('');
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 p-4 sm:p-6 rounded-2xl text-white shadow-md">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold mb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>KVK / Agronomist Verification Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {language === 'hi' ? 'फसल प्रमाण समीक्षा कतार' : 'Evidence Verification & Review Queue'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-1.5 leading-relaxed">
            Review farmer-uploaded crop photographs against reported field activities. Approvals are recorded with an immutable agronomist audit stamp.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'pending'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Pending Review Queue ({pendingList.length})
        </button>
        <button
          onClick={() => setActiveTab('reviewed')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'reviewed'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Reviewed Audit History ({reviewedList.length})
        </button>
      </div>

      {/* Queue Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Evidence Items List */}
        <div className="lg:col-span-7 space-y-3">
          {(activeTab === 'pending' ? pendingList : reviewedList).length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 text-slate-400 text-xs">
              No evidence items in this queue.
            </div>
          ) : (
            <div className="space-y-3">
              {(activeTab === 'pending' ? pendingList : reviewedList).map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedEvidence(ev)}
                  className={`bg-white rounded-2xl border p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row gap-3 ${
                    selectedEvidence?.id === ev.id
                      ? 'border-2 border-emerald-800 ring-2 ring-emerald-800/10'
                      : 'border-slate-200'
                  }`}
                >
                  <img
                    src={ev.storagePath}
                    alt={ev.description}
                    className="w-full sm:w-32 h-24 rounded-xl object-cover shrink-0"
                  />

                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                          {ev.cropName} • {ev.category}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5 line-clamp-1">
                          {ev.description}
                        </h4>
                      </div>
                      <EvidenceStatusBadge status={ev.reviewStatus} size="sm" />
                    </div>

                    <div className="text-[11px] text-slate-500 space-y-0.5">
                      <div>Growth Stage: <strong>{ev.growthStage}</strong></div>
                      <div>Capture Date: <strong>{ev.captureDate || 'Not specified'}</strong></div>
                    </div>

                    {ev.reviewNote && (
                      <div className="p-2 rounded-lg bg-slate-50 text-[10px] text-slate-600 border border-slate-100">
                        <strong>Review Note:</strong> {ev.reviewNote}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Review Action Panel */}
        <div className="lg:col-span-5">
          {selectedEvidence ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4 sticky top-20">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                  Active Review Dossier
                </span>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mt-1">
                  {selectedEvidence.cropName}
                </h3>
                <p className="text-xs text-slate-500">
                  Category: {selectedEvidence.category}
                </p>
              </div>

              {/* Big Image Preview */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 max-h-56 flex items-center justify-center">
                <img
                  src={selectedEvidence.storagePath}
                  alt={selectedEvidence.description}
                  className="max-h-56 w-full object-contain"
                />
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Farmer Description:</span>
                  <p className="font-medium text-slate-800 mt-0.5">
                    {selectedEvidence.description}
                  </p>
                </div>

                {selectedEvidence.notes && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block font-semibold">Additional Notes:</span>
                    <p className="font-medium text-slate-800 mt-0.5">
                      {selectedEvidence.notes}
                    </p>
                  </div>
                )}
              </div>

              {/* Reviewer Note Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Agronomist Review Note / Reason *
                </label>
                <textarea
                  rows={3}
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                  placeholder="e.g. Verified canopy spread matches vegetative stage. Irrigation drip laterals confirmed."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleReviewAction('Approved as Supporting Evidence')}
                  className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve as Supporting Evidence</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleReviewAction('Resubmission Requested')}
                    className="py-2.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ask Clearer Photo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReviewAction('Rejected')}
                    className="py-2.5 rounded-xl bg-red-100 hover:bg-red-200 text-red-900 font-bold text-xs transition-colors flex items-center justify-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject Photo</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl border border-dashed border-slate-300 p-8 text-center text-xs text-slate-400">
              Select an evidence item from the queue to inspect and verify.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
