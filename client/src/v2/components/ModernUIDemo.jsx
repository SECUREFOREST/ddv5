import React, { useState } from 'react';
import ModernDashboard from '../ModernDashboard';
import ModernTaskCreator from '../ModernTaskCreator';
import ModernTaskBrowser from '../ModernTaskBrowser';
import ModernProfile from '../ModernProfile';
import ModernNavigation from '../ModernNavigation';

const ModernUIDemo = () => {
  const [activeComponent, setActiveComponent] = useState('dashboard');

  const components = {
    dashboard: { name: 'Dashboard', component: ModernDashboard },
    taskCreator: { name: 'Task Creator', component: ModernTaskCreator },
    taskBrowser: { name: 'Task Browser', component: ModernTaskBrowser },
    profile: { name: 'Profile', component: ModernProfile },
    navigation: { name: 'Navigation', component: ModernNavigation }
  };

  const ActiveComponent = components[activeComponent].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Navigation Tabs */}
      <div className="sticky top-0 z-50 bg-neutral-800/80 backdrop-blur-md border-b border-neutral-700/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex space-x-1 overflow-x-auto">
            {Object.entries(components).map(([key, { name }]) => (
              <button
                key={key}
                onClick={() => setActiveComponent(key)}
                className={`px-6 py-4 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                  activeComponent === key
                    ? 'text-white border-b-2 border-primary bg-primary/10'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-700/50'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Component Display */}
      <div className="relative">
        <ActiveComponent />
      </div>

              {/* Component Info */}
        <div className="fixed bottom-6 right-6 bg-neutral-800/90 backdrop-blur-md rounded-xl border border-neutral-700/50 p-4 max-w-sm">
          <h3 className="text-white font-semibold mb-2">Modern OSA UI Components</h3>
          <p className="text-neutral-400 text-sm mb-3">
            This demo showcases modern UI components built from the legacy OSA design patterns and application logic.
          </p>
          <div className="space-y-2 text-xs text-neutral-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <span>OSA Color Scheme</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-info rounded-full"></div>
              <span>Difficulty System</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <span>Role Management</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <span>Task Workflows</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-neutral-700/50">
            <a
              href="/modern/routes"
              className="text-primary hover:text-primary-dark text-sm font-medium transition-colors duration-200"
            >
              View All Routes →
            </a>
          </div>
        </div>
    </div>
  );
};

export default ModernUIDemo; 