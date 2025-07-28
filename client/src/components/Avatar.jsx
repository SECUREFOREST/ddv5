import React, { useState, useRef, useEffect } from 'react';

export default function Avatar({ user, size = 32, border = false, shadow = false, alt = '', className = '', onClick }) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgRef = useRef(null);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!user?.avatar || imageError) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && imgRef.current) {
            // Convert relative URL to full URL if needed
            const avatarUrl = user.avatar.startsWith('http') 
              ? user.avatar 
              : `${window.location.origin}${user.avatar}`;
            imgRef.current.src = avatarUrl;
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
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

  const containerClasses = [
    'rounded-full flex items-center justify-center font-semibold text-white',
    size === 32 ? 'w-8 h-8' : 
    size === 64 ? 'w-16 h-16' : 
    size === 128 ? 'w-32 h-32' : 
    size === 256 ? 'w-64 h-64' : 
    `w-${Math.floor(size/4)} h-${Math.floor(size/4)}`,
    border ? 'border-2 border-primary' : '',
    shadow ? 'shadow-lg' : '',
    onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : '',
    className
  ].filter(Boolean).join(' ');

  const bgColor = user ? `bg-${getUserColor(user)}` : 'bg-neutral-600';

  return (
    <div className={containerClasses} onClick={onClick}>
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