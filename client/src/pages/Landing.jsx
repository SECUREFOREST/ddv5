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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200 p-6">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold mb-4 text-purple-700">Welcome to DDv5!</h1>
        <p className="text-lg mb-6 text-gray-700">
          Track your acts, join the leaderboard, and stay motivated with our vibrant community.
        </p>
        <ul className="text-left mb-8 text-gray-600 list-disc list-inside">
          <li>✔️ Log your daily acts and progress</li>
          <li>✔️ Compete on the leaderboard</li>
          <li>✔️ Earn credits and rewards</li>
          <li>✔️ Get notified about new activities</li>
        </ul>
        <div className="flex justify-center gap-4">
          <Link to="/login">
            <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition">Log In</button>
          </Link>
          <Link to="/register">
            <button className="bg-white border border-purple-600 text-purple-700 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition">Register</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing; 