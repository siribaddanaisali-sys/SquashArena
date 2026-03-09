import React from 'react';
import DeveloperLayout from '../../components/developer/DeveloperLayout';

export default function SRSPage() {
  return (
    <DeveloperLayout>
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-squash-dark mb-4">📄 SRS Document</h1>
        <p className="text-gray-600 mb-6">Software Requirements Specification for International Squash Platform</p>
        
        <div className="flex gap-4 mb-8">
          <button className="btn-primary">
            📥 Download SRS (PDF)
          </button>
          <button className="btn-secondary">
            📋 Download as Markdown
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-8 shadow-md space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-squash-dark mb-4">1. Introduction</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              <strong>Purpose:</strong> This document specifies the requirements for the International Squash Database Platform, 
              a comprehensive web application for managing squash tournaments, players, rankings, and regulatory functions.
            </p>
            <p>
              <strong>Scope:</strong> The platform serves five user roles: Players, Coaches, Viewers, Organisers, and Regulators.
              It provides tournament management, match scheduling, real-time scoring, and global rankings.
            </p>
            <p>
              <strong>Definitions:</strong>
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Tournament:</strong> A competitive event with multiple players competing in matches</li>
              <li><strong>Match:</strong> A single game between two players within a tournament</li>
              <li><strong>Ranking:</strong> Player position based on accumulated points and wins</li>
              <li><strong>Court:</strong> Physical location where matches are played</li>
              <li><strong>Venue:</strong> Physical facility housing courts</li>
            </ul>
          </div>
        </section>

        <section className="border-t pt-8">
          <h2 className="text-2xl font-bold text-squash-dark mb-4">2. Overall Description</h2>
          
          <h3 className="text-xl font-bold text-squash-primary mb-3">Product Perspective</h3>
          <p className="text-gray-700 mb-4">
            The Squash Arena is a web-based platform designed to serve the international squash community. 
            It provides a centralized system for managing tournaments, tracking player statistics, and maintaining 
            global rankings. The platform supports both administrators and everyday users.
          </p>

          <h3 className="text-xl font-bold text-squash-primary mb-3">User Classes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-squash-light p-4 rounded-lg">
              <h4 className="font-bold text-squash-primary mb-2">⚽ Players</h4>
              <p className="text-sm text-gray-700">Can register, build profiles, compete in tournaments, and track statistics.</p>
            </div>
            <div className="bg-squash-light p-4 rounded-lg">
              <h4 className="font-bold text-squash-primary mb-2">👨‍🏫 Coaches</h4>
              <p className="text-sm text-gray-700">Can manage assigned players, create training plans, and monitor progress.</p>
            </div>
            <div className="bg-squash-light p-4 rounded-lg">
              <h4 className="font-bold text-squash-primary mb-2">👁️ Viewers</h4>
              <p className="text-sm text-gray-700">Can watch matches, follow players, and view live scores and rankings.</p>
            </div>
            <div className="bg-squash-light p-4 rounded-lg">
              <h4 className="font-bold text-squash-primary mb-2">🎯 Organisers</h4>
              <p className="text-sm text-gray-700">Can create tournaments, schedule matches, and manage venues and courts.</p>
            </div>
            <div className="bg-squash-light p-4 rounded-lg">
              <h4 className="font-bold text-squash-primary mb-2">⚖️ Regulators</h4>
              <p className="text-sm text-gray-700">Can manage memberships, handle discipline actions, and access admin functions.</p>
            </div>
          </div>
        </section>

        <section className="border-t pt-8">
          <h2 className="text-2xl font-bold text-squash-dark mb-4">3. Functional Requirements</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-squash-primary mb-2">3.1 User Management</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>User registration with role selection</li>
                <li>User authentication using JWT tokens</li>
                <li>Profile management and updates</li>
                <li>Password reset functionality</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-squash-primary mb-2">3.2 Tournament Management</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Create, read, update, delete tournaments</li>
                <li>Set tournament categories (professional, amateur, junior, masters)</li>
                <li>Manage participant registration</li>
                <li>Track tournament status (upcoming, ongoing, completed, cancelled)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-squash-primary mb-2">3.3 Match Management</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Schedule matches within tournaments</li>
                <li>Record live match scores</li>
                <li>Track match results and winners</li>
                <li>Display real-time score updates to viewers</li>
              </ul>
            </div>

            <div>
              <h3 className="font-bold text-squash-primary mb-2">3.4 Ranking System</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>Calculate player rankings based on wins/points</li>
                <li>Maintain world, regional, and national rankings</li>
                <li>Display ranking histories</li>
                <li>Update rankings automatically after matches</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="border-t pt-8">
          <h2 className="text-2xl font-bold text-squash-dark mb-4">4. Non-Functional Requirements</h2>
          <div className="space-y-3 text-gray-700">
            <p><strong>Performance:</strong> System should handle 1000+ concurrent users with response times under 200ms</p>
            <p><strong>Availability:</strong> 99.5% uptime SLA with automated backups</p>
            <p><strong>Security:</strong> Password hashing, JWT tokens, CORS protection, and role-based access control</p>
            <p><strong>Scalability:</strong> Horizontal scaling support with load balancing</p>
          </div>
        </section>

        <section className="border-t pt-8 bg-squash-light p-6 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> This is a summary of the SRS document. For the complete specification, 
            please download the full PDF or Markdown version using the buttons above.
          </p>
        </section>
      </div>
    </DeveloperLayout>
  );
}
