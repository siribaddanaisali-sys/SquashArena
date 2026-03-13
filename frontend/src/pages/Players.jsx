import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
        console.log('Players API response:', data);
        
        // Ensure we have an array
        const playersList = Array.isArray(data) ? data : [];
        console.log('Setting players state with:', playersList);
        setPlayers(playersList);
      } catch (err) {
        console.error('Error fetching players:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  console.log('Players component render - loading:', loading, 'error:', error, 'players count:', players.length);

  if (loading) {
    return <div className="text-center py-12">Loading players...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">👥 Players Directory</h1>
      
      {players.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600">No players available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {players.map((player) => (
            <Link to={`/players/${player.id}`} key={player.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-2xl font-bold text-squash-primary">#{player.ranking || '-'}</div>
                <div>
                  <h3 className="text-lg font-bold">{player.User?.firstName || ''} {player.User?.lastName || 'Player'}</h3>
                  <p className="text-gray-600 text-sm">{player.nationality || ''}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">ELO Rating</p>
                    <p className="font-bold text-lg">{parseFloat(player.eloRating || 1500).toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Record</p>
                    <p className="font-bold">{player.wins || 0}W - {player.losses || 0}L</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Hand</p>
                    <p className="font-bold capitalize">{player.hand || 'right'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className={`font-bold text-xs px-2 py-1 rounded ${
                      player.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                    }`}>{player.status || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
