import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const data = await api.get('/players');
        console.log('Players fetched:', data);
        setPlayers(data || []);
      } catch (err) {
        console.error('Failed to fetch players:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (loading) return <div className="text-center py-12 text-lg">Loading players...</div>;
  
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;

  if (players.length === 0) {
    return (
      <div>
        <h1 className="text-4xl font-bold mb-8">👥 Players Directory</h1>
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600">No players available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">👥 Players Directory</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map(player => (
          <div key={player.id} className="card hover:shadow-lg transition">
            <div className="flex items-center mb-4 pb-4 border-b">
              <div className="w-14 h-14 bg-gradient-to-br from-squash-primary to-squash-secondary rounded-full mr-4 flex items-center justify-center text-white font-bold text-lg">
                #{player.ranking}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg">{player.User?.firstName} {player.User?.lastName}</h3>
                <p className="text-sm text-gray-600">{player.nationality || 'Player'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700"><strong>Points:</strong></span>
                <span className="text-squash-secondary font-bold">{player.points?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700"><strong>Record:</strong></span>
                <span className="text-sm font-semibold">{player.wins}W - {player.losses}L</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700"><strong>Hand:</strong></span>
                <span className="capitalize text-sm">{player.hand || 'Right'}</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-700"><strong>Status:</strong></span>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  player.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {player.status?.toUpperCase()}
                </span>
              </div>
            </div>
            {player.bio && <p className="text-sm text-gray-600 mt-4 italic">{player.bio}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
