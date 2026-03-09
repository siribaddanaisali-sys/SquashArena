import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center py-16 bg-gradient-to-r from-squash-primary to-squash-dark rounded-lg text-white">
        <h1 className="text-5xl font-bold mb-4">Welcome to Squash Arena</h1>
        <p className="text-xl mb-8">The International Platform for Squash Players, Coaches, and Fans</p>
        <div className="space-x-4">
          <Link to="/login" className="btn-secondary">Get Started</Link>
          <Link to="/tournaments" className="btn-primary">Explore Tournaments</Link>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card text-center">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="font-bold mb-2">Players</h3>
          <p className="text-sm text-gray-600">Build your profile and compete globally</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="font-bold mb-2">Tournaments</h3>
          <p className="text-sm text-gray-600">Join and organize competitions</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="font-bold mb-2">Rankings</h3>
          <p className="text-sm text-gray-600">Track world and regional rankings</p>
        </div>
        <div className="card text-center">
          <div className="text-4xl mb-4">🎥</div>
          <h3 className="font-bold mb-2">Watch Live</h3>
          <p className="text-sm text-gray-600">Follow your favorite players</p>
        </div>
      </section>

      <section className="bg-squash-light p-12 rounded-lg">
        <h2 className="text-3xl font-bold mb-6">Latest Tournaments</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="card">
              <h3 className="font-bold text-lg mb-2">Championship {i}</h3>
              <p className="text-gray-600 mb-4">Major International event</p>
              <span className="text-squash-primary font-semibold">Status: Upcoming</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
