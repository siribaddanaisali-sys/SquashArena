import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';

const COLORS = ['#10B981', '#EF4444', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'];

export default function PlayerStats() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const result = await api.get(`/players/${id}/stats`);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [id]);

  if (loading) return <div className="text-center py-12">Loading player stats...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;
  if (!data) return null;

  const { player, eloHistory, opponentBreakdown } = data;
  const winRate = player.wins + player.losses > 0
    ? Math.round((player.wins / (player.wins + player.losses)) * 100)
    : 0;

  const pieData = [
    { name: 'Wins', value: player.wins },
    { name: 'Losses', value: player.losses },
  ];

  return (
    <div>
      <div className="mb-6">
        <Link to={`/players/${id}`} className="text-squash-primary hover:underline">← Back to Profile</Link>
      </div>

      <h1 className="text-4xl font-bold mb-2">📊 {player.name} — Stats</h1>
      <p className="text-gray-600 mb-8">Rank #{player.ranking || '-'} • ELO {parseFloat(player.eloRating).toFixed(0)} • {player.nationality}</p>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-gray-600 text-sm">World Rank</p>
          <p className="text-3xl font-bold text-squash-primary">#{player.ranking || '-'}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-gray-600 text-sm">ELO Rating</p>
          <p className="text-3xl font-bold">{parseFloat(player.eloRating).toFixed(0)}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-gray-600 text-sm">Win Rate</p>
          <p className="text-3xl font-bold text-green-600">{winRate}%</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <p className="text-gray-600 text-sm">Record</p>
          <p className="text-3xl font-bold">{player.wins}W–{player.losses}L</p>
        </div>
      </div>

      {/* ELO History Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-10">
        <h2 className="text-xl font-bold mb-4">📈 ELO Rating History</h2>
        {eloHistory.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={eloHistory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tickFormatter={(d) => new Date(d).toLocaleDateString()} />
              <YAxis domain={['dataMin - 50', 'dataMax + 50']} />
              <Tooltip
                labelFormatter={(d) => new Date(d).toLocaleDateString()}
                formatter={(value, name) => [value.toFixed(0), name === 'rating' ? 'ELO' : name]}
              />
              <Line type="monotone" dataKey="rating" stroke="#2563EB" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center py-8">No ELO history available yet.</p>
        )}
      </div>

      {/* Win/Loss Pie Chart and Opponent Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">🥧 Win / Loss Ratio</h2>
          {player.wins + player.losses > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No match data.</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">⚔️ Opponent Breakdown</h2>
          {opponentBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={opponentBreakdown.slice(0, 6)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="wins" fill="#10B981" name="Wins" />
                <Bar dataKey="losses" fill="#EF4444" name="Losses" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-8">No opponent data available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
