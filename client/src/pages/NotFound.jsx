import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto mt-20 p-8 bg-[#222] border border-[#282828] rounded shadow text-center">
      <h1 className="text-4xl font-bold text-danger mb-4">404</h1>
      <p className="text-lg text-neutral-300 mb-6">Sorry, the page you are looking for does not exist.</p>
      <Link to="/dashboard">
        <button className="bg-primary text-primary-contrast rounded px-4 py-2 font-semibold hover:bg-primary-dark">Go to Dashboard</button>
      </Link>
    </div>
  );
} 