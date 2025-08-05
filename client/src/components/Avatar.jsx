import React, { useState, useRef, useEffect } from 'react';
import { useTimeout } from '../utils/memoryLeakPrevention';

export default function Avatar({ user, size = 32, border = false, shadow = false, alt = '', className = '', onClick }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);

  // Load image immediately when avatar changes
  useEffect(() => {
    if (!user?.avatar || imageError) return;

    // Convert relative URL to full URL using API domain
    const baseUrl = import.meta.env.VITE_API_URL || 'https://api.deviantdare.com';
    const avatarUrl = user.avatar.startsWith('http') 
      ? user.avatar 
      : `${baseUrl.replace(/\/$/, '')}${user.avatar.startsWith('/') ? user.avatar : '/' + user.avatar}`;
    
    if (imgRef.current) {
      // Memory-safe timeout for image loading
      const { clearTimeout } = useTimeout(() => {
        if (imgRef.current) {
          imgRef.current.src = avatarUrl;
        }
      }, 50);
    }
  }, [user?.avatar, imageError]);

  const handleImageError = () => {
    setImageError(true);
    setImageLoaded(false);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const getInitials = () => {
    if (!user) return '?';
    const name = user.fullName || user.username || '';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';
  };

  // Map size values to Tailwind classes
  const getSizeClasses = (size) => {
    if (typeof size === 'string') {
      switch (size) {
        case 'xs': return 'w-6 h-6';
        case 'sm': return 'w-8 h-8';
        case 'md': return 'w-10 h-10';
        case 'lg': return 'w-12 h-12';
        case 'xl': return 'w-16 h-16';
        case '2xl': return 'w-20 h-20';
        default: return 'w-8 h-8';
      }
    }
    
    // Handle numeric sizes
    switch (size) {
      case 28: return 'w-7 h-7';
      case 32: return 'w-8 h-8';
      case 36: return 'w-9 h-9';
      case 40: return 'w-10 h-10';
      case 48: return 'w-12 h-12';
      case 60: return 'w-16 h-16';
      case 64: return 'w-16 h-16';
      case 80: return 'w-20 h-20';
      case 128: return 'w-32 h-32';
      case 256: return 'w-64 h-64';
      default: return `w-${Math.floor(size/4)} h-${Math.floor(size/4)}`;
    }
  };

  const containerClasses = [
    'rounded-full flex items-center justify-center font-semibold text-white avatar-container',
    getSizeClasses(size),
    border ? 'border-2 border-primary' : '',
    shadow ? 'shadow-lg' : '',
    onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : '',
    className
  ].filter(Boolean).join(' ');

  const bgColor = user ? `bg-${getUserColor(user)}` : 'bg-neutral-600';

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div className={containerClasses} onClick={handleClick}>
      {user?.avatar && !imageError ? (
        <img
          ref={imgRef}
          alt={alt || `${user.fullName || user.username || 'User'} avatar`}
          className={`w-full h-full rounded-full object-cover transition-opacity duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onError={handleImageError}
          onLoad={handleImageLoad}
          loading="lazy"
          crossOrigin="anonymous"
          onClick={(e) => e.stopPropagation()}
          style={{ 
            pointerEvents: 'none',
            aspectRatio: '1 / 1',
            objectFit: 'cover'
          }}
        />
      ) : (
        <div className={`w-full h-full rounded-full flex items-center justify-center text-sm font-semibold ${bgColor}`}>
          {getInitials()}
        </div>
      )}
    </div>
  );
}

// Generate consistent colors for users
function getUserColor(user) {
  if (!user) return 'neutral-600';
  
  const id = user._id || user.id || user.username || '';
  const colors = [
    'red', 'blue', 'green', 'yellow', 'purple', 'pink', 
    'indigo', 'teal', 'orange', 'cyan', 'emerald', 'violet'
  ];
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length] + '-600';
} 