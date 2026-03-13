import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function PlayerDetail() {
  const { id } = useParams();
  const [player, setPlayer] = useState(null);
  const [stats, setStats] = useState(null);
  const [matchHistory, setMatchHistory] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlayerData();
  }, [id]);

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      const [playerData, statsData, historyData] = await Promise.all([
        api.get(`/players/${id}`),
        api.get(`/matches/player/${id}/stats`),
        api.get(`/matches/player/${id}/history?limit=20`),
      ]);
      setPlayer(playerData);
      setStats(statsData);
      setMatchHistory(historyData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-lg">Loading player profile...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;
  if (!player) return <div className="text-center py-12">Player not found</div>;

  const playerName = `${player.User?.firstName || ''} ${player.User?.lastName || ''}`;
  const pStats = stats?.stats || {};
  const eloHistory = stats?.eloHistory || [];

  return (
    <div>
      <Link to="/players" className="text-squash-primary hover:underline mb-4 inline-block">
        ← Back to Players
      </Link>

      {/* Player Header */}
      <div className="card mb-6">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 bg-squash-primary bg-opacity-20 rounded-full flex items-center justify-center text-4xl font-bold text-squash-primary">
            {(player.User?.firstName?.[0] || '') + (player.User?.lastName?.[0] || '')}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{playerName}</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-600">
              <span>🌍 {player.nationality || 'N/A'}</span>
              <span>✋ {player.hand}-handed</span>
              <span className={`px-2 py-0.5 rounded text-sm font-semibold ${
                player.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>{player.status}</span>
            </div>
            {player.bio && <p className="text-gray-500 mt-2">{player.bio}</p>}
            <Link to={`/players/${id}/stats`} className="inline-block mt-2 text-sm text-squash-primary hover:underline font-medium">
              📊 View Full Stats & Charts →
            </Link>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-squash-primary">#{player.ranking || 'N/A'}</div>
            <p className="text-gray-500 text-sm">World Ranking</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard label="ELO Rating" value={parseFloat(player.eloRating || 1500).toFixed(0)} color="blue" />
        <StatCard label="Matches" value={pStats.totalMatches || 0} color="gray" />
        <StatCard label="Wins" value={pStats.wins || 0} color="green" />
        <StatCard label="Losses" value={pStats.losses || 0} color="red" />
        <StatCard label="Win %" value={`${pStats.winPercentage || 0}%`} color="purple" />
      </div>

      {/* Form */}
      {pStats.form && pStats.form.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-bold mb-3">Recent Form</h3>
          <div className="flex gap-2">
            {pStats.form.map((r, i) => (
              <span key={i} className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                r === 'W' ? 'bg-green-500' : 'bg-red-500'
              }`}>{r}</span>
            ))}
          </div>
          {pStats.longestStreak > 0 && (
            <p className="text-sm text-gray-500 mt-2">🔥 Longest win streak: {pStats.longestStreak}</p>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {['overview', 'matches', 'elo'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold capitalize border-b-2 transition ${
              activeTab === tab
                ? 'border-squash-primary text-squash-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab === 'overview' ? '📊 Overview' : tab === 'matches' ? '🎾 Match History' : '📈 ELO History'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Game Statistics</h3>
            <div className="space-y-3">
              <StatRow label="Games Won" value={pStats.totalGamesWon || 0} />
              <StatRow label="Games Lost" value={pStats.totalGamesLost || 0} />
              <StatRow label="Points Won" value={pStats.totalPointsWon || 0} />
              <StatRow label="Points Lost" value={pStats.totalPointsLost || 0} />
              <StatRow label="Avg Points/Match" value={pStats.avgPointsPerMatch || 0} />
            </div>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Player Info</h3>
            <div className="space-y-3">
              <StatRow label="Ranking" value={`#${player.ranking || 'Unranked'}`} />
              <StatRow label="ELO Rating" value={parseFloat(player.eloRating || 1500).toFixed(0)} />
              <StatRow label="Points" value={parseFloat(player.points || 0).toFixed(0)} />
              <StatRow label="Nationality" value={player.nationality || 'N/A'} />
              <StatRow label="Playing Hand" value={`${player.hand}-handed`} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'matches' && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Match History</h3>
          {(!matchHistory?.matches || matchHistory.matches.length === 0) ? (
            <p className="text-gray-500 text-center py-8">No matches found.</p>
          ) : (
            <div className="space-y-3">
              {matchHistory.matches.map(match => {
                const isPlayer1 = match.player1Id === id;
                const opponent = isPlayer1 ? match.player2 : match.player1;
                const won = match.winnerId === id;
                const opponentName = opponent?.User
                  ? `${opponent.User.firstName} ${opponent.User.lastName}`
                  : 'Unknown';

                return (
                  <div key={match.id} className={`p-4 rounded-lg border-l-4 ${
                    match.status === 'completed'
                      ? won ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'
                      : 'border-gray-300 bg-gray-50'
                  }`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-semibold">vs </span>
                        <Link to={`/players/${opponent?.id}`} className="text-squash-primary hover:underline font-semibold">
                          {opponentName}
                        </Link>
                        {opponent?.ranking && <span className="text-gray-400 text-sm ml-2">#{opponent.ranking}</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        {match.score?.games && (
                          <span className="text-sm text-gray-600">
                            {match.score.games.map(g => isPlayer1 ? `${g[0]}-${g[1]}` : `${g[1]}-${g[0]}`).join(', ')}
                          </span>
                        )}
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          match.status !== 'completed' ? 'bg-gray-200 text-gray-600' :
                          won ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                        }`}>
                          {match.status !== 'completed' ? match.status.toUpperCase() : won ? 'WIN' : 'LOSS'}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Round {match.roundNumber} • {new Date(match.scheduledTime).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'elo' && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">ELO Rating History</h3>
          {eloHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No ELO history yet.</p>
          ) : (
            <>
              {/* Simple visual chart */}
              <div className="mb-6">
                <EloChart history={eloHistory} />
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    <th className="py-2">Date</th>
                    <th className="py-2">Result</th>
                    <th className="py-2">Rating</th>
                    <th className="py-2">Change</th>
                  </tr>
                </thead>
                <tbody>
                  {eloHistory.map((entry, i) => (
                    <tr key={i} className="border-b">
                      <td className="py-2">{new Date(entry.createdAt).toLocaleDateString()}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          entry.result === 'win' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>{entry.result.toUpperCase()}</span>
                      </td>
                      <td className="py-2 font-semibold">{parseFloat(entry.newRating).toFixed(0)}</td>
                      <td className={`py-2 font-semibold ${parseFloat(entry.ratingChange) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {parseFloat(entry.ratingChange) >= 0 ? '+' : ''}{parseFloat(entry.ratingChange).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    red: 'bg-red-50 text-red-700',
    purple: 'bg-purple-50 text-purple-700',
    gray: 'bg-gray-50 text-gray-700',
  };
  return (
    <div className={`rounded-lg p-4 text-center ${colors[color] || colors.gray}`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm opacity-75">{label}</div>
    </div>
  );
}

function StatRow({ label, value }) {
  return (
    <div className="flex justify-between py-1 border-b border-gray-100">
      <span className="text-gray-600">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function EloChart({ history }) {
  if (history.length === 0) return null;
  
  const ratings = history.map(h => parseFloat(h.newRating));
  const min = Math.min(...ratings) - 50;
  const max = Math.max(...ratings) + 50;
  const range = max - min || 1;
  const height = 200;
  const width = Math.max(history.length * 40, 300);

  const points = ratings.map((r, i) => {
    const x = (i / (ratings.length - 1 || 1)) * (width - 40) + 20;
    const y = height - ((r - min) / range) * (height - 40) - 20;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="overflow-x-auto">
      <svg width={width} height={height} className="border rounded bg-gray-50">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(pct => {
          const y = height - pct * (height - 40) - 20;
          const val = Math.round(min + pct * range);
          return (
            <g key={pct}>
              <line x1="20" y1={y} x2={width - 20} y2={y} stroke="#e5e7eb" strokeDasharray="4" />
              <text x="2" y={y + 4} fontSize="10" fill="#9ca3af">{val}</text>
            </g>
          );
        })}
        {/* Line */}
        <polyline points={points} fill="none" stroke="#3b82f6" strokeWidth="2" />
        {/* Points */}
        {ratings.map((r, i) => {
          const x = (i / (ratings.length - 1 || 1)) * (width - 40) + 20;
          const y = height - ((r - min) / range) * (height - 40) - 20;
          return (
            <circle key={i} cx={x} cy={y} r="4"
              fill={history[i].result === 'win' ? '#22c55e' : '#ef4444'}
              stroke="white" strokeWidth="1" />
          );
        })}
      </svg>
    </div>
  );
}
