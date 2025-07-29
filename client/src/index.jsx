import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Suppress deprecated window.styleMedia warning and other hydration warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  if (args[0] && typeof args[0] === 'string' && 
      (args[0].includes('window.styleMedia') || 
       args[0].includes('Layout was forced before the page was fully loaded') ||
       args[0].includes('hydration'))) {
    return;
  }
  originalWarn.apply(console, args);
};

// Suppress network errors for aborted requests
const originalError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && 
      (args[0].includes('NS_BINDING_ABORTED') || 
       args[0].includes('OpaqueResponseBlocking'))) {
    return;
  }
  originalError.apply(console, args);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  </React.StrictMode>
); 