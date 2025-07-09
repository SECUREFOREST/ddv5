import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Landing = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#060606] p-6">
      <div className="bg-[#181818] border border-[#282828] rounded-xl shadow-lg p-8 max-w-lg w-full text-center">
        {/* Branding: Logo and Tagline */}
        <img src="/logo.png" alt="DDv5 Logo" className="w-20 h-20 mx-auto mb-4" />
        <h1 className="text-4xl font-extrabold mb-2 text-white">Welcome to DDv5!</h1>
        <p className="text-xl mb-6 text-gray-400 font-semibold italic">Your journey to productivity starts here.</p>
        <ul className="text-left mb-8 text-gray-400 list-disc list-inside">
          <li>✔️ Log your daily acts and progress</li>
          <li>✔️ Compete on the leaderboard</li>
          <li>✔️ Earn credits and rewards</li>
          <li>✔️ Get notified about new activities</li>
        </ul>
        {/* Enhanced Call-to-Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <Link to="/login" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-[#D60B20] text-white px-8 py-3 rounded-xl text-lg font-bold shadow-lg hover:bg-[#b80e1c] transition-all duration-200">Log In</button>
          </Link>
          <Link to="/register" className="w-full sm:w-auto">
            <button className="w-full sm:w-auto bg-transparent border-2 border-[#D60B20] text-[#D60B20] px-8 py-3 rounded-xl text-lg font-bold shadow-lg hover:bg-[#1a1a1a] hover:border-[#b80e1c] hover:text-[#b80e1c] transition-all duration-200">Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing; 