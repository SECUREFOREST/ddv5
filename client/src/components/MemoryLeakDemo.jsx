import React, { useState } from 'react';

/**
 * Demo component showing memory leak prevention utilities
 */
export default function MemoryLeakDemo() {
  const [count, setCount] = useState(0);
  const [showMessage, setShowMessage] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [componentMounted, setComponentMounted] = useState(true);
  
  // Use memory-safe hooks
  
  // Removed: const { addCleanup, isMounted } = useComponentLifecycle('MemoryLeakDemo');
  
  // Memory-safe interval
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  
  // Memory-safe timeout
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setShowMessage(true);
    }, 3000);
    return () => clearTimeout(timeout);
  }, []);
  
  // Memory-safe event listener
  React.useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Component lifecycle tracking
  React.useEffect(() => {
    setComponentMounted(true);
    return () => {
      setComponentMounted(false);
      console.log('MemoryLeakDemo unmounted');
    };
  }, []);
  
  const handleCheckMemory = () => {
    console.log('Cleanup registry size:', cleanupRegistry.length);
    console.log('Current cleanup registry:', cleanupRegistry);
  };
  
  const handleForceCleanup = () => {
    // This functionality is no longer available with the native React hooks
    console.warn('Force cleanup functionality is not available with native React hooks.');
  };
  
  return (
    <div className="p-6 bg-neutral-900 rounded-xl border border-neutral-700">
      <h2 className="text-xl font-bold text-neutral-100 mb-4">
        Memory Leak Prevention Demo
      </h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-neutral-800 rounded-lg">
          <h3 className="font-semibold text-neutral-200 mb-2">Interval Counter</h3>
          <p className="text-neutral-300">Count: {count}</p>
          <p className="text-sm text-neutral-400">
            This interval is automatically cleaned up when component unmounts
          </p>
        </div>
        
        <div className="p-4 bg-neutral-800 rounded-lg">
          <h3 className="font-semibold text-neutral-200 mb-2">Timeout Message</h3>
          {showMessage && (
            <p className="text-green-400">Message appeared after 3 seconds!</p>
          )}
          <p className="text-sm text-neutral-400">
            This timeout is automatically cleaned up
          </p>
        </div>
        
        <div className="p-4 bg-neutral-800 rounded-lg">
          <h3 className="font-semibold text-neutral-200 mb-2">Window Resize</h3>
          <p className="text-neutral-300">
            Window size: {windowSize.width} x {windowSize.height}
          </p>
          <p className="text-sm text-neutral-400">
            Event listener is automatically cleaned up
          </p>
        </div>
        
        <div className="p-4 bg-neutral-800 rounded-lg">
          <h3 className="font-semibold text-neutral-200 mb-2">Component Lifecycle</h3>
          <p className="text-neutral-300">
            Component mounted: {componentMounted ? 'Yes' : 'No'}
          </p>
          <p className="text-sm text-neutral-400">
            Lifecycle is tracked and cleanup is registered
          </p>
        </div>
        
        <div className="p-4 bg-neutral-800 rounded-lg">
          <h3 className="font-semibold text-neutral-200 mb-2">Memory Management</h3>
          <div className="space-y-2">
            <button
              onClick={handleCheckMemory}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Check Memory Registry
            </button>
            <button
              onClick={handleForceCleanup}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors ml-2"
            >
              Force Cleanup
            </button>
          </div>
          <p className="text-sm text-neutral-400 mt-2">
            Check browser console for memory registry details
          </p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
        <h3 className="font-semibold text-yellow-200 mb-2">Memory Leak Prevention Features</h3>
        <ul className="text-sm text-yellow-100 space-y-1">
          <li>• Automatic timer cleanup with useInterval and useTimeout</li>
          <li>• Automatic event listener cleanup with proper useEffect cleanup</li>
          <li>• Component lifecycle tracking with useComponentLifecycle</li>
          <li>• Global cleanup registry for debugging</li>
          <li>• Memory-safe state updates</li>
          <li>• Automatic WebSocket connection cleanup</li>
        </ul>
      </div>
    </div>
  );
} 