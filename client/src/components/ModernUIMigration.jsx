import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowPathIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

// Feature flag for modern UI migration
const MODERN_UI_ENABLED = process.env.REACT_APP_MODERN_UI !== 'false'; // Default to true
const MIGRATION_PHASE = process.env.REACT_APP_MIGRATION_PHASE || 'full'; // full, partial, testing

// Route mapping from legacy to modern
const ROUTE_MAPPINGS = {
  // Core routes
  '/': '/modern/dashboard',
  '/dashboard': '/modern/dashboard',
  '/profile': '/modern/profile',
  '/login': '/modern/login',
  '/register': '/modern/register',
  '/forgot-password': '/modern/forgot-password',
  '/reset-password': '/modern/reset-password',
  
  // Task management routes
  '/dares': '/modern/dares',
  '/dare': '/modern/dares',
  '/subs/new': '/modern/offer-submission',
  '/dom-demand/create': '/modern/dares/create/dom',
  '/performer-dashboard': '/modern/performer-dashboard',
  
  // Switch game routes
  '/switches': '/modern/switches',
  '/switch-games': '/modern/switches',
  
  // Community routes
  '/leaderboard': '/modern/leaderboard',
  '/activity-feed': '/modern/activity-feed',
  '/public-dares': '/modern/public-dares',
  '/news': '/modern/news',
  '/user-activity': '/modern/user-activity',
  
  // Admin and safety
  '/admin': '/modern/admin',
  '/safety/report': '/modern/safety/report',
  '/terms': '/modern/terms-of-service',
  '/advertise': '/modern/advertise',
  
  // UI demo
  '/ui-demo': '/modern/ui-demo'
};

// Phase-based route mappings
const PHASE_ROUTES = {
  testing: ['/dashboard', '/profile', '/login', '/register'],
  partial: ['/dashboard', '/profile', '/login', '/register', '/dares', '/switches', '/leaderboard'],
  full: Object.keys(ROUTE_MAPPINGS)
};

const ModernUIMigration = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMigrationBanner, setShowMigrationBanner] = useState(false);
  const [migrationPhase, setMigrationPhase] = useState(MIGRATION_PHASE);
  const [legacyAccessEnabled, setLegacyAccessEnabled] = useState(false);

  useEffect(() => {
    // Check if we should redirect to modern UI
    if (MODERN_UI_ENABLED && shouldRedirectToModern(location.pathname)) {
      const modernRoute = getModernRoute(location.pathname);
      if (modernRoute && modernRoute !== location.pathname) {
        // Show migration banner briefly before redirecting
        setShowMigrationBanner(true);
        setTimeout(() => {
          navigate(modernRoute, { replace: true });
        }, 1500);
      }
    }
  }, [location.pathname, navigate]);

  const shouldRedirectToModern = (pathname) => {
    const currentPhaseRoutes = PHASE_ROUTES[migrationPhase] || PHASE_ROUTES.full;
    return currentPhaseRoutes.some(route => pathname.startsWith(route));
  };

  const getModernRoute = (legacyRoute) => {
    // Handle dynamic routes with parameters
    if (legacyRoute.includes('/:') || legacyRoute.includes('/')) {
      // Map specific patterns
      if (legacyRoute.startsWith('/dares/')) {
        return legacyRoute.replace('/dares/', '/modern/dares/');
      }
      if (legacyRoute.startsWith('/switches/')) {
        return legacyRoute.replace('/switches/', '/modern/switches/');
      }
      if (legacyRoute.startsWith('/dare/')) {
        return legacyRoute.replace('/dare/', '/modern/dares/');
      }
      if (legacyRoute.startsWith('/profile/')) {
        return legacyRoute.replace('/profile/', '/modern/profile/');
      }
    }
    
    return ROUTE_MAPPINGS[legacyRoute] || legacyRoute;
  };

  const enableLegacyAccess = () => {
    setLegacyAccessEnabled(true);
    localStorage.setItem('legacy_ui_enabled', 'true');
    setShowMigrationBanner(false);
  };

  const disableLegacyAccess = () => {
    setLegacyAccessEnabled(false);
    localStorage.removeItem('legacy_ui_enabled');
    setShowMigrationBanner(false);
  };

  // Check if user has opted into legacy UI
  useEffect(() => {
    const legacyEnabled = localStorage.getItem('legacy_ui_enabled') === 'true';
    setLegacyAccessEnabled(legacyEnabled);
  }, []);

  // Don't redirect if legacy access is enabled
  if (legacyAccessEnabled) {
    return (
      <>
        {children}
        <LegacyAccessBanner onDisable={disableLegacyAccess} />
      </>
    );
  }

  return (
    <>
      {children}
      
      {/* Migration Banner */}
      {showMigrationBanner && (
        <MigrationBanner 
          onClose={() => setShowMigrationBanner(false)}
          onEnableLegacy={enableLegacyAccess}
        />
      )}
      
      {/* Legacy Access Toggle (Fixed Position) */}
      <LegacyAccessToggle 
        onEnable={enableLegacyAccess}
        onDisable={disableLegacyAccess}
        isEnabled={legacyAccessEnabled}
      />
    </>
  );
};

// Migration Banner Component
const MigrationBanner = ({ onClose, onEnableLegacy }) => (
  <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-primary-dark text-white p-4 shadow-lg">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <ArrowPathIcon className="w-6 h-6 animate-spin" />
        <div>
          <h3 className="font-bold text-lg">Upgrading to Modern UI</h3>
          <p className="text-sm opacity-90">Redirecting you to the new, improved interface...</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button
          onClick={onEnableLegacy}
          className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
        >
          Use Legacy UI
        </button>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  </div>
);

// Legacy Access Toggle Component
const LegacyAccessToggle = ({ onEnable, onDisable, isEnabled }) => (
  <div className="fixed bottom-4 right-4 z-40">
    <button
      onClick={isEnabled ? onDisable : onEnable}
      className={`px-4 py-3 rounded-lg shadow-lg font-medium transition-all duration-200 ${
        isEnabled
          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
          : 'bg-gray-600 hover:bg-gray-700 text-white'
      }`}
      title={isEnabled ? 'Switch to Modern UI' : 'Use Legacy UI'}
    >
      <div className="flex items-center space-x-2">
        {isEnabled ? (
          <>
            <ExclamationTriangleIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Legacy UI</span>
          </>
        ) : (
          <>
            <CheckCircleIcon className="w-5 h-5" />
            <span className="hidden sm:inline">Modern UI</span>
          </>
        )}
      </div>
    </button>
  </div>
);

// Legacy Access Banner Component
const LegacyAccessBanner = ({ onDisable }) => (
  <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-white p-4 shadow-lg">
    <div className="max-w-7xl mx-auto flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <ExclamationTriangleIcon className="w-6 h-6" />
        <div>
          <h3 className="font-bold text-lg">Legacy UI Mode Active</h3>
          <p className="text-sm opacity-90">You're using the legacy interface. Switch to Modern UI for the best experience.</p>
        </div>
      </div>
      <button
        onClick={onDisable}
        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
      >
        Switch to Modern UI
      </button>
    </div>
  </div>
);

export default ModernUIMigration;
