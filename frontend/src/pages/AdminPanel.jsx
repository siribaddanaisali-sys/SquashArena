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
  const [approvals, setApprovals] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditTotal, setAuditTotal] = useState(0);
  const [regions, setRegions] = useState([]);
  const [pendingTransfer, setPendingTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Discipline form
  const [showDisciplineForm, setShowDisciplineForm] = useState(false);
  const [disciplineForm, setDisciplineForm] = useState({ playerId: '', type: 'warning', reason: '', endDate: '' });

  // Transfer form
  const [transferTarget, setTransferTarget] = useState('');
  const [transferData, setTransferData] = useState(null);
  const [confirmPassword, setConfirmPassword] = useState('');

  // Promote form
  const [promoteRegion, setPromoteRegion] = useState('');

  useEffect(() => {
    fetchTabData();
  }, [tab]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const fetchTabData = async () => {
    try {
      setLoading(true);
      setError(null);
      if (tab === 'overview') {
        const data = await api.get('/admin/stats');
        setStats(data);
      } else if (tab === 'users' || tab === 'roles') {
        const data = await api.get('/admin/users');
        setUsers(Array.isArray(data) ? data : []);
        if (user?.role === 'super_admin') {
          try {
            const r = await api.get('/admin/regions');
            setRegions(Array.isArray(r) ? r : []);
          } catch {}
        }
      } else if (tab === 'players') {
        const data = await api.get('/admin/players');
        setPlayers(Array.isArray(data) ? data : []);
      } else if (tab === 'tournaments') {
        const data = await api.get('/admin/tournaments');
        setTournaments(Array.isArray(data) ? data : []);
      } else if (tab === 'discipline') {
        const data = await api.get('/disciplines');
        setDisciplines(Array.isArray(data) ? data : []);
      } else if (tab === 'approvals') {
        const data = await api.get('/admin/approvals');
        setApprovals(Array.isArray(data) ? data : []);
      } else if (tab === 'audit') {
        const data = await api.get('/admin/audit-logs');
        setAuditLogs(data.logs || []);
        setAuditTotal(data.total || 0);
      } else if (tab === 'transfer') {
        const data = await api.get('/admin/transfer/pending');
        setPendingTransfer(data.transfer);
        const u = await api.get('/admin/users');
        setUsers(Array.isArray(u) ? u : []);
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
      setSuccess('User status toggled');
      fetchTabData();
    } catch (err) {
      setError(err.message);
    }
  };

  const updatePlayerStatus = async (playerId, status) => {
    try {
      await api.put(`/admin/players/${playerId}/status`, { status });
      setSuccess('Player status updated');
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
      setSuccess('Discipline action issued');
      fetchTabData();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateDisciplineStatus = async (id, status) => {
    try {
      await api.put(`/disciplines/${id}`, { status });
      setSuccess('Discipline status updated');
      fetchTabData();
    } catch (err) {
      setError(err.message);
    }
  };

  // ======= ROLE MANAGEMENT =======
  const promoteUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/promote`, { regionId: promoteRegion || undefined });
      setSuccess('User promoted to Admin');
      setPromoteRegion('');
      fetchTabData();
    } catch (err) {
      setError(err.message);
    }
  };

  const demoteUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/demote`);
      setSuccess('Admin demoted to Organiser');
      fetchTabData();
    } catch (err) {
      setError(err.message);
    }
  };

  // ======= APPROVAL WORKFLOW =======
  const approveRequest = async (id) => {
    try {
      await api.put(`/admin/approvals/${id}/approve`, {});
      setSuccess('Request approved and executed');
      fetchTabData();
    } catch (err) {
      setError(err.message);
    }
  };

  const rejectRequest = async (id, note) => {
    try {
      await api.put(`/admin/approvals/${id}/reject`, { note: note || 'Rejected by SuperAdmin' });
      setSuccess('Request rejected');
      fetchTabData();
    } catch (err) {
      setError(err.message);
    }
  };

  // ======= AUDIT LOG ROLLBACK =======
  const rollbackAction = async (logId) => {
    if (!window.confirm('Are you sure you want to rollback this action? This will restore the previous state.')) return;
    try {
      const result = await api.post(`/admin/audit-logs/${logId}/rollback`);
      setSuccess(result.message || 'Rollback successful');
      fetchTabData();
    } catch (err) {
      setError(err.message);
    }
  };

  // ======= SUPERADMIN TRANSFER =======
  const initiateTransfer = async () => {
    if (!transferTarget) return setError('Select a user to transfer to');
    try {
      const data = await api.post('/admin/transfer/initiate', { toUserId: transferTarget });
      setTransferData(data);
      setSuccess('Transfer initiated — confirm with your password');
      fetchTabData();
    } catch (err) {
      setError(err.message);
    }
  };

  const confirmTransfer = async () => {
    if (!confirmPassword) return setError('Password is required');
    try {
      const data = await api.post('/admin/transfer/confirm', {
        transferId: transferData.transferId,
        confirmationToken: transferData.confirmationToken,
        password: confirmPassword,
      });
      setSuccess(data.message);
      setTransferData(null);
      setConfirmPassword('');
      fetchTabData();
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelTransfer = async () => {
    try {
      await api.post('/admin/transfer/cancel');
      setSuccess('Transfer cancelled');
      setPendingTransfer(null);
      setTransferData(null);
      fetchTabData();
    } catch (err) {
      setError(err.message);
    }
  };

  const isSuperAdmin = user?.role === 'super_admin';

  const tabs = [
    { key: 'overview', label: '📊 Overview' },
    { key: 'users', label: '👥 Users' },
    { key: 'players', label: '🏸 Players' },
    { key: 'tournaments', label: '🏆 Tournaments' },
    { key: 'discipline', label: '⚖️ Discipline' },
    ...(isSuperAdmin || user?.role === 'admin' ? [
      { key: 'roles', label: '🔑 Roles' },
      { key: 'approvals', label: '📋 Approvals' },
      { key: 'audit', label: '📜 Audit Log' },
    ] : []),
    ...(isSuperAdmin ? [{ key: 'transfer', label: '👑 Transfer' }] : []),
  ];

  return (
    <div>
      <h1 className="text-4xl font-bold mb-2">🛡️ Admin Panel</h1>
      {user?.role === 'admin' && (
        <p className="text-blue-600 mb-6 text-sm font-medium">🔒 Regional Admin — Access limited to your region</p>
      )}
      {user?.regionId && user?.role !== 'super_admin' && user?.role !== 'admin' && (
        <p className="text-gray-500 mb-6 text-sm">📍 Showing data for your region only</p>
      )}
      {isSuperAdmin && (
        <p className="text-yellow-600 mb-6 text-sm font-medium">🌐 Super Admin — Global access to all regions</p>
      )}

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

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error} <button onClick={() => setError(null)} className="ml-2 underline">dismiss</button></div>}
      {success && <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{success}</div>}
      {loading && <div className="text-center py-8">Loading...</div>}

      {/* ===== Overview Tab ===== */}
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
              { label: 'Pending Approvals', value: stats.pendingApprovals, icon: '📋' },
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

      {/* ===== Users Tab ===== */}
      {!loading && tab === 'users' && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Region</th>
                <th className="p-3">Status</th>
                {(user?.role === 'regulator' || user?.role === 'super_admin' || user?.role === 'admin') && <th className="p-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{u.firstName} {u.lastName}</td>
                  <td className="p-3 text-gray-600">{u.email}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${
                      u.role === 'super_admin' ? 'bg-yellow-100 text-yellow-800' :
                      u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>{u.role}</span>
                  </td>
                  <td className="p-3">
                    {u.region ? (
                      <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800">{u.region.name}</span>
                    ) : <span className="text-xs text-gray-400">Global</span>}
                  </td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-1 rounded ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  {(user?.role === 'regulator' || user?.role === 'super_admin' || user?.role === 'admin') && (
                    <td className="p-3">
                      {u.role !== 'super_admin' && (
                        <button onClick={() => toggleUserStatus(u.id)} className="text-sm text-squash-primary hover:underline">
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== Players Tab ===== */}
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
                {(user?.role === 'regulator' || user?.role === 'super_admin' || user?.role === 'admin') && <th className="p-3">Actions</th>}
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
                  {(user?.role === 'regulator' || user?.role === 'super_admin' || user?.role === 'admin') && (
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

      {/* ===== Tournaments Tab ===== */}
      {!loading && tab === 'tournaments' && (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-3">Tournament</th>
                <th className="p-3">Location</th>
                <th className="p-3">Region</th>
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
                  <td className="p-3">
                    {t.region ? (
                      <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800">{t.region.name}</span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
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

      {/* ===== Discipline Tab ===== */}
      {!loading && tab === 'discipline' && (
        <div>
          {(user?.role === 'regulator' || user?.role === 'super_admin' || user?.role === 'admin') && (
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
                  {(user?.role === 'regulator' || user?.role === 'super_admin' || user?.role === 'admin') && <th className="p-3">Actions</th>}
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
                    {(user?.role === 'regulator' || user?.role === 'super_admin' || user?.role === 'admin') && (
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

      {/* ===== Role Management Tab (SuperAdmin only) ===== */}
      {!loading && tab === 'roles' && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">🔑 Role Hierarchy</h2>
            <div className="flex flex-wrap gap-3 items-center text-sm">
              <span className="px-3 py-2 rounded bg-yellow-100 text-yellow-800 font-bold">👑 SuperAdmin</span>
              <span className="text-gray-400">→</span>
              <span className="px-3 py-2 rounded bg-purple-100 text-purple-800 font-bold">🔒 Admin (regional)</span>
              <span className="text-gray-400">→</span>
              <span className="px-3 py-2 rounded bg-blue-100 text-blue-800 font-bold">📋 Organiser</span>
              <span className="text-gray-400">→</span>
              <span className="px-3 py-2 rounded bg-green-100 text-green-800 font-bold">🏸 Player</span>
            </div>
            <p className="text-gray-500 text-sm mt-3">Only SuperAdmin can promote/demote users. Admins are restricted to their assigned region.</p>
          </div>

          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Current Role</th>
                  <th className="p-3">Region</th>
                  <th className="p-3">Status</th>
                  {isSuperAdmin && <th className="p-3">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{u.firstName} {u.lastName}</td>
                    <td className="p-3 text-gray-600 text-sm">{u.email}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded capitalize font-medium ${
                        u.role === 'super_admin' ? 'bg-yellow-100 text-yellow-800' :
                        u.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                        u.role === 'organiser' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>{u.role}</span>
                    </td>
                    <td className="p-3">
                      {u.region ? <span className="text-xs px-2 py-1 rounded bg-indigo-100 text-indigo-800">{u.region.name}</span> : <span className="text-xs text-gray-400">—</span>}
                    </td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-1 rounded ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {isSuperAdmin && (
                      <td className="p-3">
                        <div className="flex gap-2 items-center flex-wrap">
                          {u.role !== 'super_admin' && u.role !== 'admin' && (
                            <div className="flex gap-1 items-center">
                              <select
                                className="text-xs border rounded px-1 py-1"
                                value={promoteRegion}
                                onChange={e => setPromoteRegion(e.target.value)}
                              >
                                <option value="">Keep region</option>
                                {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                              </select>
                              <button
                                onClick={() => promoteUser(u.id)}
                                className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                              >
                                Promote → Admin
                              </button>
                            </div>
                          )}
                          {u.role === 'admin' && (
                            <button
                              onClick={() => demoteUser(u.id)}
                              className="text-xs px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700"
                            >
                              Demote → Organiser
                            </button>
                          )}
                          {u.role !== 'super_admin' && (
                            <button
                              onClick={() => toggleUserStatus(u.id)}
                              className={`text-xs px-2 py-1 rounded ${u.isActive ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-green-600 text-white hover:bg-green-700'}`}
                            >
                              {u.isActive ? 'Suspend' : 'Reactivate'}
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== Approvals Tab ===== */}
      {!loading && tab === 'approvals' && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-2">📋 Approval Workflow</h2>
            <p className="text-gray-500 text-sm">
              Sensitive actions (delete tournament, update match results, modify rankings) require SuperAdmin approval.
              Admins and organisers submit requests; only SuperAdmin can approve or reject.
            </p>
          </div>

          {approvals.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No approval requests found.
            </div>
          ) : (
            <div className="space-y-4">
              {approvals.map(a => (
                <div key={a.id} className={`bg-white rounded-lg shadow p-5 border-l-4 ${
                  a.status === 'pending' ? 'border-yellow-500' :
                  a.status === 'approved' ? 'border-green-500' :
                  'border-red-500'
                }`}>
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <h3 className="font-bold text-lg">{a.actionType.replace(/_/g, ' ').toUpperCase()}</h3>
                      <p className="text-sm text-gray-600">
                        Entity: <span className="font-medium">{a.entityType}</span> | ID: <span className="font-mono text-xs">{a.entityId?.slice(0, 8)}...</span>
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Requested by: <span className="font-medium">{a.requester?.firstName} {a.requester?.lastName}</span>
                        {' '}({a.requester?.role}) — {new Date(a.createdAt).toLocaleString()}
                      </p>
                      {a.payload && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer">View payload</summary>
                          <pre className="text-xs bg-gray-50 p-2 rounded mt-1 max-h-32 overflow-auto">{JSON.stringify(a.payload, null, 2)}</pre>
                        </details>
                      )}
                      {a.reviewer && (
                        <p className="text-sm text-gray-500 mt-1">
                          Reviewed by: {a.reviewer.firstName} {a.reviewer.lastName}
                          {a.reviewNote && <span className="italic"> — "{a.reviewNote}"</span>}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className={`text-xs px-3 py-1 rounded font-medium ${
                        a.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        a.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>{a.status}</span>
                      {isSuperAdmin && a.status === 'pending' && (
                        <>
                          <button onClick={() => approveRequest(a.id)} className="text-sm px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700">
                            Approve
                          </button>
                          <button onClick={() => rejectRequest(a.id)} className="text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===== Audit Log Tab ===== */}
      {!loading && tab === 'audit' && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold mb-2">📜 Audit Log</h2>
            <p className="text-gray-500 text-sm">
              All admin actions are logged with old/new values for full traceability and rollback capability.
              {!isSuperAdmin && ' You can only see your own actions.'}
            </p>
            <p className="text-sm text-gray-400 mt-1">Total entries: {auditTotal}</p>
          </div>

          {auditLogs.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
              No audit log entries found.
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">User</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Entity</th>
                    <th className="p-3">Details</th>
                    {isSuperAdmin && <th className="p-3">Rollback</th>}
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(log => (
                    <tr key={log.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 text-sm text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                      <td className="p-3 text-sm">{log.user?.firstName} {log.user?.lastName}</td>
                      <td className="p-3">
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                          log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                          'bg-red-100 text-red-800'
                        }`}>{log.action}</span>
                      </td>
                      <td className="p-3 text-sm">
                        {log.entity} <span className="text-gray-400 font-mono text-xs">{log.entityId?.slice(0, 8)}...</span>
                      </td>
                      <td className="p-3">
                        <details>
                          <summary className="text-xs text-gray-500 cursor-pointer">View changes</summary>
                          <div className="mt-1 text-xs space-y-1">
                            {log.oldValue && (
                              <div><span className="font-medium text-red-600">Old:</span> <pre className="inline bg-gray-50 p-1 rounded">{JSON.stringify(log.oldValue, null, 2)}</pre></div>
                            )}
                            {log.newValue && (
                              <div><span className="font-medium text-green-600">New:</span> <pre className="inline bg-gray-50 p-1 rounded">{JSON.stringify(log.newValue, null, 2)}</pre></div>
                            )}
                          </div>
                        </details>
                      </td>
                      {isSuperAdmin && (
                        <td className="p-3">
                          {(log.action === 'UPDATE' || log.action === 'DELETE') && log.oldValue && (
                            <button
                              onClick={() => rollbackAction(log.id)}
                              className="text-xs px-2 py-1 bg-orange-600 text-white rounded hover:bg-orange-700"
                            >
                              ↩ Rollback
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ===== SuperAdmin Transfer Tab (SuperAdmin only) ===== */}
      {!loading && tab === 'transfer' && isSuperAdmin && (
        <div>
          <div className="bg-white rounded-lg shadow p-6 mb-6 border-l-4 border-yellow-500">
            <h2 className="text-xl font-bold mb-2">👑 SuperAdmin Transfer</h2>
            <p className="text-gray-500 text-sm">
              Transfer your SuperAdmin role to another user. This action is irreversible and requires password confirmation.
              You will be downgraded to Admin after the transfer completes.
            </p>
          </div>

          {/* Pending transfer */}
          {pendingTransfer && !transferData && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-5 mb-6">
              <h3 className="font-bold text-yellow-800 mb-2">Pending Transfer</h3>
              <p className="text-sm">
                Transfer to: <span className="font-bold">{pendingTransfer.toUser?.firstName} {pendingTransfer.toUser?.lastName}</span> ({pendingTransfer.toUser?.email})
              </p>
              <p className="text-sm text-gray-500">Expires: {new Date(pendingTransfer.expiresAt).toLocaleString()}</p>
              <button onClick={cancelTransfer} className="mt-3 text-sm px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                Cancel Transfer
              </button>
            </div>
          )}

          {/* Step 1: Select target user */}
          {!transferData && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-bold mb-4">Step 1: Select New SuperAdmin</h3>
              <div className="flex gap-3 items-end flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm text-gray-600 mb-1">Target User</label>
                  <select
                    className="input-field w-full"
                    value={transferTarget}
                    onChange={e => setTransferTarget(e.target.value)}
                  >
                    <option value="">Select a user...</option>
                    {users.filter(u => u.id !== user?.id && u.isActive && u.role !== 'super_admin').map(u => (
                      <option key={u.id} value={u.id}>
                        {u.firstName} {u.lastName} ({u.email}) — {u.role}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={initiateTransfer}
                  disabled={!transferTarget}
                  className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Initiate Transfer
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Confirm with password */}
          {transferData && (
            <div className="bg-red-50 border-2 border-red-300 rounded-lg p-6">
              <h3 className="font-bold text-red-800 text-lg mb-2">⚠️ Step 2: Confirm Transfer</h3>
              <p className="text-sm text-red-700 mb-4">
                You are about to transfer SuperAdmin role to <span className="font-bold">{transferData.targetUser?.name}</span> ({transferData.targetUser?.email}).
                This action is irreversible. Enter your password to confirm.
              </p>
              <div className="flex gap-3 items-end flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm text-gray-600 mb-1">Your Password</label>
                  <input
                    type="password"
                    className="input-field w-full"
                    placeholder="Enter your password to confirm"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button
                  onClick={confirmTransfer}
                  disabled={!confirmPassword}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Confirm Transfer
                </button>
                <button
                  onClick={() => { setTransferData(null); setConfirmPassword(''); cancelTransfer(); }}
                  className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
