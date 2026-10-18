import React from 'react';
import {
  Sprout,
  Compass,
  FileCheck2,
  Calendar,
  Camera,
  ShoppingBag,
  Inbox,
  ArrowRight,
  TrendingUp,
  Droplets,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Mic,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { dataService } from '../../services/dataService';
import { ScoreRing } from '../../components/common/ScoreRing';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface FarmerDashboardProps {
  navigate: (path: string) => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({ navigate }) => {
  const { currentUser } = useAuth();
  const { t, language } = useLanguage();

  const crops = dataService.getCrops('farmer-1');
  const allLogs = dataService.getLogs();
  const allEvidence = dataService.getEvidence();
  const bookings = dataService.getBookings('farmer-1', 'farmer');

  const pendingEvidence = allEvidence.filter(e => e.reviewStatus === 'Pending Review');
  const totalArea = crops.reduce((acc, c) => acc + c.cultivatedArea, 0);

  // Calculate average or top passport score
  const tomatoCrop = crops.find(c => c.cropName.includes('Tomato')) || crops[0];
  const primaryPassport = tomatoCrop ? dataService.getPassport(tomatoCrop.id) : null;
  const primaryScore = primaryPassport ? primaryPassport.score : 0;

  // Chart data: Cost vs Revenue
  const cropEconomicsData = crops.map(c => {
    const estRev = (c.estimatedQuantity * c.expectedPricePerUnit);
    // Estimated cost assumption per crop
    const estCost = Math.round(estRev * 0.42);
    return {
      name: c.cropName.split(' ')[0],
      Cost: estCost,
      Revenue: estRev,
      Profit: estRev - estCost,
    };
  });

  const COLORS = ['#166534', '#0284c7', '#d97706', '#9333ea'];

  return (
    <div className="space-y-4 pb-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-4 sm:p-6 rounded-2xl text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-bold mb-1.5">
            <Sprout className="w-3.5 h-3.5 text-emerald-300" />
            <span>Farmer Workspace</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            {language === 'hi' ? `नमस्ते, ${currentUser?.fullName || 'किसान भाई'}` : `Welcome, ${currentUser?.fullName || 'Farmer'}`}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-200/90 mt-1">
            Saraswati Agri Farm • 5 Acres • Drip Fertigation Active • Nashik District
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/farmer/history')}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95 border border-emerald-400/40"
          >
            <Mic className="w-4 h-4 text-emerald-200" />
            <span>{language === 'hi' ? 'बोलकर दर्ज करें' : 'Voice Farm Log'}</span>
          </button>
          <button
            onClick={() => navigate('/farmer/crop-planner')}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 text-emerald-950 font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Compass className="w-4 h-4 text-emerald-800" />
            <span>Water-Smart Planner</span>
          </button>
          <button
            onClick={() => navigate('/farmer/evidence')}
            className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Camera className="w-4 h-4" />
            <span>Add Photo Proof</span>
          </button>
        </div>
      </div>

      {/* Hero Voice Farm Diary Banner */}
      <div
        onClick={() => navigate('/farmer/history')}
        className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-lg border border-emerald-600/40 cursor-pointer hover:border-emerald-400 transition-all group"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform shrink-0">
              <Mic className="w-7 h-7 text-emerald-100" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 text-[10px] font-bold mb-1">
                <span>{t.farmHistory.tabLabel}</span>
                <span>• 3G/4G सुरक्षित</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white leading-tight">
                {language === 'hi' ? 'खेत की डायरी व सिंचाई का इतिहास' : 'Farm Diary & Irrigation History'}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {language === 'hi'
                  ? 'बोलकर पानी और खाद दर्ज करें। कमजोर नेटवर्क में भी सुरक्षित रहता है।'
                  : 'Speak to log water and fertilizer. Works even on weak mobile networks.'}
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1 px-4 py-2 rounded-xl bg-white/10 text-emerald-200 text-xs font-bold shrink-0 group-hover:bg-white/20 transition-colors">
            <span>{language === 'hi' ? 'डायरी खोलें' : 'Open Diary'}</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 8 Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Active Crops */}
        <div
          onClick={() => navigate('/farmer/crops')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-900/10 shadow-xs hover:border-emerald-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Active Crops</span>
            <Sprout className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{crops.length}</div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
            View crop records →
          </span>
        </div>

        {/* Cultivated Area */}
        <div
          onClick={() => navigate('/farmer/profile')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-900/10 shadow-xs hover:border-emerald-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Cultivated Area</span>
            <Layers className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalArea} <span className="text-xs font-semibold text-slate-500">Acres</span></div>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">
            Across 2 farm plots
          </span>
        </div>

        {/* Season Logs */}
        <div
          onClick={() => navigate('/farmer/crops')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-900/10 shadow-xs hover:border-emerald-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Season Logs</span>
            <Calendar className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{allLogs.length}</div>
          <span className="text-[10px] text-cyan-700 font-semibold mt-1 block">
            Paani & care logged
          </span>
        </div>

        {/* Passport Score */}
        <div
          onClick={() => navigate('/farmer/passport')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-900/10 shadow-xs hover:border-emerald-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Passport Score</span>
            <FileCheck2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-emerald-900">{primaryScore}<span className="text-xs text-slate-400 font-bold">/100</span></div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
            Gold Grade (Verified)
          </span>
        </div>

        {/* Photo Evidence */}
        <div
          onClick={() => navigate('/farmer/evidence')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-900/10 shadow-xs hover:border-emerald-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Crop Photos</span>
            <Camera className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{allEvidence.length}</div>
          <span className="text-[10px] text-slate-500 font-medium mt-1 block">
            Growth stage proofs
          </span>
        </div>

        {/* Evidence Pending Review */}
        <div
          onClick={() => navigate('/farmer/evidence')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-900/10 shadow-xs hover:border-emerald-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">In Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-800">{pendingEvidence.length}</div>
          <span className="text-[10px] text-amber-700 font-semibold mt-1 block">
            Awaiting Agronomist
          </span>
        </div>

        {/* Buyer Booking Requests */}
        <div
          onClick={() => navigate('/farmer/requests')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-900/10 shadow-xs hover:border-emerald-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Buyer Inquiries</span>
            <Inbox className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-black text-slate-900">{bookings.length}</div>
          <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
            Pre-harvest orders →
          </span>
        </div>

        {/* Next Harvest */}
        <div
          onClick={() => navigate('/farmer/crops')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-900/10 shadow-xs hover:border-emerald-700 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">Next Harvest</span>
            <Calendar className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-lg font-black text-slate-900 mt-1">10 Jan 2027</div>
          <span className="text-[10px] text-slate-500 font-medium block">
            Tomato (150 Quintals)
          </span>
        </div>
      </div>

      {/* Interactive Charts & Next Steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Economics Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Crop Economics: Estimated Cultivation Cost vs Revenue (₹)
            </h3>
            <span className="text-[10px] text-slate-400 font-semibold">Active Season</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cropEconomicsData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`₹${Number(value).toLocaleString()}`, '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="Cost" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Cultivation Cost" />
                <Bar dataKey="Revenue" fill="#166534" radius={[4, 4, 0, 0]} name="Expected Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Next Steps Actionable Items */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Actionable Next Steps
            </h3>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              8 Tasks
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <button
              onClick={() => navigate('/farmer/profile')}
              className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 text-left flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">Complete farm profile & soil specs</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/farmer/crop-planner')}
              className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 text-left flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">Run crop planner for next season</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/farmer/crops')}
              className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 text-left flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">Log this week's irrigation activity</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/farmer/evidence')}
              className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 text-left flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">Upload new crop photograph</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/farmer/passport')}
              className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 text-left flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">Review Crop Passport & QR code</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => navigate('/farmer/requests')}
              className="w-full p-2.5 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/40 text-left flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold text-slate-800">Respond to buyer booking inquiries</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
