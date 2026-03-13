import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      let endpoint = '/dashboard/player';
      if (user?.role === 'organiser') endpoint = '/dashboard/organiser';
      else if (user?.role === 'coach') endpoint = '/dashboard/coach';

      const result = await api.get(endpoint);
      setData(result);
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-lg">Loading dashboard...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Welcome, {user?.firstName}!</h1>
        <p className="text-gray-600 mt-2">Role: <span className="font-bold text-squash-primary capitalize">{user?.role}</span></p>
      </div>

      {user?.role === 'player' && data?.player && <PlayerDashboard data={data} />}
      {user?.role === 'organiser' && data?.stats && <OrganiserDashboard data={data} />}
      {user?.role === 'coach' && data?.coach && <CoachDashboard data={data} />}
      {!['player', 'organiser', 'coach'].includes(user?.role) && <ViewerDashboard />}
    </div>
  );
}

function PlayerDashboard({ data }) {
  const { player, upcomingMatches, recentMatches, registeredTournaments, clubs } = data;

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="ELO Rating" value={parseFloat(player.eloRating || 1500).toFixed(0)} color="blue" />
        <StatCard label="Matches" value={player.totalMatches} color="gray" />
        <StatCard label="Wins" value={player.wins} color="green" />
        <StatCard label="Losses" value={player.losses} color="red" />
        <StatCard label="Win %" value={`${player.winPercentage}%`} color="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard label="World Ranking" value={`#${player.ranking || 'N/A'}`} color="yellow" />
        <StatCard label="Points" value={parseFloat(player.points || 0).toFixed(0)} color="indigo" />
      </div>

      {/* Upcoming Matches */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Upcoming Matches</h2>
        {upcomingMatches?.length > 0 ? (
          <div className="divide-y">
            {upcomingMatches.map(m => {
              const opponent = m.player1Id === player.id ? m.player2 : m.player1;
              const oppName = `${opponent?.User?.firstName || ''} ${opponent?.User?.lastName || ''}`;
              return (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">vs {oppName} <span className="text-gray-400 text-sm">(#{opponent?.ranking})</span></p>
                    <p className="text-sm text-gray-500">{m.Tournament?.name} · Round {m.roundNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{new Date(m.scheduledTime).toLocaleDateString()}</p>
                    <Link to={`/live-scoring/${m.id}`} className="text-xs text-squash-primary hover:underline font-semibold">Score →</Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <p className="text-gray-500">No upcoming matches</p>}
      </div>

      {/* Recent Results */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Recent Results</h2>
        {recentMatches?.length > 0 ? (
          <div className="divide-y">
            {recentMatches.map(m => {
              const isWinner = m.winnerId === player.id;
              const opponent = m.player1Id === player.id ? m.player2 : m.player1;
              const oppName = `${opponent?.User?.firstName || ''} ${opponent?.User?.lastName || ''}`;
              return (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isWinner ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{isWinner ? 'W' : 'L'}</span>
                    <div>
                      <p className="font-semibold">vs {oppName}</p>
                      <p className="text-sm text-gray-500">{m.Tournament?.name}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{new Date(m.scheduledTime).toLocaleDateString()}</p>
                </div>
              );
            })}
          </div>
        ) : <p className="text-gray-500">No recent matches</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registered Tournaments */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">My Tournaments</h2>
          {registeredTournaments?.length > 0 ? (
            <div className="divide-y">
              {registeredTournaments.map(reg => (
                <Link key={reg.id} to={`/tournaments/${reg.Tournament?.id}`} className="py-3 block hover:bg-gray-50 -mx-4 px-4 rounded">
                  <p className="font-semibold">{reg.Tournament?.name}</p>
                  <p className="text-sm text-gray-500">
                    {reg.Tournament?.location} · {new Date(reg.Tournament?.startDate).toLocaleDateString()}
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                      reg.Tournament?.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                      reg.Tournament?.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{reg.Tournament?.status}</span>
                  </p>
                </Link>
              ))}
            </div>
          ) : <p className="text-gray-500">Not registered for any tournaments</p>}
        </div>

        {/* Club Memberships */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">My Clubs</h2>
          {clubs?.length > 0 ? (
            <div className="divide-y">
              {clubs.map(cm => (
                <Link key={cm.id} to={`/clubs/${cm.Club?.id}`} className="py-3 block hover:bg-gray-50 -mx-4 px-4 rounded">
                  <p className="font-semibold">{cm.Club?.name}</p>
                  <p className="text-sm text-gray-500">{cm.Club?.city}, {cm.Club?.country}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-gray-500 mb-2">Not a member of any club</p>
              <Link to="/clubs" className="text-squash-primary text-sm hover:underline font-semibold">Browse clubs →</Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function OrganiserDashboard({ data }) {
  const { stats, upcomingTournaments, ongoingTournaments, recentTournaments } = data;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tournaments" value={stats.totalTournaments} color="blue" />
        <StatCard label="Upcoming" value={stats.upcoming} color="green" />
        <StatCard label="Ongoing" value={stats.ongoing} color="yellow" />
        <StatCard label="Total Matches" value={stats.totalMatches} color="gray" />
      </div>

      {ongoingTournaments?.length > 0 && (
        <div className="card mb-6 border-l-4 border-green-500">
          <h2 className="text-xl font-bold mb-4 text-green-700">Ongoing Tournaments</h2>
          <div className="divide-y">
            {ongoingTournaments.map(t => (
              <Link key={t.id} to={`/tournaments/${t.id}`} className="py-3 block hover:bg-gray-50 -mx-4 px-4 rounded">
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-gray-500">{t.location} · {t.registrations?.length || 0} players</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {upcomingTournaments?.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Upcoming Tournaments</h2>
          <div className="divide-y">
            {upcomingTournaments.map(t => (
              <Link key={t.id} to={`/tournaments/${t.id}`} className="py-3 block hover:bg-gray-50 -mx-4 px-4 rounded">
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-gray-500">
                  {t.location} · Starts {new Date(t.startDate).toLocaleDateString()}
                  · {t.registeredParticipants}/{t.maxParticipants} registered
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function CoachDashboard({ data }) {
  const { coach, players } = data;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <StatCard label="Level" value={coach.certification} color="blue" />
        <StatCard label="Experience" value={`${coach.experience} yrs`} color="green" />
        <StatCard label="Players" value={players.length} color="purple" />
      </div>

      <div className="card">
        <h2 className="text-xl font-bold mb-4">My Players</h2>
        {players.length > 0 ? (
          <div className="divide-y">
            {players.map(p => (
              <Link key={p.id} to={`/players/${p.id}`} className="py-3 flex items-center justify-between hover:bg-gray-50 -mx-4 px-4 rounded">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-500">Rank #{p.ranking} · {p.nationality}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-squash-primary">{parseFloat(p.eloRating || 1500).toFixed(0)}</p>
                  <p className="text-xs text-gray-500">W{p.wins} L{p.losses}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : <p className="text-gray-500">No players assigned yet</p>}
      </div>
    </>
  );
}

function ViewerDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link to="/tournaments" className="card hover:shadow-lg transition-shadow text-center py-8">
        <div className="text-4xl mb-3">🏆</div>
        <h3 className="text-xl font-bold">Browse Tournaments</h3>
        <p className="text-gray-500 text-sm mt-1">View all upcoming tournaments</p>
      </Link>
      <Link to="/rankings" className="card hover:shadow-lg transition-shadow text-center py-8">
        <div className="text-4xl mb-3">📊</div>
        <h3 className="text-xl font-bold">Rankings</h3>
        <p className="text-gray-500 text-sm mt-1">View world and regional rankings</p>
      </Link>
      <Link to="/players" className="card hover:shadow-lg transition-shadow text-center py-8">
        <div className="text-4xl mb-3">👥</div>
        <h3 className="text-xl font-bold">Players</h3>
        <p className="text-gray-500 text-sm mt-1">Explore player profiles</p>
      </Link>
      <Link to="/clubs" className="card hover:shadow-lg transition-shadow text-center py-8">
        <div className="text-4xl mb-3">🏢</div>
        <h3 className="text-xl font-bold">Clubs</h3>
        <p className="text-gray-500 text-sm mt-1">Find and join squash clubs</p>
      </Link>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: 'text-blue-600', green: 'text-green-600', red: 'text-red-600',
    purple: 'text-purple-600', gray: 'text-gray-700', yellow: 'text-yellow-600',
    indigo: 'text-indigo-600',
  };
  return (
    <div className="card text-center">
      <div className={`text-2xl font-bold ${colors[color] || colors.gray}`}>{value}</div>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  );
}
