import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function Coaches() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterSpecialization, setFilterSpecialization] = useState('');
  const [filterCertification, setFilterCertification] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        setLoading(true);
        const data = await api.get('/players/coaches/directory');
        setCoaches(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCoaches();
  }, []);

  const specializations = useMemo(() => {
    const set = new Set(coaches.map(c => c.specialization).filter(Boolean));
    return [...set].sort();
  }, [coaches]);

  const certifications = useMemo(() => {
    const set = new Set(coaches.map(c => c.certification).filter(Boolean));
    return [...set].sort();
  }, [coaches]);

  const filteredCoaches = useMemo(() => {
    let result = [...coaches];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(c =>
        c.firstName?.toLowerCase().includes(q) ||
        c.lastName?.toLowerCase().includes(q) ||
        c.country?.toLowerCase().includes(q)
      );
    }
    if (filterSpecialization) result = result.filter(c => c.specialization === filterSpecialization);
    if (filterCertification) result = result.filter(c => c.certification === filterCertification);

    result.sort((a, b) => {
      if (sortBy === 'name') return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
      if (sortBy === 'experience') return (b.experience || 0) - (a.experience || 0);
      if (sortBy === 'players') return (b.activePlayers || 0) - (a.activePlayers || 0);
      return 0;
    });

    return result;
  }, [coaches, search, filterSpecialization, filterCertification, sortBy]);

  if (loading) return <div className="text-center py-12">Loading coaches...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">🎓 Coaches Directory</h1>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            className="input-field"
            placeholder="🔍 Search by name or country..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="input-field" value={filterSpecialization} onChange={e => setFilterSpecialization(e.target.value)}>
            <option value="">All Specializations</option>
            {specializations.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="input-field" value={filterCertification} onChange={e => setFilterCertification(e.target.value)}>
            <option value="">All Certifications</option>
            {certifications.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input-field" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="name">Sort: Name</option>
            <option value="experience">Sort: Experience</option>
            <option value="players">Sort: Active Players</option>
          </select>
        </div>
        <p className="text-gray-500 text-sm mt-2">{filteredCoaches.length} of {coaches.length} coaches</p>
      </div>

      {filteredCoaches.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600">No coaches match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCoaches.map(coach => (
            <Link to={`/coaches/${coach.id}`} key={coach.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-full bg-squash-primary text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                  {coach.firstName?.charAt(0)}{coach.lastName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{coach.firstName} {coach.lastName}</h3>
                  <p className="text-gray-600 text-sm">{coach.country || 'Unknown Country'}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Certification</p>
                    <p className="font-bold">{coach.certification || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Experience</p>
                    <p className="font-bold">{coach.experience || 0} years</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Specialization</p>
                    <span className={`inline-block font-bold text-xs px-2 py-1 rounded ${
                      coach.specialization === 'Technical' ? 'bg-blue-100 text-blue-800' :
                      coach.specialization === 'Fitness' ? 'bg-green-100 text-green-800' :
                      coach.specialization === 'Mental Game' ? 'bg-purple-100 text-purple-800' :
                      coach.specialization === 'All-Round' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>{coach.specialization || 'N/A'}</span>
                  </div>
                  <div>
                    <p className="text-gray-600">Active Players</p>
                    <p className="font-bold">{coach.activePlayers}</p>
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
