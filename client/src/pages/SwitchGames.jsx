import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Banner } from '../components/Modal';

export default function SwitchGames() {
  const { user } = useAuth ? useAuth() : { user: null };
  // Placeholder for future error/info state
  const [generalError, setGeneralError] = React.useState('');
  const [generalInfo, setGeneralInfo] = React.useState('');
  return (
    <div className="max-w-2xl w-full mx-auto mt-12 bg-[#222] border border-[#282828] rounded-none shadow-sm p-[15px] mb-5">
      {generalError && <Banner type="error" message={generalError} onClose={() => setGeneralError('')} />}
      <div className="bg-[#3c3c3c] text-[#888] border-b border-[#282828] px-[15px] py-[10px] -mx-[15px] mt-[-15px] mb-4 rounded-t-none text-center">
        <h1 className="text-2xl font-bold">Switch Games</h1>
      </div>
      <div className="flex flex-col md:flex-row gap-6 items-center justify-center mt-8">
        <Link to="/switches/create">
          <button className="w-full md:w-64 bg-primary text-primary-contrast rounded px-4 py-3 font-semibold text-lg hover:bg-primary-dark">Create a Switch Game</button>
        </Link>
        <Link to="/switches/participate">
          <button className="w-full md:w-64 bg-info text-info-contrast rounded px-4 py-3 font-semibold text-lg hover:bg-info-dark">Participate in a Switch Game</button>
        </Link>
      </div>
    </div>
  );
} 