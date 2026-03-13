import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminPanel() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [players, setPlayers] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Discipline form
  const [showDisciplineForm, setShowDisciplineForm] = useState(false);
  const [disciplineForm, setDisciplineForm] = useState({ playerId: '', type: 'warning', reason: '', endDate: '' });

  useEffect(() => {
    fetchTabData();
  }, [tab]);

  const fetchTabData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (tab === 'overview') {
        const data = await api.get('/admin/stats');
        setStats(data);
      } else if (tab === 'users') {
        const data = await api.get('/admin/users');
        setUsers(Array.isArray(data) ? data : []);
      } else if (tab === 'players') {
        const data = await api.get('/admin/players');
        setPlayers(Array.isArray(data) ? data : []);
      } else if (tab === 'tournaments') {
        const data = await api.get('/admin/tournaments');
        setTournaments(Array.isArray(data) ? data : []);
      } else if (tab === 'discipline') {
        const data = await api.get('/disciplines');
        setDisciplines(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      fetchTabData();
    } catch (err) {
      setError(err.message);
    }
  };

  const updatePlayerStatus = async (playerId, status) => {
    try {
      await api.put(`/admin/players/${playerId}/status`, { status });
      fetchTabData();
    } catch (err) {
      setError(err.message);
    }
  };

  const issueDiscipline = async (e) => {
    e.preventDefault();
    try {
      await api.post('/disciplines', {
        ...disciplineForm,
        endDate: disciplineForm.endDate || null,
      });
      setShowDisciplineForm(false);
      setDisciplineForm({ playerId: '', type: 'warning', reason: '', endDate: '' });
      fetchTabData();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateDisciplineStatus = async (id, status) => {
    try {
      await api.put(`/disciplines/${id}`, { status });
      fetchTabData();
    } catch (err) {
      setError(err.message);
    }
  };

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'users', label: '👥 Users' },
    { key: 'players', label: '🏸 Players' },
    { key: 'tournaments', label: '🏆 Tournaments' },
    { key: 'discipline', label: '⚖️ Discipline' },
  ];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">🛡️ Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg font-medium transition ${tab === t.key ? 'bg-squash-primary text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      {loading && <div className="text-center py-8">Loading...</div>}

      {/* Overview Tab */}
      {!loading && tab === 'overview' && stats && (
        <div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
              { label: 'Players', value: stats.totalPlayers, icon: '🏸' },
              { label: 'Coaches', value: stats.totalCoaches, icon: '🎓' },
              { label: 'Tournaments', value: stats.totalTournaments, icon: '🏆' },
              { label: 'Matches', value: stats.totalMatches, icon: '🎯' },
              { label: 'Venues', value: stats.totalVenues, icon: '🏟️' },
              { label: 'Clubs', value: stats.totalClubs, icon: '🏠' },
              { label: 'Active Disciplines', value: stats.activeDisciplines, icon: '⚖️' },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-lg shadow p-4 text-center">
                <p className="text-2xl mb-1">{s.icon}</p>
                <p className="text-3xl font-bold">{s.value}</p>
                <p className="text-gray-600 text-sm">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">Users by Role</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.usersByRole?.map(r => (
                <div key={r.role} className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-bold text-2xl">{r.count || r.dataValues?.count}</p>
                  <p className="text-gray-600 capitalize">{r.role}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {!loading && tab === 'users' && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                {user?.role === 'regulator' && <th className="p-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{u.firstName} {u.lastName}</td>
                  <td className="p-3 text-gray-600">{u.email}</td>
                  <td className="p-3 capitalize">{u.role}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {user?.role === 'regulator' && (
                    <td className="p-3">
                      <button onClick={() => toggleUserStatus(u.id)} className="text-sm text-squash-primary hover:underline">
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Players Tab */}
      {!loading && tab === 'players' && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Name</th>
                <th className="p-3">Nationality</th>
                <th className="p-3">ELO</th>
                <th className="p-3">Status</th>
                {user?.role === 'regulator' && <th className="p-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {players.map(p => (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-bold">#{p.ranking || '-'}</td>
                  <td className="p-3">{p.User?.firstName} {p.User?.lastName}</td>
                  <td className="p-3">{p.nationality || '-'}</td>
                  <td className="p-3">{parseFloat(p.eloRating).toFixed(0)}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded ${p.status === 'active' ? 'bg-green-100 text-green-800' : p.status === 'inactive' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100'}`}>
                      {p.status}
                    </span>
                  </td>
                  {user?.role === 'regulator' && (
                    <td className="p-3">
                      <select
                        value={p.status}
                        onChange={(e) => updatePlayerStatus(p.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="retired">Retired</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tournaments Tab */}
      {!loading && tab === 'tournaments' && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">Tournament</th>
                <th className="p-3">Location</th>
                <th className="p-3">Dates</th>
                <th className="p-3">Organizer</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {tournaments.map(t => (
                <tr key={t.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{t.name}</td>
                  <td className="p-3">{t.location}</td>
                  <td className="p-3 text-sm">{new Date(t.startDate).toLocaleDateString()} — {new Date(t.endDate).toLocaleDateString()}</td>
                  <td className="p-3">{t.organizer?.firstName} {t.organizer?.lastName}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded ${t.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : t.status === 'ongoing' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Discipline Tab */}
      {!loading && tab === 'discipline' && (
        <div>
          {user?.role === 'regulator' && (
            <div className="mb-6">
              <button onClick={() => setShowDisciplineForm(!showDisciplineForm)} className="btn-primary">
                {showDisciplineForm ? 'Cancel' : '+ Issue Discipline Action'}
              </button>

              {showDisciplineForm && (
                <form onSubmit={issueDiscipline} className="bg-white rounded-lg shadow p-6 mt-4">
                  <h2 className="text-xl font-bold mb-4">Issue Discipline Action</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select className="input-field" value={disciplineForm.playerId} onChange={e => setDisciplineForm({ ...disciplineForm, playerId: e.target.value })} required>
                      <option value="">Select Player...</option>
                      {players.length === 0 && <option disabled>Load Players tab first</option>}
                      {players.map(p => (
                        <option key={p.id} value={p.id}>{p.User?.firstName} {p.User?.lastName}</option>
                      ))}
                    </select>
                    <select className="input-field" value={disciplineForm.type} onChange={e => setDisciplineForm({ ...disciplineForm, type: e.target.value })}>
                      <option value="warning">Warning</option>
                      <option value="yellow_card">Yellow Card</option>
                      <option value="red_card">Red Card</option>
                      <option value="suspension">Suspension</option>
                      <option value="ban">Ban</option>
                    </select>
                    <input className="input-field" placeholder="Reason *" value={disciplineForm.reason} onChange={e => setDisciplineForm({ ...disciplineForm, reason: e.target.value })} required />
                    <input className="input-field" type="date" placeholder="End Date" value={disciplineForm.endDate} onChange={e => setDisciplineForm({ ...disciplineForm, endDate: e.target.value })} />
                  </div>
                  <button type="submit" className="btn-primary mt-4">Issue Action</button>
                </form>
              )}
            </div>
          )}

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3">Player</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Reason</th>
                  <th className="p-3">Issued By</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  {user?.role === 'regulator' && <th className="p-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {disciplines.map(d => (
                  <tr key={d.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">{d.player?.User?.firstName} {d.player?.User?.lastName}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        d.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        d.type === 'yellow_card' ? 'bg-yellow-200 text-yellow-900' :
                        d.type === 'red_card' ? 'bg-red-100 text-red-800' :
                        d.type === 'suspension' ? 'bg-orange-100 text-orange-800' :
                        'bg-red-200 text-red-900'
                      }`}>
                        {d.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-sm">{d.reason}</td>
                    <td className="p-3">{d.issuer?.firstName} {d.issuer?.lastName}</td>
                    <td className="p-3 text-sm">{new Date(d.createdAt).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        d.status === 'active' ? 'bg-red-100 text-red-800' :
                        d.status === 'expired' ? 'bg-gray-100 text-gray-800' :
                        d.status === 'appealed' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    {user?.role === 'regulator' && (
                      <td className="p-3">
                        <select
                          value={d.status}
                          onChange={(e) => updateDisciplineStatus(d.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1"
                        >
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                          <option value="appealed">Appealed</option>
                          <option value="overturned">Overturned</option>
                        </select>
                      </td>
                    )}
                  </tr>
                ))}
                {disciplines.length === 0 && (
                  <tr><td colSpan="7" className="p-6 text-center text-gray-500">No discipline records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
