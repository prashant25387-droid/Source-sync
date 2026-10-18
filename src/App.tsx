import React, { useState, useEffect } from 'react';
import { MobileHeader } from './components/mobile/MobileHeader';
import { MobileBottomNav } from './components/mobile/MobileBottomNav';
import { MobileSimulatorFrame } from './components/mobile/MobileSimulatorFrame';

// Mobile Screens
import { MobileHomePage } from './pages/mobile/MobileHomePage';
import { AboutPage } from './pages/AboutPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { PublicPassportPage } from './pages/PublicPassportPage';

// Farmer pages
import { FarmerDashboard } from './pages/farmer/FarmerDashboard';
import { FarmerProfilePage } from './pages/farmer/FarmerProfilePage';
import { CropPlannerPage } from './pages/farmer/CropPlannerPage';
import { WeatherPage } from './pages/farmer/WeatherPage';
import { CropsPage } from './pages/farmer/CropsPage';
import { CropDetailsPage } from './pages/farmer/CropDetailsPage';
import { EvidencePage } from './pages/farmer/EvidencePage';
import { PassportPage } from './pages/farmer/PassportPage';
import { FarmerRequestsPage } from './pages/farmer/FarmerRequestsPage';
import { FarmHistoryPage } from './pages/farmer/FarmHistoryPage';

// Buyer pages
import { BuyerDashboard } from './pages/buyer/BuyerDashboard';
import { BuyerRequirementsPage } from './pages/buyer/BuyerRequirementsPage';
import { BuyerRequestsPage } from './pages/buyer/BuyerRequestsPage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { EvidenceReviewPage } from './pages/admin/EvidenceReviewPage';

export const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const passportParam = searchParams.get('passport');
      if (passportParam && passportParam.trim()) {
        return `/passport/${passportParam.trim().toUpperCase()}`;
      }
      return window.location.pathname || '/';
    }
    return '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const passportParam = searchParams.get('passport');
      if (passportParam && passportParam.trim()) {
        setCurrentPath(`/passport/${passportParam.trim().toUpperCase()}`);
      } else {
        setCurrentPath(window.location.pathname || '/');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (typeof window !== 'undefined') {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const renderCurrentRoute = () => {
    // 1. Dynamic Route: /passport/:publicId
    if (currentPath.startsWith('/passport/')) {
      const publicId = currentPath.replace('/passport/', '').split('?')[0].split('/')[0];
      return <PublicPassportPage publicId={publicId} navigate={navigate} />;
    }

    // 2. Dynamic Route: /farmer/crops/:cropId
    if (currentPath.startsWith('/farmer/crops/') && currentPath !== '/farmer/crops') {
      const cropId = currentPath.replace('/farmer/crops/', '').split('/')[0];
      return <CropDetailsPage cropId={cropId} navigate={navigate} />;
    }

    switch (currentPath) {
      case '/':
        return <MobileHomePage navigate={navigate} />;
      case '/about':
        return <AboutPage navigate={navigate} />;
      case '/marketplace':
      case '/farmer/marketplace':
      case '/buyer/marketplace':
      case '/buyer/passports':
        return <MarketplacePage navigate={navigate} />;

      // Farmer Routes
      case '/farmer/dashboard':
        return <FarmerDashboard navigate={navigate} />;
      case '/farmer/profile':
      case '/farmer/farms':
        return <FarmerProfilePage />;
      case '/farmer/crop-planner':
        return <CropPlannerPage navigate={navigate} />;
      case '/farmer/weather':
        return <WeatherPage />;
      case '/farmer/crops':
        return <CropsPage navigate={navigate} />;
      case '/farmer/evidence':
        return <EvidencePage />;
      case '/farmer/passport':
        return <PassportPage navigate={navigate} />;
      case '/farmer/requests':
        return <FarmerRequestsPage />;
      case '/farmer/history':
      case '/farmer/irrigation':
      case '/farmer/diary':
        return <FarmHistoryPage navigate={navigate} />;

      // Buyer Routes
      case '/buyer/dashboard':
        return <BuyerDashboard navigate={navigate} />;
      case '/buyer/requirements':
        return <BuyerRequirementsPage navigate={navigate} />;
      case '/buyer/requests':
        return <BuyerRequestsPage navigate={navigate} />;

      // Admin Routes
      case '/admin/dashboard':
        return <AdminDashboard navigate={navigate} />;
      case '/admin/evidence-review':
        return <EvidenceReviewPage />;

      default:
        return <MobileHomePage navigate={navigate} />;
    }
  };

  return (
    <MobileSimulatorFrame currentPath={currentPath} navigate={navigate}>
      <div className="min-h-full flex flex-col bg-[#FAF9F2] text-[#172B24]">
        <MobileHeader currentPath={currentPath} navigate={navigate} />
        <main className="flex-1 w-full px-3.5 pt-3 pb-6">
          {renderCurrentRoute()}
        </main>
        <MobileBottomNav currentPath={currentPath} navigate={navigate} />
      </div>
    </MobileSimulatorFrame>
  );
};

export default App;
