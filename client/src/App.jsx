import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Acts from './pages/Acts';
import ActDetails from './pages/ActDetails';
import Leaderboard from './pages/Leaderboard';
import Credits from './pages/Credits';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import UIDemo from './pages/UIDemo';
import SwitchGames from './pages/SwitchGames';
import SwitchGameDetails from './pages/SwitchGameDetails';
import ActivityFeed from './pages/ActivityFeed';

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-6">
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
        </main>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App; 