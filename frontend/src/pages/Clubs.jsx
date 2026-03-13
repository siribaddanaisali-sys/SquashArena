import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function Clubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async (searchTerm = '') => {
    try {
      setLoading(true);
      const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : '';
      const data = await api.get(`/clubs${query}`);
      setClubs(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchClubs(search);
  };

  if (loading && clubs.length === 0) return <div className="text-center py-12 text-lg">Loading clubs...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Clubs</h1>
          <p className="text-gray-600 mt-1">Find and join squash clubs worldwide</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search clubs by name, city, or country..."
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-squash-primary"
          />
          <button type="submit" className="bg-squash-primary text-white px-6 py-2 rounded-lg hover:opacity-90 font-semibold">
            Search
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); fetchClubs(); }}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
              Clear
            </button>
          )}
        </div>
      </form>

      {/* Results */}
      {clubs.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <div className="text-6xl mb-4">🏢</div>
          <p className="text-xl">No clubs found</p>
          <p className="text-sm mt-2">Try adjusting your search or create a new club</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map(club => (
            <Link key={club.id} to={`/clubs/${club.id}`}
              className="card hover:shadow-lg transition-shadow group">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-14 h-14 bg-squash-primary bg-opacity-10 rounded-lg flex items-center justify-center text-2xl font-bold text-squash-primary">
                  {club.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold group-hover:text-squash-primary transition-colors">{club.name}</h3>
                  <p className="text-sm text-gray-500">{club.city}, {club.country}</p>
                </div>
              </div>
              {club.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{club.description}</p>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">👥 {club.memberCount} members</span>
                {club.foundedYear && <span className="text-gray-400">Est. {club.foundedYear}</span>}
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  club.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>{club.status}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
