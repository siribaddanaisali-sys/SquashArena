import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Welcome, {user?.firstName}!</h1>
        <p className="text-gray-600 mt-2">Role: <span className="font-bold text-squash-primary">{user?.role}</span></p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card text-center">
          <div className="text-3xl font-bold text-squash-primary">12</div>
          <p className="text-gray-600">Matches Played</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-squash-primary">8</div>
          <p className="text-gray-600">Wins</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-squash-primary">#45</div>
          <p className="text-gray-600">Current Ranking</p>
        </div>
        <div className="card text-center">
          <div className="text-3xl font-bold text-squash-primary">2,450</div>
          <p className="text-gray-600">Points</p>
        </div>
      </div>

      {user?.role === 'player' && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Upcoming Matches</h2>
          <p className="text-gray-600">No upcoming matches scheduled</p>
        </div>
      )}

      {user?.role === 'organiser' && (
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">My Tournaments</h2>
          <p className="text-gray-600">Create a new tournament to get started</p>
        </div>
      )}
    </div>
  );
}
