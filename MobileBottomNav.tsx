import React from 'react';
import {
  Home,
  Compass,
  Camera,
  FileCheck2,
  ShoppingBag,
  Inbox,
  Layers,
  ShieldCheck,
  Mic,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface MobileBottomNavProps {
  currentPath: string;
  navigate: (path: string) => void;
}

interface NavTab {
  id: string;
  label: string;
  path: string;
  icon: any;
  isCenter?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ currentPath, navigate }) => {
  const { role } = useAuth();
  const { language } = useLanguage();

  const handleTabPress = (path: string) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(8);
    }
    navigate(path);
  };

  const isTabActive = (path: string) => {
    return currentPath === path || (path !== '/' && currentPath.startsWith(path));
  };

  const farmerTabs: NavTab[] = [
    {
      id: 'dash',
      label: language === 'hi' ? 'डैशबोर्ड' : 'Home',
      path: '/farmer/dashboard',
      icon: Home,
    },
    {
      id: 'planner',
      label: language === 'hi' ? 'योजना' : 'Planner',
      path: '/farmer/crop-planner',
      icon: Compass,
    },
    {
      id: 'history',
      label: language === 'hi' ? 'डायरी व पानी' : 'Diary & Water',
      path: '/farmer/history',
      icon: Mic,
      isCenter: true,
    },
    {
      id: 'passport',
      label: language === 'hi' ? 'पासपोर्ट' : 'Passport',
      path: '/farmer/passport',
      icon: FileCheck2,
    },
    {
      id: 'market',
      label: language === 'hi' ? 'मंडी' : 'Market',
      path: '/marketplace',
      icon: ShoppingBag,
    },
  ];

  const buyerTabs: NavTab[] = [
    {
      id: 'dash',
      label: language === 'hi' ? 'डैशबोर्ड' : 'Home',
      path: '/buyer/dashboard',
      icon: Home,
    },
    {
      id: 'market',
      label: language === 'hi' ? 'मंडी' : 'Market',
      path: '/buyer/marketplace',
      icon: ShoppingBag,
    },
    {
      id: 'requirements',
      label: language === 'hi' ? 'डिमांड' : 'Demands',
      path: '/buyer/requirements',
      icon: Layers,
    },
    {
      id: 'requests',
      label: language === 'hi' ? 'बुकिंग' : 'Orders',
      path: '/buyer/requests',
      icon: Inbox,
    },
  ];

  const adminTabs: NavTab[] = [
    {
      id: 'dash',
      label: language === 'hi' ? 'डैशबोर्ड' : 'Home',
      path: '/admin/dashboard',
      icon: Home,
    },
    {
      id: 'review',
      label: language === 'hi' ? 'समीक्षा' : 'Review Queue',
      path: '/admin/evidence-review',
      icon: ShieldCheck,
      isCenter: true,
    },
    {
      id: 'market',
      label: language === 'hi' ? 'मंडी' : 'Market',
      path: '/marketplace',
      icon: ShoppingBag,
    },
  ];

  const tabs: NavTab[] = role === 'farmer' ? farmerTabs : role === 'buyer' ? buyerTabs : adminTabs;

  return (
    <nav className="sticky bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-emerald-900/10 shadow-[0_-4px_16px_rgba(0,0,0,0.05)] pb-[env(safe-area-inset-bottom)] no-print w-full mt-auto">
      <div className="max-w-md mx-auto px-3 flex items-center justify-around h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isTabActive(tab.path);

          if (tab.isCenter) {
            return (
              <button
                key={tab.id}
                onClick={() => handleTabPress(tab.path)}
                className="relative -top-4 flex flex-col items-center group focus:outline-none"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-active:scale-95 ${
                    active
                      ? 'bg-gradient-to-tr from-emerald-700 to-emerald-900 ring-4 ring-emerald-200'
                      : 'bg-gradient-to-tr from-emerald-800 to-emerald-950 shadow-emerald-900/30'
                  }`}
                >
                  <Icon className="w-6 h-6 text-emerald-100" />
                </div>
                <span className="text-[10px] font-bold text-emerald-950 mt-1">
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => handleTabPress(tab.path)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative ${
                active ? 'text-emerald-900 font-extrabold' : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110 text-emerald-800' : ''}`} />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-[64px]">
                {tab.label}
              </span>
              {active && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-800" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
