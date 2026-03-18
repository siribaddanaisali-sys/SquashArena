import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function CoachDetail() {
  const { id } = useParams();
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoach = async () => {
      try {
        setLoading(true);
        const data = await api.get(`/players/coaches/directory/${id}`);
        setCoach(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCoach();
  }, [id]);

  if (loading) return <div className="text-center py-12">Loading coach profile...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;
  if (!coach) return <div className="text-center py-12">Coach not found</div>;

  return (
    <div>
      <Link to="/coaches" className="text-squash-primary hover:underline text-sm font-semibold mb-4 inline-block">← Back to Coaches</Link>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow p-8 mb-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-squash-primary text-white flex items-center justify-center text-3xl font-bold flex-shrink-0">
            {coach.firstName?.charAt(0)}{coach.lastName?.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">{coach.firstName} {coach.lastName}</h1>
            <p className="text-gray-600 mt-1">{coach.country || 'Unknown Country'}</p>
            <div className="flex gap-3 mt-2">
              {coach.certification && (
                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">{coach.certification}</span>
              )}
              {coach.specialization && (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  coach.specialization === 'Technical' ? 'bg-blue-100 text-blue-800' :
                  coach.specialization === 'Fitness' ? 'bg-green-100 text-green-800' :
                  coach.specialization === 'Mental Game' ? 'bg-purple-100 text-purple-800' :
                  coach.specialization === 'All-Round' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>{coach.specialization}</span>
              )}
              <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                coach.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>{coach.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-2xl font-bold text-blue-600">{coach.experience || 0}</div>
          <p className="text-gray-500 text-sm">Years Experience</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-2xl font-bold text-purple-600">{coach.players?.length || 0}</div>
          <p className="text-gray-500 text-sm">Active Players</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <div className="text-2xl font-bold text-green-600">{coach.certification || 'N/A'}</div>
          <p className="text-gray-500 text-sm">Certification</p>
        </div>
      </div>

      {/* Bio */}
      {coach.bio && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-3">About</h2>
          <p className="text-gray-700">{coach.bio}</p>
        </div>
      )}

      {/* Players */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Active Players</h2>
        {coach.players?.length > 0 ? (
          <div className="divide-y">
            {coach.players.map(p => (
              <Link key={p.id} to={`/players/${p.id}`} className="py-3 flex items-center justify-between hover:bg-gray-50 -mx-4 px-4 rounded">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-500">Rank #{p.ranking || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-squash-primary">{parseFloat(p.eloRating || 1500).toFixed(0)}</p>
                  <p className="text-xs text-gray-500">ELO</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No active players currently assigned.</p>
        )}
      </div>
    </div>
  );
}
