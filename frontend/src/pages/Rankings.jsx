import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';

export default function Rankings() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [category, setCategory] = useState('world');

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/rankings/${category}`);
        console.log('Rankings API response:', data);
        
        // Ensure we have an array
        const rankingsList = Array.isArray(data) ? data : [];
        console.log('Setting rankings state with:', rankingsList);
        setRankings(rankingsList);
      } catch (err) {
        console.error('Error fetching rankings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [category]);

  console.log('Rankings component render - loading:', loading, 'error:', error, 'rankings count:', rankings.length);

  if (loading) {
    return <div className="text-center py-12">Loading rankings...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">Error: {error}</div>;
  }

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">📊 Squash Rankings</h1>
      
      <div className="flex gap-4 mb-8">
        {['world', 'regional', 'national'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-6 py-2 rounded-lg font-semibold ${
              category === cat
                ? 'bg-squash-primary text-white'
                : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {rankings.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600">No rankings available.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-squash-primary text-white">
              <tr>
                <th className="px-6 py-3 text-left">Rank</th>
                <th className="px-6 py-3 text-left">Player Name</th>
                <th className="px-6 py-3 text-left">Country</th>
                <th className="px-6 py-3 text-right">Points</th>
                <th className="px-6 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((ranking) => (
                <tr key={ranking.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3 font-bold text-squash-primary">{ranking.rank}</td>
                  <td className="px-6 py-3 font-semibold">
                    {ranking.Player?.User?.firstName || ''} {ranking.Player?.User?.lastName || 'Unknown'}
                  </td>
                  <td className="px-6 py-3">{ranking.Player?.nationality || 'N/A'}</td>
                  <td className="px-6 py-3 text-right font-bold">{parseFloat(ranking.points || 0).toFixed(2)}</td>
                  <td className="px-6 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded ${
                      ranking.Player?.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ranking.Player?.status || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
