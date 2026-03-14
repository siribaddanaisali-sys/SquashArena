import React from 'react';
import { Link } from 'react-router-dom';
import DeveloperLayout from '../../components/developer/DeveloperLayout';

export default function DeveloperResourcesDashboard() {
  const resources = [
    {
      title: 'SRS Document',
      description: 'Software Requirements Specification for the Squash Arena platform',
      icon: '📄',
      path: '/developer-resources/srs',
      color: 'from-blue-400 to-blue-600',
    },
    {
      title: 'System Architecture',
      description: 'Complete system architecture, data flows, and technical design',
      icon: '🏗️',
      path: '/developer-resources/architecture',
      color: 'from-purple-400 to-purple-600',
    },
    {
      title: 'Technology Stack',
      description: 'All technologies, tools, and frameworks used in the system',
      icon: '🛠️',
      path: '/developer-resources/tech-stack',
      color: 'from-green-400 to-green-600',
    },
    {
      title: 'API Documentation',
      description: 'Complete REST API endpoints and WebSocket event documentation',
      icon: '🔌',
      path: '/developer-resources/api',
      color: 'from-orange-400 to-orange-600',
    },
    {
      title: 'Database Viewer',
      description: 'Browse all database tables, schemas, and live data in the system',
      icon: '🗄️',
      path: '/developer-resources/database',
      color: 'from-cyan-400 to-cyan-600',
    },
  ];

  return (
    <DeveloperLayout>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-squash-dark mb-2">Developer Resource Zone</h1>
        <p className="text-gray-600 text-lg">
          Welcome to the developer portal. Find documentation, architecture details, and technical resources here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        {resources.map((resource, idx) => (
          <Link
            key={idx}
            to={resource.path}
            className="transform transition hover:scale-105"
          >
            <div className={`bg-gradient-to-br ${resource.color} rounded-lg p-8 text-white shadow-lg h-full`}>
              <div className="text-4xl mb-4">{resource.icon}</div>
              <h2 className="text-2xl font-bold mb-2">{resource.title}</h2>
              <p className="opacity-90">{resource.description}</p>
              <div className="mt-4 flex items-center">
                <span className="text-sm">View Details →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <section className="bg-white rounded-lg p-8 shadow-md">
        <h2 className="text-2xl font-bold text-squash-dark mb-6">Quick Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-squash-secondary">13</div>
            <p className="text-gray-600 mt-2">API Endpoints</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-squash-secondary">9</div>
            <p className="text-gray-600 mt-2">Database Tables</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-squash-secondary">5</div>
            <p className="text-gray-600 mt-2">User Roles</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-squash-secondary">∞</div>
            <p className="text-gray-600 mt-2">Scalability</p>
          </div>
        </div>
      </section>

      <section className="bg-squash-light rounded-lg p-8 mt-8">
        <h2 className="text-2xl font-bold text-squash-dark mb-4">System Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-bold text-lg text-squash-primary mb-3">Frontend</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ React 18 + Vite</li>
              <li>✓ Tailwind CSS</li>
              <li>✓ React Router v6</li>
              <li>✓ Axios HTTP Client</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg text-squash-primary mb-3">Backend</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Node.js + Express</li>
              <li>✓ Sequelize ORM</li>
              <li>✓ MariaDB Database</li>
              <li>✓ Socket.io Real-time</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg text-squash-primary mb-3">Security</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ JWT Authentication</li>
              <li>✓ Bcryptjs Password Hashing</li>
              <li>✓ Role-Based Access Control</li>
              <li>✓ CORS Protection</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg text-squash-primary mb-3">Tools</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Git Version Control</li>
              <li>✓ GitHub Repository</li>
              <li>✓ Nodemon Dev Server</li>
              <li>✓ ESModules</li>
            </ul>
          </div>
        </div>
      </section>
    </DeveloperLayout>
  );
}
