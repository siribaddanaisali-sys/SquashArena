import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function Home() {
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/home-stats').catch(() => null),
      api.get('/dashboard/activity-feed').catch(() => []),
    ]).then(([s, a]) => {
      setStats(s);
      setActivities(a || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section className="text-center py-16 bg-gradient-to-r from-squash-primary to-squash-dark rounded-lg text-white">
        <h1 className="text-5xl font-bold mb-4">Welcome to Squash Arena</h1>
        <p className="text-xl mb-8">The International Platform for Squash Players, Coaches, and Fans</p>
        <div className="space-x-4">
          <Link to="/login" className="btn-secondary">Get Started</Link>
          <Link to="/tournaments" className="btn-primary">Explore Tournaments</Link>
        </div>
      </section>

      {/* Platform Stats */}
      {stats?.counts && (
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="card text-center">
            <div className="text-3xl font-bold text-squash-primary">{stats.counts.players}</div>
            <p className="text-sm text-gray-600">Players</p>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-squash-primary">{stats.counts.tournaments}</div>
            <p className="text-sm text-gray-600">Tournaments</p>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-squash-primary">{stats.counts.matches}</div>
            <p className="text-sm text-gray-600">Matches Played</p>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-squash-primary">{stats.counts.clubs}</div>
            <p className="text-sm text-gray-600">Clubs</p>
          </div>
        </section>
      )}

      {/* Top Ranked Players */}
      {stats?.topPlayers?.length > 0 && (
        <section>
          <h2 className="text-3xl font-bold mb-6">Top Ranked Players</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {stats.topPlayers.map((p, i) => (
              <Link key={p.id} to={`/players/${p.id}`} className="card text-center hover:shadow-lg transition-shadow">
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center text-white font-bold ${
                  i === 0 ? 'bg-yellow-500' : i === 1 ? 'bg-gray-400' : i === 2 ? 'bg-amber-700' : 'bg-squash-primary'
                }`}>#{i + 1}</div>
                <p className="font-bold">{p.User?.firstName} {p.User?.lastName}</p>
                <p className="text-sm text-gray-500">{p.nationality}</p>
                <p className="text-squash-primary font-bold text-lg">{parseFloat(p.eloRating || 1500).toFixed(0)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Tournaments */}
      <section className="bg-squash-light p-8 rounded-lg">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Upcoming Tournaments</h2>
          <Link to="/tournaments" className="text-squash-primary hover:underline font-semibold">View All →</Link>
        </div>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : stats?.upcomingTournaments?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.upcomingTournaments.map(t => (
              <Link key={t.id} to={`/tournaments/${t.id}`} className="card hover:shadow-lg transition-shadow">
                <h3 className="font-bold text-lg mb-2">{t.name}</h3>
                <p className="text-gray-600 text-sm mb-1">{t.location}</p>
                <p className="text-gray-500 text-sm mb-3">{new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}</p>
                <div className="flex justify-between items-center">
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">{t.status}</span>
                  <span className="text-xs text-gray-500">{t.registeredParticipants}/{t.maxParticipants} players</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No upcoming tournaments</p>
        )}
      </section>

      {/* Recent Results & Activity Feed */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Results */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Results</h2>
          {stats?.recentResults?.length > 0 ? (
            <div className="divide-y card">
              {stats.recentResults.map(m => {
                const p1 = `${m.player1?.User?.firstName || '?'} ${m.player1?.User?.lastName || ''}`;
                const p2 = `${m.player2?.User?.firstName || '?'} ${m.player2?.User?.lastName || ''}`;
                const score = typeof m.score === 'string' ? (() => { try { return JSON.parse(m.score); } catch { return m.score; } })() : m.score;
                return (
                  <div key={m.id} className="py-3">
                    <div className="flex justify-between text-sm">
                      <span className={m.winnerId === m.player1Id ? 'font-bold text-green-700' : ''}>{p1}</span>
                      <span className="text-gray-400">vs</span>
                      <span className={m.winnerId === m.player2Id ? 'font-bold text-green-700' : ''}>{p2}</span>
                    </div>
                    {score && Array.isArray(score) && (
                      <p className="text-xs text-center text-gray-500 mt-1">
                        {score.map((g, i) => `${g.player1}-${g.player2}`).join(', ')}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{m.Tournament?.name}</p>
                  </div>
                );
              })}
            </div>
          ) : <p className="text-gray-500 card">No recent results</p>}
        </div>

        {/* Activity Feed */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Activity Feed</h2>
          {activities.length > 0 ? (
            <div className="divide-y card">
              {activities.slice(0, 8).map(a => (
                <div key={a.id} className="py-3">
                  <p className="text-sm font-semibold">{a.title}</p>
                  {a.description && <p className="text-xs text-gray-500">{a.description}</p>}
                  <p className="text-xs text-gray-400 mt-1">{new Date(a.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-500 card">No recent activity</p>}
        </div>
      </section>

      {/* Quick Links */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link to="/players" className="card text-center hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4">👥</div>
          <h3 className="font-bold mb-2">Players</h3>
          <p className="text-sm text-gray-600">Build your profile and compete globally</p>
        </Link>
        <Link to="/tournaments" className="card text-center hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4">🏆</div>
          <h3 className="font-bold mb-2">Tournaments</h3>
          <p className="text-sm text-gray-600">Join and organize competitions</p>
        </Link>
        <Link to="/rankings" className="card text-center hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="font-bold mb-2">Rankings</h3>
          <p className="text-sm text-gray-600">Track world and regional rankings</p>
        </Link>
        <Link to="/clubs" className="card text-center hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4">🏢</div>
          <h3 className="font-bold mb-2">Clubs</h3>
          <p className="text-sm text-gray-600">Find and join squash clubs</p>
        </Link>
      </section>
    </div>
  );
}
