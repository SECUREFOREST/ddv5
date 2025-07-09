import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

// Dynamic imports for code-splitting
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Acts = React.lazy(() => import('./pages/Acts'));
const ActDetails = React.lazy(() => import('./pages/ActDetails'));
const Leaderboard = React.lazy(() => import('./pages/Leaderboard'));
const Credits = React.lazy(() => import('./pages/Credits'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const UIDemo = React.lazy(() => import('./pages/UIDemo'));
const SwitchGames = React.lazy(() => import('./pages/SwitchGames'));
const SwitchGameDetails = React.lazy(() => import('./pages/SwitchGameDetails'));
const ActivityFeed = React.lazy(() => import('./pages/ActivityFeed'));

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/acts" element={<Acts />} />
              <Route path="/acts/:id" element={<ActDetails />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/credits" element={<PrivateRoute><Credits /></PrivateRoute>} />
              <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/ui-demo" element={<UIDemo />} />
              <Route path="/switches" element={<SwitchGames />} />
              <Route path="/switches/:id" element={<SwitchGameDetails />} />
              <Route path="/activity-feed" element={<ActivityFeed />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App; 