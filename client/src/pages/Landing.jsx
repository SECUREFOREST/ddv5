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
    <div className="max-w-sm mx-auto mt-16 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      <img src="/logo.png" alt="DDv5 Logo" className="w-16 h-16 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-center mb-4 text-[#888]">Welcome to DDv5!</h1>
      <p className="text-base mb-6 text-center text-gray-400 font-semibold italic">Your journey to productivity starts here.</p>
      <ul className="text-left mb-8 text-gray-400 list-disc list-inside text-sm">
        <li>✔️ Log your daily acts and progress</li>
        <li>✔️ Compete on the leaderboard</li>
        <li>✔️ Earn credits and rewards</li>
        <li>✔️ Get notified about new activities</li>
      </ul>
      <div className="flex flex-col gap-3 mt-6">
        <Link to="/login">
          <button className="w-full bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark">Log In</button>
        </Link>
        <Link to="/register">
          <button className="w-full border-2 border-primary text-primary rounded px-4 py-2 font-semibold hover:bg-neutral-900 hover:border-primary-dark hover:text-primary-dark">Register</button>
        </Link>
      </div>
    </div>
  );
};

export default Landing; 