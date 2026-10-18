import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sprout,
  Droplets,
  Languages,
  UserCheck,
  ChevronDown,
  Volume2,
  Wifi,
  BatteryMedium,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { dataService } from '../../services/dataService';
import { useToast } from '../../context/ToastContext';

interface MobileHeaderProps {
  currentPath: string;
  navigate: (path: string) => void;
  onOpenVoiceGuide?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  currentPath,
  navigate,
}) => {
  const { role, switchRole, currentUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { showToast } = useToast();

  const [currentTime, setCurrentTime] = useState('09:41');
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const isRootOrDashboard =
    currentPath === '/' ||
    currentPath === '/farmer/dashboard' ||
    currentPath === '/buyer/dashboard' ||
    currentPath === '/admin/dashboard';

  const getScreenTitle = () => {
    if (currentPath === '/') return t.brand;
    if (currentPath.includes('/crop-planner')) return t.nav.cropPlanner;
    if (currentPath.includes('/weather')) return t.nav.weather;
    if (currentPath.includes('/evidence')) return t.nav.evidence;
    if (currentPath.includes('/passport/')) return 'Crop Passport';
    if (currentPath.includes('/passport')) return t.nav.passport;
    if (currentPath.includes('/marketplace')) return t.nav.marketplace;
    if (currentPath.includes('/requests')) return t.nav.requests;
    if (currentPath.includes('/requirements')) return t.nav.requirements;
    if (currentPath.includes('/evidence-review')) return t.nav.adminReview;
    if (currentPath.includes('/profile')) return 'My Farm';
    if (currentPath.includes('/crops')) return t.nav.crops;
    return t.brand;
  };

  const handleBack = () => {
    if (role === 'farmer') navigate('/farmer/dashboard');
    else if (role === 'buyer') navigate('/buyer/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
    else navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs select-none">
      {/* Mobile OS Status Bar */}
      <div className="bg-emerald-950 text-emerald-200 px-5 pt-1.5 pb-1 flex items-center justify-between text-[11px] font-semibold tracking-tight">
        <span>{currentTime}</span>
        <div className="flex items-center gap-2 text-emerald-300">
          <span className="text-[10px] font-bold tracking-widest">5G</span>
          <Wifi className="w-3.5 h-3.5" />
          <BatteryMedium className="w-4 h-4 text-emerald-400" />
        </div>
      </div>

      {/* Main Mobile App Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          {!isRootOrDashboard ? (
            <button
              onClick={handleBack}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-700 active:scale-95 transition-transform"
            >
              <ArrowLeft className="w-5 h-5 text-emerald-950" />
            </button>
          ) : (
            <div
              onClick={() => navigate('/')}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center text-white shadow-xs shrink-0 cursor-pointer"
            >
              <Sprout className="w-4 h-4 text-emerald-300" />
            </div>
          )}

          <div className="truncate">
            <h1 className="text-sm font-black text-slate-900 truncate tracking-tight">
              {getScreenTitle()}
            </h1>
            <span className="text-[10px] text-emerald-800 font-semibold truncate block">
              {role.toUpperCase()}: {currentUser?.fullName}
            </span>
          </div>
        </div>

        {/* Right Controls: Language & Persona Dropdown */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-bold transition-colors"
          >
            {language === 'en' ? 'हिंदी' : 'EN'}
          </button>

          {/* Persona Button */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 active:scale-95 transition-transform flex items-center gap-1"
            >
              <UserCheck className="w-4 h-4 text-emerald-800" />
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-emerald-200 py-1.5 z-50 text-xs animate-in fade-in">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Persona
                </div>
                <button
                  onClick={() => {
                    switchRole('farmer');
                    setRoleMenuOpen(false);
                    navigate('/farmer/dashboard');
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 ${
                    role === 'farmer' ? 'bg-emerald-100/70 font-bold text-emerald-950' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold">Ramesh Patel</div>
                    <div className="text-[10px] text-slate-500">Farmer (Nashik)</div>
                  </div>
                  {role === 'farmer' && <span className="text-emerald-700">✓</span>}
                </button>

                <button
                  onClick={() => {
                    switchRole('buyer');
                    setRoleMenuOpen(false);
                    navigate('/buyer/dashboard');
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 ${
                    role === 'buyer' ? 'bg-emerald-100/70 font-bold text-emerald-950' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold">AgriMart Buyer</div>
                    <div className="text-[10px] text-slate-500">Institutional Sourcing</div>
                  </div>
                  {role === 'buyer' && <span className="text-emerald-700">✓</span>}
                </button>

                <button
                  onClick={() => {
                    switchRole('admin');
                    setRoleMenuOpen(false);
                    navigate('/admin/evidence-review');
                  }}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-50 ${
                    role === 'admin' ? 'bg-emerald-100/70 font-bold text-emerald-950' : 'text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-bold">Dr. Sunita Deshmukh</div>
                    <div className="text-[10px] text-slate-500">KVK Agronomist</div>
                  </div>
                  {role === 'admin' && <span className="text-emerald-700">✓</span>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
