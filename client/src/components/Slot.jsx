import React from 'react';

export default function Slot({ empty, url, imageUrl, difficulty, status, onWithdraw, onClick, ariaLabel, children }) {
  if (empty) {
    return (
      <div className="slot empty-slot w-32 h-32 bg-gray-100 rounded flex flex-col items-center justify-center" aria-label={ariaLabel || 'Empty slot'}>
        <div className="dummy w-8 h-8 bg-gray-300 rounded-full mb-2"></div>
        <div className="contents"></div>
      </div>
    );
  }
  return (
    <a href={url} className="slot act-slot w-32 h-32 bg-blue-100 rounded flex flex-col items-center justify-center relative overflow-hidden" aria-label={ariaLabel || 'Active slot'} onClick={onClick}>
      <div className="dummy w-8 h-8 bg-blue-300 rounded-full mb-2"></div>
      <div className="overlay absolute top-0 left-0 w-full h-8 flex items-center justify-between px-2">
        <div className="difficulty text-xs font-bold bg-blue-600 text-white px-2 py-1 rounded">{difficulty}</div>
        {children}
      </div>
      <div className="contents flex-1 flex items-center justify-center">
        <img src={imageUrl} alt="Dare" className="w-12 h-12 object-cover rounded" />
      </div>
      {onWithdraw && (
        <button className="btn btn-danger mt-2 px-2 py-1 bg-red-600 text-white rounded w-full" onClick={onWithdraw} aria-label="Withdraw this dare">Withdraw</button>
      )}
    </a>
  );
} 