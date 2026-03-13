import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

const COURT_TYPE_LABELS = {
  glass_show_court: 'Glass Show Court (All-Glass)',
  glass_back_wall: 'Glass Back Wall Court',
  traditional: 'Traditional Court',
};

const COURT_TYPE_COLORS = {
  glass_show_court: 'bg-blue-100 text-blue-800',
  glass_back_wall: 'bg-purple-100 text-purple-800',
  traditional: 'bg-gray-100 text-gray-700',
};

export default function Venues() {
  const { user } = useAuth();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
  const [expandedVenue, setExpandedVenue] = useState(null);
  const [form, setForm] = useState({ name: '', city: '', country: '', address: '', numCourts: 1, contactPhone: '', contactEmail: '' });

  const canManage = user && (user.role === 'organiser' || user.role === 'regulator');

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const data = await api.get('/venues');
      setVenues(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Group venues by country
  const venuesByCountry = useMemo(() => {
    const grouped = {};
    venues.forEach(venue => {
      const country = venue.country || 'Unknown';
      if (!grouped[country]) grouped[country] = [];
      grouped[country].push(venue);
    });
    // Sort countries alphabetically
    return Object.keys(grouped).sort().reduce((acc, key) => {
      acc[key] = grouped[key];
      return acc;
    }, {});
  }, [venues]);

  const getCourtSummary = (courts) => {
    if (!courts || courts.length === 0) return null;
    const counts = {};
    courts.forEach(c => {
      const type = c.courtType || 'traditional';
      counts[type] = (counts[type] || 0) + 1;
    });
    return counts;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVenue) {
        await api.put(`/venues/${editingVenue.id}`, form);
      } else {
        await api.post('/venues', form);
      }
      setShowForm(false);
      setEditingVenue(null);
      setForm({ name: '', city: '', country: '', address: '', numCourts: 1, contactPhone: '', contactEmail: '' });
      fetchVenues();
    } catch (err) {
      setError(err.message);
    }
  };

  const startEdit = (venue) => {
    setEditingVenue(venue);
    setForm({
      name: venue.name,
      city: venue.city,
      country: venue.country,
      address: venue.address || '',
      numCourts: venue.numCourts,
      contactPhone: venue.contactPhone || '',
      contactEmail: venue.contactEmail || '',
    });
    setShowForm(true);
  };

  if (loading) return <div className="text-center py-12">Loading venues...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">🏟️ Venues & Courts</h1>
          <p className="text-gray-500 mt-1">{venues.length} venues across {Object.keys(venuesByCountry).length} countries</p>
        </div>
        {canManage && (
          <button
            onClick={() => { setShowForm(!showForm); setEditingVenue(null); setForm({ name: '', city: '', country: '', address: '', numCourts: 1, contactPhone: '', contactEmail: '' }); }}
            className="btn-primary"
          >
            {showForm ? 'Cancel' : '+ Add Venue'}
          </button>
        )}
      </div>

      {showForm && canManage && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">{editingVenue ? 'Edit Venue' : 'Add New Venue'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className="input-field" placeholder="Venue Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            <input className="input-field" placeholder="City *" value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} required />
            <input className="input-field" placeholder="Country *" value={form.country} onChange={e => setForm({ ...form, country: e.target.value })} required />
            <input className="input-field" placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />
            <input className="input-field" type="number" min="1" placeholder="Number of Courts" value={form.numCourts} onChange={e => setForm({ ...form, numCourts: parseInt(e.target.value) || 1 })} />
            <input className="input-field" placeholder="Contact Phone" value={form.contactPhone} onChange={e => setForm({ ...form, contactPhone: e.target.value })} />
            <input className="input-field" placeholder="Contact Email" type="email" value={form.contactEmail} onChange={e => setForm({ ...form, contactEmail: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary mt-4">{editingVenue ? 'Update Venue' : 'Create Venue'}</button>
        </form>
      )}

      {venues.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600">No venues available.</p>
        </div>
      ) : (
        Object.entries(venuesByCountry).map(([country, countryVenues]) => (
          <div key={country} className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-2xl font-bold text-squash-dark">🌍 {country}</h2>
              <span className="bg-squash-primary/10 text-squash-primary text-sm font-medium px-3 py-1 rounded-full">
                {countryVenues.length} venue{countryVenues.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {countryVenues.map(venue => {
                const courtSummary = getCourtSummary(venue.Courts);
                const isExpanded = expandedVenue === venue.id;

                return (
                  <div key={venue.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold">{venue.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded ${venue.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {venue.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-1">📍 {venue.city}, {venue.country}</p>
                    {venue.address && <p className="text-gray-500 text-sm mb-2">{venue.address}</p>}

                    {/* Court type summary */}
                    <div className="border-t pt-3 mt-3">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Courts ({venue.numCourts})</p>
                      {courtSummary ? (
                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {Object.entries(courtSummary).map(([type, count]) => (
                            <span key={type} className={`text-xs px-2 py-1 rounded-full font-medium ${COURT_TYPE_COLORS[type] || 'bg-gray-100 text-gray-700'}`}>
                              {count}x {COURT_TYPE_LABELS[type] || type}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 mb-3">No court details</p>
                      )}

                      {/* Expand/collapse individual courts */}
                      {venue.Courts && venue.Courts.length > 0 && (
                        <button
                          onClick={() => setExpandedVenue(isExpanded ? null : venue.id)}
                          className="text-xs text-squash-primary hover:underline mb-2"
                        >
                          {isExpanded ? '▲ Hide courts' : '▼ Show all courts'}
                        </button>
                      )}

                      {isExpanded && venue.Courts && (
                        <div className="mt-2 space-y-1">
                          {venue.Courts.sort((a, b) => a.courtNumber - b.courtNumber).map(court => (
                            <div key={court.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-1.5 text-sm">
                              <span className="font-medium">{court.courtName || `Court ${court.courtNumber}`}</span>
                              <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${COURT_TYPE_COLORS[court.courtType] || 'bg-gray-100 text-gray-700'}`}>
                                  {COURT_TYPE_LABELS[court.courtType] || 'Traditional'}
                                </span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${court.status === 'available' ? 'bg-green-100 text-green-700' : court.status === 'occupied' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                  {court.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                        <div>
                          <p className="text-gray-600">Contact</p>
                          <p className="text-sm">{venue.contactPhone || venue.contactEmail || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                    {canManage && (
                      <button onClick={() => startEdit(venue)} className="mt-3 text-sm text-squash-primary hover:underline">
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
