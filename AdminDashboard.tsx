import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Camera,
  Users,
  FileCheck2,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { useLanguage } from '../../context/LanguageContext';

export const AdminDashboard: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const { language } = useLanguage();

  const evidence = dataService.getEvidence();
  const crops = dataService.getCrops();
  const bookings = dataService.getBookings();
  const profiles = dataService.getProfiles();

  const pendingEvidence = evidence.filter(e => e.reviewStatus === 'Pending Review' || e.reviewStatus === 'Uploaded');
  const approvedEvidence = evidence.filter(e => e.reviewStatus === 'Approved as Supporting Evidence');

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-emerald-950 p-4 sm:p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>KVK / Agronomist Control</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {language === 'hi' ? 'समीक्षा व सत्यापन नियंत्रण केंद्र' : 'Agronomist Review Center'}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-1">
            Maintain platform integrity, audit submitted growth evidence, and uphold transparent passport scoring.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/evidence-review')}
          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 self-start md:self-auto active:scale-95"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Review Queue ({pendingEvidence.length})</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Pending Reviews</span>
          <div className="text-3xl font-black text-amber-700 mt-1">{pendingEvidence.length}</div>
          <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Awaiting inspection</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Approved Proofs</span>
          <div className="text-3xl font-black text-emerald-800 mt-1">{approvedEvidence.length}</div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Supporting evidence</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Active Crop Passports</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{crops.length}</div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Monitored fields</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Buyer Bookings</span>
          <div className="text-3xl font-black text-slate-900 mt-1">{bookings.length}</div>
          <span className="text-[10px] text-slate-400 font-medium mt-1 block">Advance contracts</span>
        </div>
      </div>

      {/* Quick Access to Queue */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Pending Photo Evidence Queue
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            There are {pendingEvidence.length} submitted photos waiting for agronomist review. Each decision records an immutable audit log.
          </p>
        </div>

        <button
          onClick={() => navigate('/admin/evidence-review')}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 shrink-0 active:scale-95"
        >
          <span>Go to Review Queue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
