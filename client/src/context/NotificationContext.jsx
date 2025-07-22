import React, { createContext, useContext, useState, useRef } from 'react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);
  const timeoutRef = useRef(null);

  const showNotification = (msg, type = 'info') => {
    setNotification({ msg, type });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setNotification(null), 4000);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded shadow-lg text-white ${notification.type === 'error' ? 'bg-red-600' : notification.type === 'success' ? 'bg-green-600' : 'bg-blue-600'}`}
          role="alert" aria-live="assertive" aria-atomic="true">
          {notification.msg}
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
} 