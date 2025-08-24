import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
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
        
        <main className="flex-1">
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
              {/* Landing & Auth Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/profile/:userId" element={<PrivateRoute><ProfileView /></PrivateRoute>} />
              <Route path="/dares/:id" element={<PrivateRoute><DareDetails /></PrivateRoute>} />
              <Route path="/leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
              <Route path="/ui-demo" element={<PrivateRoute><UIDemo /></PrivateRoute>} />
              
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