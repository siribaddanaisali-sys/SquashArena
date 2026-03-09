import React, { useState, useEffect } from 'react';

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await fetch('/api/players');
        const data = await response.json();
        setPlayers(data);
      } catch (error) {
        console.error('Failed to fetch players:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  if (loading) return <div className="text-center py-12">Loading players...</div>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Players Directory</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {players.map(player => (
          <div key={player.id} className="card">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-squash-primary rounded-full mr-4"></div>
              <div>
                <h3 className="font-bold">{player.User?.firstName} {player.User?.lastName}</h3>
                <p className="text-sm text-gray-600">Rank: #{player.ranking}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Points:</strong> {player.points}</p>
              <p><strong>Wins:</strong> {player.wins} | <strong>Losses:</strong> {player.losses}</p>
              <p><strong>Status:</strong> <span className="text-squash-primary">{player.status}</span></p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
