import React from 'react';

const sizeMap = { sm: 24, md: 32, lg: 48 };

export default function Avatar({ user, size = 'md', onClick, border = true, shadow = true }) {
  const avatarUrl = user?.avatar;
  const initials = user?.username ? user.username[0].toUpperCase() : '?';
  const pixelSize = typeof size === 'string' ? sizeMap[size] || 32 : size;
  const borderClass = border ? 'border-2 border-primary' : 'border border-neutral-700';
  const shadowClass = shadow ? 'shadow-md' : '';
  return avatarUrl ? (
    <img
      src={avatarUrl}
      alt={user?.username || 'avatar'}
      className={`rounded-full object-cover ${borderClass} ${shadowClass}`}
      style={{ width: pixelSize, height: pixelSize, cursor: onClick ? 'pointer' : undefined }}
      onClick={onClick}
    />
  ) : (
    <div
      className={`rounded-full bg-neutral-700 text-neutral-100 flex items-center justify-center font-bold ${borderClass} ${shadowClass}`}
      style={{ width: pixelSize, height: pixelSize, fontSize: pixelSize * 0.5, cursor: onClick ? 'pointer' : undefined }}
      onClick={onClick}
    >
      {initials}
    </div>
  );
} 