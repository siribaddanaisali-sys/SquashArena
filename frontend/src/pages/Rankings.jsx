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
        console.log('Rankings fetched:', data);
        setRankings(data || []);
      } catch (err) {
        console.error('Failed to fetch rankings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, [category]);

  if (loading) return <div className="text-center py-12 text-lg">Loading rankings...</div>;
  
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">📊 Squash Rankings</h1>
      
      <div className="flex gap-4 mb-8">
        {['world', 'regional', 'national'].map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              category === cat
                ? 'bg-squash-primary text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
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
            <thead className="bg-gradient-to-r from-squash-primary to-squash-secondary text-white">
              <tr>
                <th className="px-6 py-4 text-left font-bold">Rank</th>
                <th className="px-6 py-4 text-left font-bold">Player Name</th>
                <th className="px-6 py-4 text-left font-bold">Country</th>
                <th className="px-6 py-4 text-right font-bold">Points</th>
                <th className="px-6 py-4 text-center font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rankings.map((ranking) => (
                <tr key={ranking.id} className="border-t hover:bg-squash-light transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-squash-primary text-white rounded-full font-bold text-sm">
                      {ranking.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-semibold">
                    {ranking.Player?.User?.firstName} {ranking.Player?.User?.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{ranking.Player?.nationality || 'N/A'}</td>
                  <td className="px-6 py-4 text-right font-bold text-lg text-squash-secondary">
                    {ranking.points?.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      ranking.Player?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ranking.Player?.status?.toUpperCase()}
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
