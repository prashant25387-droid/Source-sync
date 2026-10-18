import React, { useState } from 'react';
import {
  Sprout,
  Droplets,
  Menu,
  X,
  Compass,
  FileCheck2,
  Calendar,
  CloudSun,
  Camera,
  ShoppingBag,
  Inbox,
  UserCheck,
  RotateCcw,
  ShieldCheck,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { dataService } from '../../services/dataService';
import { useToast } from '../../context/ToastContext';

interface NavbarProps {
  currentPath: string;
  navigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, navigate }) => {
  const { role, switchRole, currentUser } = useAuth();
  const { t, language } = useLanguage();
  const { showToast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleResetDemo = () => {
    if (confirm('Reset sample demo data to initial baseline?')) {
      dataService.resetToDefaults();
      showToast('Demo data reset to baseline successfully.', 'info');
      navigate('/');
    }
  };

  const navItemClass = (path: string) => {
    const isActive = currentPath === path || (path !== '/' && currentPath.startsWith(path));
    return `px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
      isActive
        ? 'bg-emerald-800 text-white shadow-xs'
        : 'text-emerald-950 hover:bg-emerald-100/70 hover:text-emerald-900'
    }`;
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
      {/* Top Demo Bar */}
      <div className="bg-emerald-900 text-emerald-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold text-emerald-300">
            {language === 'hi' ? 'डेमो मोड सक्रिय' : 'FasalSetu Active Demo'}:
          </span>
          <span className="hidden sm:inline">
            {language === 'hi'
              ? 'पानी की योजना से लेकर कटाई-पूर्व बिक्री तक का सम्पूर्ण प्लेटफॉर्म'
              : 'Water-aware crop planning to pre-harvest Crop Passport marketplace'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick Persona Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 bg-emerald-950/80 hover:bg-emerald-950 px-2.5 py-1 rounded-md text-[11px] font-semibold text-emerald-200 border border-emerald-700 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Persona: {role.toUpperCase()}</span>
              <ChevronDown className="w-3 h-3 text-emerald-400" />
            </button>

            {roleDropdownOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white text-slate-800 rounded-xl shadow-xl border border-emerald-200 py-1.5 z-50">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Persona
                </div>
                <button
                  onClick={() => {
                    switchRole('farmer');
                    setRoleDropdownOpen(false);
                    navigate('/farmer/dashboard');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 ${
                    role === 'farmer' ? 'bg-emerald-100/70 font-bold text-emerald-900' : ''
                  }`}
                >
                  <div>
                    <div className="font-semibold">Ramesh Patel</div>
                    <div className="text-[10px] text-slate-500">Farmer (Nashik, 5 Acres)</div>
                  </div>
                  {role === 'farmer' && <span className="text-emerald-700 text-xs">✓</span>}
                </button>

                <button
                  onClick={() => {
                    switchRole('buyer');
                    setRoleDropdownOpen(false);
                    navigate('/buyer/marketplace');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 ${
                    role === 'buyer' ? 'bg-emerald-100/70 font-bold text-emerald-900' : ''
                  }`}
                >
                  <div>
                    <div className="font-semibold">AgriMart Procurement</div>
                    <div className="text-[10px] text-slate-500">Institutional Buyer</div>
                  </div>
                  {role === 'buyer' && <span className="text-emerald-700 text-xs">✓</span>}
                </button>

                <button
                  onClick={() => {
                    switchRole('admin');
                    setRoleDropdownOpen(false);
                    navigate('/admin/evidence-review');
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-emerald-50 ${
                    role === 'admin' ? 'bg-emerald-100/70 font-bold text-emerald-900' : ''
                  }`}
                >
                  <div>
                    <div className="font-semibold">Dr. Sunita Deshmukh</div>
                    <div className="text-[10px] text-slate-500">KVK Agronomist Reviewer</div>
                  </div>
                  {role === 'admin' && <span className="text-emerald-700 text-xs">✓</span>}
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleResetDemo}
            title="Reset demo data to original state"
            className="flex items-center gap-1 text-[11px] text-emerald-300 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-900 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 group-hover:scale-105 transition-transform">
              <div className="relative">
                <Sprout className="w-5 h-5 text-emerald-300" />
                <Droplets className="w-3.5 h-3.5 text-cyan-300 absolute -top-1 -right-1" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-emerald-950">
                  {t.brand}
                </span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  MVP
                </span>
              </div>
              <div className="text-[11px] font-medium text-emerald-800 hidden sm:block">
                {language === 'hi' ? 'पानी से प्लानिंग • भरोसे से सेलिंग' : 'Water-Aware Crop Passport'}
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links based on active role */}
          <nav className="hidden lg:flex items-center gap-1">
            <button onClick={() => navigate('/')} className={navItemClass('/')}>
              {t.nav.home}
            </button>
            <button onClick={() => navigate('/about')} className={navItemClass('/about')}>
              {t.nav.about}
            </button>
            <button onClick={() => navigate('/marketplace')} className={navItemClass('/marketplace')}>
              <ShoppingBag className="w-4 h-4 text-emerald-700" />
              {t.nav.marketplace}
            </button>

            {role === 'farmer' && (
              <>
                <div className="h-4 w-[1px] bg-emerald-200 mx-1" />
                <button onClick={() => navigate('/farmer/dashboard')} className={navItemClass('/farmer/dashboard')}>
                  {t.nav.dashboard}
                </button>
                <button onClick={() => navigate('/farmer/crop-planner')} className={navItemClass('/farmer/crop-planner')}>
                  <Compass className="w-4 h-4 text-emerald-700" />
                  {t.nav.cropPlanner}
                </button>
                <button onClick={() => navigate('/farmer/weather')} className={navItemClass('/farmer/weather')}>
                  <CloudSun className="w-4 h-4 text-sky-700" />
                  {t.nav.weather}
                </button>
                <button onClick={() => navigate('/farmer/crops')} className={navItemClass('/farmer/crops')}>
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  {t.nav.crops}
                </button>
                <button onClick={() => navigate('/farmer/evidence')} className={navItemClass('/farmer/evidence')}>
                  <Camera className="w-4 h-4 text-emerald-700" />
                  {t.nav.evidence}
                </button>
                <button onClick={() => navigate('/farmer/passport')} className={navItemClass('/farmer/passport')}>
                  <FileCheck2 className="w-4 h-4 text-emerald-700" />
                  {t.nav.passport}
                </button>
                <button onClick={() => navigate('/farmer/requests')} className={navItemClass('/farmer/requests')}>
                  <Inbox className="w-4 h-4 text-emerald-700" />
                  {t.nav.requests}
                </button>
              </>
            )}

            {role === 'buyer' && (
              <>
                <div className="h-4 w-[1px] bg-emerald-200 mx-1" />
                <button onClick={() => navigate('/buyer/dashboard')} className={navItemClass('/buyer/dashboard')}>
                  {t.nav.dashboard}
                </button>
                <button onClick={() => navigate('/buyer/marketplace')} className={navItemClass('/buyer/marketplace')}>
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  {t.nav.buyerMarketplace}
                </button>
                <button onClick={() => navigate('/buyer/requirements')} className={navItemClass('/buyer/requirements')}>
                  <Layers className="w-4 h-4 text-emerald-700" />
                  {t.nav.requirements}
                </button>
                <button onClick={() => navigate('/buyer/requests')} className={navItemClass('/buyer/requests')}>
                  <Inbox className="w-4 h-4 text-emerald-700" />
                  {t.nav.requests}
                </button>
              </>
            )}

            {role === 'admin' && (
              <>
                <div className="h-4 w-[1px] bg-emerald-200 mx-1" />
                <button onClick={() => navigate('/admin/dashboard')} className={navItemClass('/admin/dashboard')}>
                  {t.nav.dashboard}
                </button>
                <button onClick={() => navigate('/admin/evidence-review')} className={navItemClass('/admin/evidence-review')}>
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  {t.nav.adminReview}
                </button>
              </>
            )}
          </nav>

          {/* Right Controls: Language & Action */}
          <div className="hidden lg:flex items-center gap-3">
            <LanguageSwitcher />

            {role === 'farmer' && (
              <button
                onClick={() => navigate('/farmer/crop-planner')}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'नई फसल योजना' : 'Plan Next Crop'}</span>
              </button>
            )}

            {role === 'buyer' && (
              <button
                onClick={() => navigate('/buyer/marketplace')}
                className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'फसलें खोजें' : 'Browse Produce'}</span>
              </button>
            )}

            {role === 'admin' && (
              <button
                onClick={() => navigate('/admin/evidence-review')}
                className="bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'समीक्षा कतार' : 'Review Queue'}</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageSwitcher compact />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-emerald-950 hover:bg-emerald-100/70"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-emerald-900/10 px-4 pt-2 pb-6 space-y-2">
          <div className="p-3 bg-emerald-50 rounded-xl mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold text-emerald-900">
              Active: {currentUser?.fullName} ({role})
            </div>
            <button
              onClick={() => {
                const nextRole = role === 'farmer' ? 'buyer' : role === 'buyer' ? 'admin' : 'farmer';
                switchRole(nextRole);
              }}
              className="text-xs font-bold text-emerald-700 underline"
            >
              Switch Role
            </button>
          </div>

          <button onClick={() => { navigate('/'); setMobileMenuOpen(false); }} className={`w-full ${navItemClass('/')}`}>
            {t.nav.home}
          </button>
          <button onClick={() => { navigate('/marketplace'); setMobileMenuOpen(false); }} className={`w-full ${navItemClass('/marketplace')}`}>
            {t.nav.marketplace}
          </button>
          <button onClick={() => { navigate('/about'); setMobileMenuOpen(false); }} className={`w-full ${navItemClass('/about')}`}>
            {t.nav.about}
          </button>

          {role === 'farmer' && (
            <>
              <div className="border-t border-slate-200 pt-2 text-[10px] font-bold text-slate-400 uppercase">
                Farmer Workspace
              </div>
              <button onClick={() => { navigate('/farmer/dashboard'); setMobileMenuOpen(false); }} className={`w-full ${navItemClass('/farmer/dashboard')}`}>
                {t.nav.dashboard}
              </button>
              <button onClick={() => { navigate('/farmer/crop-planner'); setMobileMenuOpen(false); }} className={`w-full ${navItemClass('/farmer/crop-planner')}`}>
                {t.nav.cropPlanner}
              </button>
              <button onClick={() => { navigate('/farmer/weather'); setMobileMenuOpen(false); }} className={`w-full ${navItemClass('/farmer/weather')}`}>
                {t.nav.weather}
              </button>
              <button onClick={() => { navigate('/farmer/crops'); setMobileMenuOpen(false); }} className={`w-full ${navItemClass('/farmer/crops')}`}>
                {t.nav.crops}
              </button>
              <button onClick={() => { navigate('/farmer/evidence'); setMobileMenuOpen(false); }} className={`w-full ${navItemClass('/farmer/evidence')}`}>
                {t.nav.evidence}
              </button>
              <button onClick={() => { navigate('/farmer/passport'); setMobileMenuOpen(false); }} className={`w-full ${navItemClass('/farmer/passport')}`}>
                {t.nav.passport}
              </button>
              <button onClick={() => { navigate('/farmer/requests'); setMobileMenuOpen(false); }} className={`w-full ${navItemClass('/farmer/requests')}`}>
                {t.nav.requests}
              </button>
            </>
          )}

          {role === 'buyer' && (
            <>
              <div className="border-t border-slate-200 pt-2 text-[10px] font-bold text-slate-400 uppercase">
                Buyer Workspace
              </div>
              <button onClick={() => { navigate('/buyer/dashboard'); setMobileMenuOpen(false); }} className={`w-full ${navItemClass('/buyer/dashboard')}`}>
                {t.nav.dashboard}
              </button>
              <button onClick={() => { navigate('/buyer/marketplace'); setMobileMenuOpen(false); }} className={`w-full ${navItemClass('/buyer/marketplace')}`}>
                {t.nav.buyerMarketplace}
              </button>
              <button onClick={() => { navigate('/buyer/requirements'); setMobileMenuOpen(false); }} className={`w-full ${navItemClass('/buyer/requirements')}`}>
                {t.nav.requirements}
              </button>
              <button onClick={() => { navigate('/buyer/requests'); setMobileMenuOpen(false); }} className={`w-full ${navItemClass('/buyer/requests')}`}>
                {t.nav.requests}
              </button>
            </>
          )}

          {role === 'admin' && (
            <>
              <div className="border-t border-slate-200 pt-2 text-[10px] font-bold text-slate-400 uppercase">
                Admin / Agronomist Workspace
              </div>
              <button onClick={() => { navigate('/admin/dashboard'); setMobileMenuOpen(false); }} className={`w-full ${navItemClass('/admin/dashboard')}`}>
                {t.nav.dashboard}
              </button>
              <button onClick={() => { navigate('/admin/evidence-review'); setMobileMenuOpen(false); }} className={`w-full ${navItemClass('/admin/evidence-review')}`}>
                {t.nav.adminReview}
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
};
