import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNavigation from './components/BottomNavigation';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { AccessibilityProvider } from './components/AccessibilityProvider';
import { ToastProvider, useToast } from './context/ToastContext';
import { safeStorage } from './utils/cleanup';
// Dynamic imports for code-splitting

const DareParticipant = React.lazy(() => import('./pages/DareParticipant'));
const ProfileView = React.lazy(() => import('./pages/ProfileView'));
const DarePerform = React.lazy(() => import('./pages/DarePerform'));
const NotFound = React.lazy(() => import('./pages/NotFound'));
const DareShare = React.lazy(() => import('./pages/DareShare'));
const ClaimDare = React.lazy(() => import('./pages/ClaimDare'));
const UserActivity = React.lazy(() => import('./pages/UserActivity'));
const DarePerformerDashboard = React.lazy(() => import('./pages/DarePerformerDashboard'));
const OfferSubmission = React.lazy(() => import('./pages/OfferSubmission'));
const DomDemandCreator = React.lazy(() => import('./pages/DomDemandCreator'));
const DareDifficultySelect = React.lazy(() => import('./pages/DareDifficultySelect'));
const DareConsent = React.lazy(() => import('./pages/DareConsent'));
const DareReveal = React.lazy(() => import('./pages/DareReveal'));
const Advertise = React.lazy(() => import('./pages/Advertise'));

