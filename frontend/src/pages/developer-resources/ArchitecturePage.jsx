import React from 'react';
import DeveloperLayout from '../../components/developer/DeveloperLayout';

export default function ArchitecturePage() {
  return (
    <DeveloperLayout>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-squash-dark mb-4">🏗️ System Architecture</h1>
        <p className="text-gray-600 mb-6">Complete technical architecture and data flow documentation</p>
        
        <div className="flex gap-4 mb-8">
          <button className="btn-primary">
            📥 Download Architecture Doc (PDF)
          </button>
          <button className="btn-secondary">
            🖼️ View Architecture Diagrams
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-8 shadow-md space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-squash-dark mb-4">Architecture Overview</h2>
          <div className="bg-squash-light p-6 rounded-lg mb-6 font-mono text-sm overflow-x-auto">
            <pre>{`┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER (Browser)                       │
│                    React 18 + Vite + Tailwind                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP/WebSocket
                               │ (Port 5173)
┌──────────────────────────────▼──────────────────────────────────┐
│                      API LAYER (Backend)                        │
│            Node.js + Express + Socket.io                        │
│                     (Port 5000)                                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │ SQL Queries
                               │ (Port 3306)
┌──────────────────────────────▼──────────────────────────────────┐
│                    DATA LAYER (Database)                        │
│                    MariaDB/MySQL                                │
└─────────────────────────────────────────────────────────────────┘`}</pre>
          </div>
        </section>

        <section className="border-t pt-8">
          <h2 className="text-2xl font-bold text-squash-dark mb-4">Frontend Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-squash-primary mb-3">Technology Stack</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ React 18 (UI Framework)</li>
                <li>✓ Vite (Build Tool)</li>
                <li>✓ Tailwind CSS (Styling)</li>
                <li>✓ React Router v6 (Navigation)</li>
                <li>✓ Axios (HTTP Client)</li>
                <li>✓ Socket.io Client (Real-time)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-squash-primary mb-3">Key Components</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Layout & Navigation</li>
                <li>✓ Authentication Pages</li>
                <li>✓ Player Management</li>
                <li>✓ Tournament Listings</li>
                <li>✓ Rankings Display</li>
                <li>✓ User Dashboard</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t pt-8">
          <h2 className="text-2xl font-bold text-squash-dark mb-4">Backend Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-bold text-squash-primary mb-3">Technology Stack</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Node.js (Runtime)</li>
                <li>✓ Express.js (Framework)</li>
                <li>✓ Sequelize ORM</li>
                <li>✓ MySQL2 Driver</li>
                <li>✓ JWT Authentication</li>
                <li>✓ Socket.io (Real-time)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-squash-primary mb-3">API Layers</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Authentication Routes</li>
                <li>✓ Player Management API</li>
                <li>✓ Tournament API</li>
                <li>✓ Match Management API</li>
                <li>✓ Ranking System API</li>
                <li>✓ Venue Management API</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t pt-8">
          <h2 className="text-2xl font-bold text-squash-dark mb-4">Database Design</h2>
          <div className="bg-squash-light p-6 rounded-lg mb-4">
            <h3 className="font-bold text-squash-primary mb-3">Core Tables (9)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-semibold text-squash-dark">Primary Tables:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
                  <li>Users</li>
                  <li>Players</li>
                  <li>Coaches</li>
                  <li>Tournaments</li>
                  <li>Matches</li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-squash-dark">Supporting Tables:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2">
                  <li>Rankings</li>
                  <li>Venues</li>
                  <li>Courts</li>
                  <li>PlayerCoach (Junction)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t pt-8">
          <h2 className="text-2xl font-bold text-squash-dark mb-4">Authentication & Security</h2>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-bold text-blue-900 mb-2">JWT Authentication Flow</h4>
              <p className="text-sm text-blue-800">
                Users register/login → Password hashed with bcryptjs → JWT token generated → 
                Token stored in localStorage → Sent with every authenticated request
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-bold text-green-900 mb-2">Role-Based Access Control</h4>
              <p className="text-sm text-green-800">
                5 user roles (player, coach, organiser, regulator, viewer) with specific permissions. 
                Middleware validates user role before allowing API access.
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h4 className="font-bold text-purple-900 mb-2">Security Features</h4>
              <p className="text-sm text-purple-800">
                ✓ CORS Protection ✓ Helmet.js Headers ✓ Password Hashing ✓ JWT Tokens ✓ Role-based Middleware
              </p>
            </div>
          </div>
        </section>

        <section className="border-t pt-8">
          <h2 className="text-2xl font-bold text-squash-dark mb-4">Data Flow Example</h2>
          <div className="bg-squash-light p-6 rounded-lg">
            <h4 className="font-bold text-squash-primary mb-4">Creating a Tournament</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <p>1. Organiser fills form → UI validation</p>
              <p>2. Frontend sends POST request to /api/tournaments</p>
              <p>3. Backend authenticates request (JWT check)</p>
              <p>4. Backend authorizes (checks organiser role)</p>
              <p>5. Controller validates tournament data</p>
              <p>6. Sequelize creates tournament record</p>
              <p>7. MariaDB stores data & returns ID</p>
              <p>8. Response sent to frontend with confirmation</p>
              <p>9. UI updates to show new tournament</p>
            </div>
          </div>
        </section>

        <section className="border-t pt-8 bg-squash-light p-6 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> This is a summary of the system architecture. 
            For detailed diagrams and complete documentation, download the full architecture document above.
          </p>
        </section>
      </div>
    </DeveloperLayout>
  );
}
