import React, { Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import DareCreator from './pages/DareCreator';
import DareParticipant from './pages/DareParticipant';
import ProfileView from './pages/ProfileView';
import DarePerform from './pages/DarePerform';
import NotFound from './pages/NotFound';
import DareShare from './pages/DareShare';
import ClaimDare from './pages/ClaimDare';
import UserActivity from './pages/UserActivity';
import DarePerformerDashboard from './pages/DarePerformerDashboard';
import OfferSubmission from './pages/OfferSubmission';
import DareDifficultySelect from './pages/DareDifficultySelect';
import DareConsent from './pages/DareConsent';
import DareReveal from './pages/DareReveal';

// Dynamic imports for code-splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Dares = React.lazy(() => import('./pages/Dares'));
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
const ActivityFeed = React.lazy(() => import('./pages/ActivityFeed'));
const Landing = React.lazy(() => import('./pages/Landing'));
const PublicDares = React.lazy(() => import('./pages/PublicDares'));

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Hide Navbar if not logged in and on the landing, login, or registration page
  const hideNavbarPaths = ['/', '/login', '/register'];
  const showNavbar = user || !hideNavbarPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen bg-[#060606]">
      {showNavbar && <Navbar />}
      <main className="flex-1">
        <div className="container mx-auto px-4 max-w-[1170px] sm:max-w-[750px] md:max-w-[970px] lg:max-w-[1170px] w-full">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Landing />} />
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
              <Route path="/switches" element={<PrivateRoute><SwitchGames /></PrivateRoute>} />
              <Route path="/switches/create" element={<PrivateRoute><SwitchGameCreate /></PrivateRoute>} />
              <Route path="/switches/participate" element={<PrivateRoute><SwitchGameParticipate /></PrivateRoute>} />
              <Route path="/switches/participate/:gameId" element={<PrivateRoute><SwitchGameParticipate /></PrivateRoute>} />
              <Route path="/switches/:id" element={<PrivateRoute><SwitchGameDetails /></PrivateRoute>} />
              <Route path="/activity-feed" element={<PrivateRoute><ActivityFeed /></PrivateRoute>} />
              <Route path="/dare/create" element={<PrivateRoute><DareCreator /></PrivateRoute>} />
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
              <Route path="/public-dares" element={<PrivateRoute><PublicDares /></PrivateRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App; 