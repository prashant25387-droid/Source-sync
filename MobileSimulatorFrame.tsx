import React, { useState } from 'react';
import {
  Smartphone,
  Maximize2,
  Minimize2,
  RotateCcw,
  Compass,
  Camera,
  FileCheck2,
  ShoppingBag,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { dataService } from '../../services/dataService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';

interface MobileSimulatorFrameProps {
  children: React.ReactNode;
  currentPath: string;
  navigate: (path: string) => void;
}

export const MobileSimulatorFrame: React.FC<MobileSimulatorFrameProps> = ({
  children,
  currentPath,
  navigate,
}) => {
  const { showToast } = useToast();
  const { role, switchRole } = useAuth();
  const [viewMode, setViewMode] = useState<'chassis' | 'clean' | 'full'>(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      return 'full';
    }
    return 'chassis';
  });

  const handleResetDemo = () => {
    if (confirm('Reset demo farm records to initial baseline?')) {
      dataService.resetToDefaults();
      showToast('Demo data reset to baseline.', 'info');
      window.location.reload();
    }
  };

  const judgeWorkflowSteps = [
    {
      id: 'step1',
      title: '1. Plan (Water-Profit)',
      path: '/farmer/crop-planner',
      role: 'farmer' as const,
      icon: Compass,
    },
    {
      id: 'step2',
      title: '2. Track & Log Paani',
      path: '/farmer/crops/crop-2',
      role: 'farmer' as const,
      icon: CheckCircle2,
    },
    {
      id: 'step3',
      title: '3. Photo Evidence',
      path: '/farmer/evidence',
      role: 'farmer' as const,
      icon: Camera,
    },
    {
      id: 'step4',
      title: '4. Crop Passport (83/100)',
      path: '/passport/FS-8X29KQ',
      role: 'farmer' as const,
      icon: FileCheck2,
    },
    {
      id: 'step5',
      title: '5. Pre-Harvest Mandi',
      path: '/marketplace',
      role: 'buyer' as const,
      icon: ShoppingBag,
    },
    {
      id: 'step6',
      title: '6. Reviewer Queue',
      path: '/admin/evidence-review',
      role: 'admin' as const,
      icon: ShieldCheck,
    },
  ];

  return (
    <div className={`min-h-screen flex flex-col font-sans ${viewMode === 'full' ? 'bg-[#FAF9F2]' : 'bg-slate-950'}`}>
      {/* Top Judge Presentation Bar (Visible on Laptops/Desktops) */}
      <div className="hidden sm:flex bg-slate-900 border-b border-slate-800 text-white px-3 sm:px-6 py-2.5 z-50 no-print flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-emerald-700 flex items-center justify-center text-white font-bold text-xs">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">
                FasalSetu (फसलसेतु)
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-900 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700">
                Android App Demo
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Paani se planning. Bharose se selling. • Hackathon Judge Presentation Mode
            </p>
          </div>
        </div>

        {/* Quick 1-Click Guided Tour for Judges */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <span className="text-[11px] font-bold text-emerald-400 px-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Judge Tour:</span>
          </span>
          {judgeWorkflowSteps.map((step) => {
            const Icon = step.icon;
            const isActive = currentPath === step.path || (step.path !== '/' && currentPath.startsWith(step.path));

            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  switchRole(step.role);
                  navigate(step.path);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>

        {/* View Mode & Reset Controls */}
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
            <button
              onClick={() => setViewMode('chassis')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                viewMode === 'chassis' ? 'bg-emerald-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Smartphone chassis frame"
            >
              📱 Phone Frame
            </button>
            <button
              onClick={() => setViewMode('clean')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                viewMode === 'clean' ? 'bg-emerald-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Mobile column view without chassis"
            >
              📱 Mobile Width
            </button>
            <button
              onClick={() => setViewMode('full')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors ${
                viewMode === 'full' ? 'bg-emerald-800 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Full responsive screen"
            >
              🖥️ Full View
            </button>
          </div>

          <button
            onClick={handleResetDemo}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
            title="Reset demo data to initial state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      <div className={`flex-1 flex items-center justify-center ${viewMode === 'chassis' ? 'p-3 sm:p-6 bg-slate-950' : viewMode === 'clean' ? 'p-0 sm:py-6 bg-slate-900' : 'p-0 bg-[#FAF9F2]'}`}>
        {viewMode === 'chassis' ? (
          /* Google Pixel 9 / Android Smartphone Frame */
          <div className="relative w-full max-w-[420px] h-[min(92vh,850px)] bg-slate-900 rounded-[50px] p-3 shadow-[0_25px_70px_rgba(0,0,0,0.8),0_0_0_8px_#1e293b,0_0_0_11px_#334155] flex flex-col ring-1 ring-white/10">
            {/* Camera Punch Hole */}
            <div className="absolute top-5 left-1/2 -translate-x-1/2 w-4 h-4 bg-black rounded-full z-50 ring-2 ring-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
            </div>

            {/* Inner Android Touchscreen */}
            <div className="flex-1 w-full h-full bg-[#FAF9F2] rounded-[40px] overflow-hidden flex flex-col relative select-none">
              <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth flex flex-col">
                {children}
              </div>

              {/* Android Gesture Navigation Bar Pill */}
              <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-400/60 rounded-full pointer-events-none z-50" />
            </div>
          </div>
        ) : viewMode === 'clean' ? (
          /* Clean Mobile Width Column */
          <div className="w-full max-w-[430px] min-h-[95vh] bg-[#FAF9F2] rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border border-slate-700">
            <div className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth flex flex-col">
              {children}
            </div>
          </div>
        ) : (
          /* Fullscreen Responsive Mode */
          <div className="w-full min-h-screen bg-[#FAF9F2] flex flex-col">
            {children}
          </div>
        )}
      </div>
    </div>
  );
};
