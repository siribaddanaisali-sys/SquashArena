import React, { useState, useEffect } from 'react';

export default function Rankings() {
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch('/api/rankings/world');
        const data = await response.json();
        setRankings(data);
      } catch (error) {
        console.error('Failed to fetch rankings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
  }, []);

  if (loading) return <div className="text-center py-12">Loading rankings...</div>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">World Rankings</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-squash-primary text-white">
            <tr>
              <th className="px-6 py-3 text-left">Rank</th>
              <th className="px-6 py-3 text-left">Player</th>
              <th className="px-6 py-3 text-left">Country</th>
              <th className="px-6 py-3 text-right">Points</th>
            </tr>
          </thead>
          <tbody>
            {rankings.map((ranking, idx) => (
              <tr key={ranking.id} className="border-t hover:bg-squash-light">
                <td className="px-6 py-4 font-bold text-lg">{ranking.rank}</td>
                <td className="px-6 py-4">{ranking.Player?.User?.firstName} {ranking.Player?.User?.lastName}</td>
                <td className="px-6 py-4">{ranking.Player?.nationality || 'N/A'}</td>
                <td className="px-6 py-4 text-right font-bold">{ranking.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
