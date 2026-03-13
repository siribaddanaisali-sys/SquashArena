import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Venues() {
  const { user } = useAuth();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVenue, setEditingVenue] = useState(null);
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
        <h1 className="text-4xl font-bold">🏟️ Venues & Courts</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map(venue => (
            <div key={venue.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold">{venue.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${venue.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {venue.status}
                </span>
              </div>
              <p className="text-gray-600 mb-1">📍 {venue.city}, {venue.country}</p>
              {venue.address && <p className="text-gray-500 text-sm mb-2">{venue.address}</p>}
              <div className="border-t pt-3 mt-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-600">Courts</p>
                    <p className="font-bold text-lg">{venue.numCourts}</p>
                  </div>
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
          ))}
        </div>
      )}
    </div>
  );
}
