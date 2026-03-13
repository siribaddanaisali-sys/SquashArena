import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function HeadToHead() {
  const [players, setPlayers] = useState([]);
  const [player1Id, setPlayer1Id] = useState('');
  const [player2Id, setPlayer2Id] = useState('');
  const [h2hData, setH2hData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [playersLoading, setPlayersLoading] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const data = await api.get('/players');
        setPlayers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Failed to load players:', err);
      } finally {
        setPlayersLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const handleCompare = async () => {
    if (!player1Id || !player2Id || player1Id === player2Id) {
      alert('Please select two different players');
      return;
    }
    setLoading(true);
    try {
      const data = await api.get(`/matches/head-to-head/${player1Id}/${player2Id}`);
      setH2hData(data);
    } catch (err) {
      alert('Failed to load head-to-head data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">🥊 Head-to-Head</h1>
      <p className="text-gray-600 mb-8">Compare two players' records against each other</p>

      {/* Player Selection */}
      <div className="card mb-8">
        <div className="flex flex-col md:flex-row items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Player 1</label>
            <select value={player1Id} onChange={e => setPlayer1Id(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-squash-primary">
              <option value="">Select Player</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>
                  {p.User?.firstName} {p.User?.lastName} {p.ranking ? `(#${p.ranking})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div className="text-2xl font-bold text-gray-400 pb-2">VS</div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Player 2</label>
            <select value={player2Id} onChange={e => setPlayer2Id(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-squash-primary">
              <option value="">Select Player</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>
                  {p.User?.firstName} {p.User?.lastName} {p.ranking ? `(#${p.ranking})` : ''}
                </option>
              ))}
            </select>
          </div>
          <button onClick={handleCompare} disabled={loading || !player1Id || !player2Id}
            className="bg-squash-primary text-white px-8 py-2 rounded-lg hover:opacity-90 disabled:opacity-50 font-semibold">
            {loading ? 'Loading...' : 'Compare'}
          </button>
        </div>
      </div>

      {/* Results */}
      {h2hData && (
        <div>
          {/* Score Summary */}
          <div className="card mb-6">
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <Link to={`/players/${h2hData.player1.id}`} className="text-2xl font-bold text-squash-primary hover:underline">
                  {h2hData.player1.name}
                </Link>
                <p className="text-gray-500 text-sm">
                  Rank #{h2hData.player1.ranking || 'N/A'} · ELO {parseFloat(h2hData.player1.eloRating || 1500).toFixed(0)}
                </p>
              </div>
              <div className="text-center px-8">
                <div className="flex items-center gap-4">
                  <span className={`text-5xl font-bold ${h2hData.player1.wins > h2hData.player2.wins ? 'text-green-600' : 'text-gray-400'}`}>
                    {h2hData.player1.wins}
                  </span>
                  <span className="text-2xl text-gray-300">-</span>
                  <span className={`text-5xl font-bold ${h2hData.player2.wins > h2hData.player1.wins ? 'text-green-600' : 'text-gray-400'}`}>
                    {h2hData.player2.wins}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">{h2hData.totalMatches} matches played</p>
              </div>
              <div className="text-center flex-1">
                <Link to={`/players/${h2hData.player2.id}`} className="text-2xl font-bold text-squash-primary hover:underline">
                  {h2hData.player2.name}
                </Link>
                <p className="text-gray-500 text-sm">
                  Rank #{h2hData.player2.ranking || 'N/A'} · ELO {parseFloat(h2hData.player2.eloRating || 1500).toFixed(0)}
                </p>
              </div>
            </div>

            {/* Win % Bar */}
            {h2hData.totalMatches > 0 && (
              <div className="mt-6">
                <div className="flex h-6 rounded-full overflow-hidden">
                  <div className="bg-blue-500 flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${(h2hData.player1.wins / h2hData.totalMatches) * 100}%` }}>
                    {Math.round((h2hData.player1.wins / h2hData.totalMatches) * 100)}%
                  </div>
                  <div className="bg-red-500 flex items-center justify-center text-white text-xs font-bold"
                    style={{ width: `${(h2hData.player2.wins / h2hData.totalMatches) * 100}%` }}>
                    {Math.round((h2hData.player2.wins / h2hData.totalMatches) * 100)}%
                  </div>
                </div>
              </div>
            )}

            {/* Games comparison */}
            <div className="grid grid-cols-3 gap-4 mt-6 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-600">{h2hData.player1.gamesWon}</p>
                <p className="text-sm text-gray-500">Games Won</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-400">Games</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-600">{h2hData.player2.gamesWon}</p>
                <p className="text-sm text-gray-500">Games Won</p>
              </div>
            </div>
          </div>

          {/* Match List */}
          {h2hData.matches && h2hData.matches.length > 0 && (
            <div className="card">
              <h3 className="text-xl font-bold mb-4">Match History</h3>
              <div className="space-y-3">
                {h2hData.matches.map(match => {
                  const p1IsFirst = match.player1Id === h2hData.player1.id;
                  return (
                    <div key={match.id} className="flex justify-between items-center p-3 rounded-lg bg-gray-50 border">
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          match.winnerId === h2hData.player1.id ? 'bg-blue-500' : 'bg-red-500'
                        }`}>
                          {match.winnerId === h2hData.player1.id ? 'P1' : 'P2'}
                        </span>
                        <span className="font-semibold">
                          {match.winnerId === h2hData.player1.id ? h2hData.player1.name : h2hData.player2.name} won
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {match.score?.games?.map(g => p1IsFirst ? `${g[0]}-${g[1]}` : `${g[1]}-${g[0]}`).join(', ')}
                      </div>
                      <div className="text-sm text-gray-400">
                        {new Date(match.scheduledTime).toLocaleDateString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {h2hData.totalMatches === 0 && (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg">These players have not played against each other yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
