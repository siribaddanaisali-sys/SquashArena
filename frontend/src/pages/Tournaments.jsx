import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        setLoading(true);
        const data = await api.get('/tournaments');
        setTournaments(data || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  const filtered = useMemo(() => {
    let result = [...tournaments];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => t.name?.toLowerCase().includes(q) || t.location?.toLowerCase().includes(q));
    }
    if (filterStatus) result = result.filter(t => t.status === filterStatus);
    if (filterCategory) result = result.filter(t => t.category === filterCategory);
    return result;
  }, [tournaments, search, filterStatus, filterCategory]);

  if (loading) return <div className="text-center py-12 text-lg">Loading tournaments...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryBadge = (category) => {
    const badges = {
      professional: '🏆',
      amateur: '⚽',
      junior: '👶',
      masters: '👴',
    };
    return badges[category] || '🎯';
  };

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">🏅 Tournaments</h1>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="input-field" placeholder="🔍 Search by name or location..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="input-field" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
          <select className="input-field" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
            <option value="">All Categories</option>
            <option value="professional">Professional</option>
            <option value="amateur">Amateur</option>
            <option value="junior">Junior</option>
          </select>
        </div>
        <p className="text-gray-500 text-sm mt-2">{filtered.length} of {tournaments.length} tournaments</p>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600">No tournaments match your filters.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 gap-6">
        {filtered.map(tournament => (
          <Link to={`/tournaments/${tournament.id}`} key={tournament.id} className="card border-l-4 border-squash-primary hover:shadow-lg transition block">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{getCategoryBadge(tournament.category)}</span>
                  <h2 className="text-3xl font-bold">{tournament.name}</h2>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(tournament.status)}`}>
                    {tournament.status?.charAt(0).toUpperCase() + tournament.status?.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 mt-2 mb-4">{tournament.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong className="text-gray-700">Category:</strong>
                    <span className="ml-2 capitalize">{tournament.category}</span>
                  </div>
                  <div>
                    <strong className="text-gray-700">Location:</strong>
                    <span className="ml-2">📍 {tournament.location}</span>
                  </div>
                  <div>
                    <strong className="text-gray-700">Start Date:</strong>
                    <span className="ml-2">{new Date(tournament.startDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <strong className="text-gray-700">End Date:</strong>
                    <span className="ml-2">{new Date(tournament.endDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="text-right ml-6">
                <div className="bg-squash-primary bg-opacity-10 rounded-lg p-4">
                  <p className="text-4xl font-bold text-squash-primary">{tournament.registeredParticipants}</p>
                  <p className="text-sm text-gray-600">of {tournament.maxParticipants} Participants</p>
                  <div className="mt-3 w-full bg-gray-300 rounded-full h-2">
                    <div 
                      className="bg-squash-secondary h-2 rounded-full" 
                      style={{ width: `${(tournament.registeredParticipants / tournament.maxParticipants) * 100}%` }}
                    ></div>
                  </div>
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
