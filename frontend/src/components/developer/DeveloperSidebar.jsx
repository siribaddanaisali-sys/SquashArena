import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function DeveloperSidebar() {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const resources = [
    { path: '/developer-resources', label: 'Dashboard', icon: '📊' },
    { path: '/developer-resources/srs', label: 'SRS Document', icon: '📄' },
    { path: '/developer-resources/architecture', label: 'System Architecture', icon: '🏗️' },
    { path: '/developer-resources/tech-stack', label: 'Technology Stack', icon: '🛠️' },
    { path: '/developer-resources/database', label: 'Database Viewer', icon: '🗄️' },
  ];

  return (
    <aside className="w-64 bg-squash-dark text-white h-full fixed left-0 top-16 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-8">Developer Zone</h2>
        <nav className="space-y-2">
          {resources.map(resource => (
            <Link
              key={resource.path}
              to={resource.path}
              className={`block px-4 py-3 rounded-lg transition-all ${
                isActive(resource.path)
                  ? 'bg-squash-secondary text-white'
                  : 'hover:bg-squash-primary text-gray-200'
              }`}
            >
              <span className="mr-2">{resource.icon}</span>
              {resource.label}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
