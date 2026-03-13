import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          🎾 Squash Arena
        </Link>
        <div className="flex gap-6 items-center">
          <Link to="/players" className="hover:text-squash-secondary">Players</Link>
          <Link to="/tournaments" className="hover:text-squash-secondary">Tournaments</Link>
          <Link to="/rankings" className="hover:text-squash-secondary">Rankings</Link>
          <Link to="/head-to-head" className="hover:text-squash-secondary">H2H</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="hover:text-squash-secondary">Dashboard</Link>
              {(user.role === 'regulator' || user.role === 'organiser') && (
                <Link to="/developer-resources" className="hover:text-squash-secondary font-semibold text-squash-accent">
                  💻 Dev Zone
                </Link>
              )}
              <button onClick={logout} className="btn-secondary">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-primary">Login</Link>
              <Link to="/register" className="btn-secondary">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