// Dynamic imports for code-splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const DareDetails = React.lazy(() => import('./pages/DareDetails'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const UIDemo = React.lazy(() => import('./pages/UIDemo'));
const SwitchGames = React.lazy(() => import('./pages/SwitchGames'));
const SwitchGameCreate = React.lazy(() => import('./pages/SwitchGameCreate'));
const SwitchGameParticipate = React.lazy(() => import('./pages/SwitchGameParticipate'));
const SwitchGameDetails = React.lazy(() => import('./pages/SwitchGameDetails'));
const SwitchGameClaim = React.lazy(() => import('./pages/SwitchGameClaim'));
const ActivityFeed = React.lazy(() => import('./pages/ActivityFeed'));
const Landing = React.lazy(() => import('./pages/Landing'));
const PublicDares = React.lazy(() => import('./pages/PublicDares'));
const News = React.lazy(() => import('./pages/News'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const SafetyReport = React.lazy(() => import('./pages/SafetyReport'));

// Modern UI Component imports
const ModernUIDemo = React.lazy(() => import('./components/ModernUIDemo'));
const ModernLanding = React.lazy(() => import('./pages/ModernLanding'));
const ModernRegister = React.lazy(() => import('./pages/ModernRegister'));
const ModernLogin = React.lazy(() => import('./pages/ModernLogin'));
const ModernDashboard = React.lazy(() => import('./components/ModernDashboard'));
const ModernTaskCreator = React.lazy(() => import('./components/ModernTaskCreator'));
const ModernTaskBrowser = React.lazy(() => import('./components/ModernTaskBrowser'));
const ModernProfile = React.lazy(() => import('./components/ModernProfile'));
const ModernNavigation = React.lazy(() => import('./components/ModernNavigation'));
const ModernRouteNavigation = React.lazy(() => import('./components/ModernRouteNavigation'));
const ModernActiveTasks = React.lazy(() => import('./components/ModernActiveTasks'));
const ModernUserAnalytics = React.lazy(() => import('./components/ModernUserAnalytics'));
const ModernCommunity = React.lazy(() => import('./components/ModernCommunity'));
const ModernSwitchGameCreator = React.lazy(() => import('./components/ModernSwitchGameCreator'));
const ModernSwitchGameBrowser = React.lazy(() => import('./components/ModernSwitchGameBrowser'));
const ModernSwitchGameDetails = React.lazy(() => import('./components/ModernSwitchGameDetails'));
const ModernSwitchGameParticipate = React.lazy(() => import('./components/ModernSwitchGameParticipate'));
const ModernSwitchGameTaskManager = React.lazy(() => import('./components/ModernSwitchGameTaskManager'));
const ModernSwitchGameResults = React.lazy(() => import('./components/ModernSwitchGameResults'));
const ModernSwitchGameClaim = React.lazy(() => import('./components/ModernSwitchGameClaim'));
const ModernAdmin = React.lazy(() => import('./pages/ModernAdmin'));
const ModernSafetyReport = React.lazy(() => import('./pages/ModernSafetyReport'));
const ModernTaskHistory = React.lazy(() => import('./pages/ModernTaskHistory'));
const ModernEvidenceGallery = React.lazy(() => import('./pages/ModernEvidenceGallery'));
const ModernNotificationPreferences = React.lazy(() => import('./pages/ModernNotificationPreferences'));
const ModernUserProfile = React.lazy(() => import('./pages/ModernUserProfile'));
const ModernDomDemandCreator = React.lazy(() => import('./pages/ModernDomDemandCreator'));
const ModernDareDetails = React.lazy(() => import('./pages/ModernDareDetails'));
const ModernDareDifficultySelect = React.lazy(() => import('./pages/ModernDareDifficultySelect'));
const ModernDareParticipant = React.lazy(() => import('./pages/ModernDareParticipant'));
const ModernDareConsent = React.lazy(() => import('./pages/ModernDareConsent'));

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [stylesLoaded, setStylesLoaded] = useState(false);

  // Handle styles loading
  useEffect(() => {
    // Memory-safe timeout for styles loading
    const timeout = setTimeout(() => {
      setStylesLoaded(true);
      // Remove the loading div from DOM
      const loadingDiv = document.querySelector('.app-loading');
      if (loadingDiv) {
        loadingDiv.remove();
      }
      // Add loaded class to root
      const root = document.getElementById('root');
      if (root) {
        root.classList.add('app-content', 'loaded');
      }
    }, 100); // Small delay to ensure styles are loaded
    
    return () => clearTimeout(timeout);
  }, []);

  // Save current path to localStorage (excluding auth pages)
  useEffect(() => {
    const authPaths = ['/login', '/register', '/forgot-password', '/reset-password'];
    if (!authPaths.includes(location.pathname)) {
      safeStorage.set('lastVisitedPath', location.pathname);
    }
  }, [location.pathname]);

  // Hide Navbar if not logged in and on the landing, login, or registration page
  const hideNavbarPaths = ['/', '/login', '/register'];
  const showNavbar = user || !hideNavbarPaths.includes(location.pathname);

  // Show loading state while styles are loading
  if (!stylesLoaded) {
    return null;
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-[#060606]">
        {showNavbar && <Navbar />}
        <main className="flex-1 pb-20 lg:pb-0">
          <div className="w-full">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                  <div className="text-white/80 text-lg font-medium">Loading page...</div>
                  <div className="text-white/40 text-sm mt-2">Please wait while we prepare your content</div>
                </div>
              </div>
            }>
            <Routes>
              {/* Modern UI Routes */}
              <Route path="/modern" element={<ModernUIDemo />} />
              <Route path="/modern-ui" element={<ModernUIDemo />} />
              <Route path="/modern/routes" element={<ModernRouteNavigation />} />
              
              {/* Modern Landing & Auth Routes */}
              <Route path="/" element={<ModernLanding />} />
              <Route path="/register" element={<ModernRegister />} />
              <Route path="/login" element={<ModernLogin />} />
              
              {/* Modern Dashboard Routes */}
              <Route path="/modern/dashboard" element={<PrivateRoute><ModernDashboard /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/profile/:userId" element={<PrivateRoute><ProfileView /></PrivateRoute>} />
              <Route path="/dares/:id" element={<PrivateRoute><DareDetails /></PrivateRoute>} />
              <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/ui-demo" element={<PrivateRoute><UIDemo /></PrivateRoute>} />
              
              {/* Modern OSA Integration Routes */}
              <Route path="/modern/dares" element={<PrivateRoute><ModernTaskBrowser /></PrivateRoute>} />
              <Route path="/modern/dares/create" element={<PrivateRoute><ModernTaskCreator /></PrivateRoute>} />
              <Route path="/modern/dares/:id" element={<PrivateRoute><ModernTaskBrowser /></PrivateRoute>} />
              <Route path="/modern/leaderboard" element={<PrivateRoute><ModernDashboard /></PrivateRoute>} />
              <Route path="/modern/activity" element={<PrivateRoute><ModernDashboard /></PrivateRoute>} />
              
              {/* Advanced Task Management Routes */}
              <Route path="/modern/tasks/active" element={<PrivateRoute><ModernActiveTasks /></PrivateRoute>} />
              <Route path="/modern/tasks/completed" element={<PrivateRoute><ModernActiveTasks /></PrivateRoute>} />
              <Route path="/modern/tasks/expired" element={<PrivateRoute><ModernActiveTasks /></PrivateRoute>} />
              <Route path="/modern/tasks/cooldown" element={<PrivateRoute><ModernActiveTasks /></PrivateRoute>} />
              
              {/* User Management & Analytics Routes */}
              <Route path="/modern/users/analytics" element={<PrivateRoute><ModernUserAnalytics /></PrivateRoute>} />
              <Route path="/modern/users/statistics" element={<PrivateRoute><ModernUserAnalytics /></PrivateRoute>} />
              <Route path="/modern/users/achievements" element={<PrivateRoute><ModernUserAnalytics /></PrivateRoute> } />
              
              {/* Community & Social Routes */}
              <Route path="/modern/community" element={<PrivateRoute><ModernCommunity /></PrivateRoute>} />
              <Route path="/modern/community/feed" element={<PrivateRoute><ModernCommunity /></PrivateRoute>} />
              <Route path="/modern/community/public-doms" element={<PrivateRoute><ModernCommunity /></PrivateRoute>} />
              <Route path="/modern/community/public-subs" element={<PrivateRoute><ModernCommunity /></PrivateRoute>} />
              
              {/* Switch Game Routes */}
              <Route path="/modern/switch-games" element={<PrivateRoute><ModernSwitchGameBrowser /></PrivateRoute>} />
              <Route path="/modern/switch-games/create" element={<PrivateRoute><ModernSwitchGameCreator /></PrivateRoute>} />
              <Route path="/modern/switch-games/:id" element={<PrivateRoute><ModernSwitchGameDetails /></PrivateRoute>} />
              <Route path="/modern/switch-games/participate" element={<PrivateRoute><ModernSwitchGameParticipate /></PrivateRoute>} />
              <Route path="/modern/switch-games/tasks" element={<PrivateRoute><ModernSwitchGameTaskManager /></PrivateRoute>} />
              <Route path="/modern/switch-games/results" element={<PrivateRoute><ModernSwitchGameResults /></PrivateRoute>} />
          <Route path="/modern/switch-games/claim" element={<PrivateRoute><ModernSwitchGameClaim /></PrivateRoute>} />
              <Route path="/modern/switch-games/claim/:gameId" element={<PrivateRoute><ModernSwitchGameDetails /></PrivateRoute>} />
              
              {/* Modern UI Index Route */}
              <Route path="/modern-ui" element={<PrivateRoute><ModernRouteNavigation /></PrivateRoute>} />
              
                             {/* Admin & Safety Routes */}
               <Route path="/modern/admin" element={<PrivateRoute><ModernAdmin /></PrivateRoute>} />
               <Route path="/modern/safety/report" element={<PrivateRoute><ModernSafetyReport /></PrivateRoute>} />
               
               {/* User Experience Routes */}
               <Route path="/modern/tasks/history" element={<PrivateRoute><ModernTaskHistory /></PrivateRoute>} />
               <Route path="/modern/tasks/evidence" element={<PrivateRoute><ModernEvidenceGallery /></PrivateRoute>} />
               <Route path="/modern/profile/notifications" element={<PrivateRoute><ModernNotificationPreferences /></PrivateRoute>} />
               
               {/* User Profile Routes */}
               <Route path="/modern/users/:userId" element={<PrivateRoute><ModernUserProfile /></PrivateRoute>} />
               
               {/* Modern Task Creation Routes */}
               <Route path="/modern/dares/create/dom" element={<PrivateRoute><ModernDomDemandCreator /></PrivateRoute>} />
               
               {/* Modern Task Details Routes */}
               <Route path="/modern/dares/:id" element={<PrivateRoute><ModernDareDetails /></PrivateRoute>} />
               
               {/* Modern Task Difficulty Selection Routes */}
               <Route path="/modern/dares/select" element={<PrivateRoute><ModernDareDifficultySelect /></PrivateRoute>} />
               
               {/* Modern Task Participation Routes */}
               <Route path="/modern/dares/:id/participate" element={<PrivateRoute><ModernDareParticipant /></PrivateRoute>} />
               
               {/* Modern Task Consent Routes */}
               <Route path="/modern/dares/:id/consent" element={<PrivateRoute><ModernDareConsent /></PrivateRoute>} />
              
              <Route path="/switches" element={<PrivateRoute><SwitchGames /></PrivateRoute>} />
              <Route path="/switches/create" element={<PrivateRoute><SwitchGameCreate /></PrivateRoute>} />
              <Route path="/switches/participate" element={<PrivateRoute><SwitchGameParticipate /></PrivateRoute>} />
              <Route path="/switches/participate/:gameId" element={<PrivateRoute><SwitchGameParticipate /></PrivateRoute>} />
              <Route path="/switches/claim/:gameId" element={<SwitchGameClaim />} />
              <Route path="/switches/:id" element={<PrivateRoute><SwitchGameDetails /></PrivateRoute>} />
              <Route path="/activity-feed" element={<PrivateRoute><ActivityFeed /></PrivateRoute>} />
      
              <Route path="/dare/:id/participate" element={<PrivateRoute><DareParticipant /></PrivateRoute>} />
              <Route path="/dare/select" element={<PrivateRoute><DareDifficultySelect /></PrivateRoute>} />
              <Route path="/dare/consent/:id" element={<PrivateRoute><DareConsent /></PrivateRoute>} />
              <Route path="/dare/consent" element={<PrivateRoute><DareConsent /></PrivateRoute>} />
              <Route path="/dare/reveal" element={<PrivateRoute><DareReveal /></PrivateRoute>} />
              <Route path="/dare/reveal/:id" element={<PrivateRoute><DareReveal /></PrivateRoute>} />
              <Route path="/dare/share/:dareId" element={<PrivateRoute><DareShare /></PrivateRoute>} />
              <Route path="/claim/:claimToken" element={<ClaimDare />} />
              <Route path="/user-activity" element={<PrivateRoute><UserActivity /></PrivateRoute>} />
              <Route path="/performer-dashboard" element={<DarePerformerDashboard />} />
              <Route path="/subs/new" element={<PrivateRoute><OfferSubmission /></PrivateRoute>} />
              <Route path="/dom-demand/create" element={<PrivateRoute><DomDemandCreator /></PrivateRoute>} />
              <Route path="/public-dares" element={<PrivateRoute><PublicDares /></PrivateRoute>} />
              <Route path="/news" element={<News />} />
              <Route path="/advertise" element={<Advertise />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/safety/report" element={<PrivateRoute><SafetyReport /></PrivateRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </main>
      <Footer />
      
      {/* Bottom Navigation for Mobile */}
      {user && <BottomNavigation />}
    </div>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <ToastProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ToastProvider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

export default App; 