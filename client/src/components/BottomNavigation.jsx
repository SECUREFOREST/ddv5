import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  HomeIcon, 
  FireIcon, 
  TrophyIcon, 
  UserIcon, 
  BellIcon,
  PlusIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  FireIcon as FireIconSolid, 
  TrophyIcon as TrophyIconSolid, 
  UserIcon as UserIconSolid, 
  BellIcon as BellIconSolid,
  PlusIcon as PlusIconSolid,
  PlayIcon as PlayIconSolid
} from '@heroicons/react/24/solid';

export default function BottomNavigation() {
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  // Define navigation items for mobile
  const navItems = [
    {
      to: '/dashboard',
      label: 'Home',
      icon: HomeIcon,
      solidIcon: HomeIconSolid,
      auth: true
    },
    {
      to: '/dares',
      label: 'Dares',
      icon: FireIcon,
      solidIcon: FireIconSolid,
      auth: true
    },
    {
      to: '/dare/create',
      label: 'Create',
      icon: PlusIcon,
      solidIcon: PlusIconSolid,
      auth: true
    },
    {
      to: '/switches',
      label: 'Games',
      icon: PlayIcon,
      solidIcon: PlayIconSolid,
      auth: true
    },
    {
      to: '/leaderboard',
      label: 'Leaderboard',
      icon: TrophyIcon,
      solidIcon: TrophyIconSolid,
      auth: true
    },
    {
      to: '/profile',
      label: 'Profile',
      icon: UserIcon,
      solidIcon: UserIconSolid,
      auth: true
    }
  ];

  // Filter items based on authentication
  const filteredItems = navItems.filter(item => {
    if (item.auth && !user) return false;
    return true;
  });

  // Take only the first 5 items to fit in bottom nav
  const displayItems = filteredItems.slice(0, 5);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-800 z-50 lg:hidden">
      <div className="flex justify-around items-center py-2 px-2">
        {displayItems.map((item) => {
          const isActive = currentPath === item.to || 
            (item.to !== '/dashboard' && currentPath.startsWith(item.to));
          
          const Icon = isActive ? item.solidIcon : item.icon;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`
                flex flex-col items-center justify-center
                min-h-[60px] min-w-[60px] px-2 py-2
                rounded-xl transition-all duration-200
                touch-manipulation
                ${isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }
                active:scale-95 active:bg-neutral-800/70
                focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-neutral-900
              `}
              aria-label={`Navigate to ${item.label}`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
      
      {/* Safe area for devices with home indicators */}
      <div className="h-safe-area-inset-bottom bg-neutral-900/95" />
    </div>
  );
} 