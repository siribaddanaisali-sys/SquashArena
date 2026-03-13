import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function ClubDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [club, setClub] = useState(null);
  const [members, setMembers] = useState([]);
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClubData();
  }, [id]);

  const fetchClubData = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/clubs/${id}`);
      setClub(data.club);
      setMembers(data.members || []);

      if (token) {
        try {
          const mem = await api.get(`/clubs/${id}/my-membership`);
          setMembership(mem);
        } catch (e) {}
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setActionLoading(true);
    try {
      await api.post(`/clubs/${id}/join`);
      await fetchClubData();
    } catch (err) {
      alert('Failed to join: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeave = async () => {
    setActionLoading(true);
    try {
      await api.delete(`/clubs/${id}/leave`);
      await fetchClubData();
    } catch (err) {
      alert('Failed to leave: ' + err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-lg">Loading club...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;
  if (!club) return <div className="text-center py-12">Club not found</div>;

  const isMember = membership?.isMember;

  return (
    <div>
      <Link to="/clubs" className="text-squash-primary hover:underline mb-4 inline-block">← Back to Clubs</Link>

      {/* Club Header */}
      <div className="card mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-squash-primary bg-opacity-15 rounded-xl flex items-center justify-center text-4xl font-bold text-squash-primary">
            {club.name.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{club.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-600 text-sm">
              <span>📍 {club.city}, {club.country}</span>
              {club.foundedYear && <span>📅 Est. {club.foundedYear}</span>}
              <span>👥 {club.memberCount} members</span>
            </div>
            {club.description && <p className="text-gray-600 mt-3">{club.description}</p>}
          </div>
          <div>
            {token && !isMember && (
              <button onClick={handleJoin} disabled={actionLoading}
                className="bg-squash-primary text-white px-6 py-2 rounded-lg hover:opacity-90 font-semibold disabled:opacity-50">
                {actionLoading ? 'Joining...' : 'Join Club'}
              </button>
            )}
            {token && isMember && (
              <div className="text-right">
                <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold mb-2">
                  ✓ Member ({membership.role})
                </span>
                <br />
                <button onClick={handleLeave} disabled={actionLoading}
                  className="text-red-500 text-sm hover:underline disabled:opacity-50">
                  Leave Club
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Club Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {club.address && (
          <div className="card">
            <h3 className="font-bold text-sm text-gray-500 mb-1">Address</h3>
            <p>{club.address}</p>
          </div>
        )}
        {club.contactEmail && (
          <div className="card">
            <h3 className="font-bold text-sm text-gray-500 mb-1">Email</h3>
            <p>{club.contactEmail}</p>
          </div>
        )}
        {club.contactPhone && (
          <div className="card">
            <h3 className="font-bold text-sm text-gray-500 mb-1">Phone</h3>
            <p>{club.contactPhone}</p>
          </div>
        )}
        {club.website && (
          <div className="card">
            <h3 className="font-bold text-sm text-gray-500 mb-1">Website</h3>
            <p className="text-squash-primary">{club.website}</p>
          </div>
        )}
        <div className="card">
          <h3 className="font-bold text-sm text-gray-500 mb-1">Owner</h3>
          <p>{club.owner?.firstName} {club.owner?.lastName}</p>
        </div>
      </div>

      {/* Members */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">Members ({members.length})</h2>
        {members.length === 0 ? (
          <p className="text-gray-500">No members yet</p>
        ) : (
          <div className="divide-y">
            {members.map(m => (
              <div key={m.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-sm font-bold text-gray-500">
                    {m.User?.firstName?.[0]}{m.User?.lastName?.[0]}
                  </div>
                  <div>
                    {m.User?.Player ? (
                      <Link to={`/players/${m.User.Player.id}`} className="font-semibold hover:text-squash-primary">
                        {m.User.firstName} {m.User.lastName}
                      </Link>
                    ) : (
                      <span className="font-semibold">{m.User?.firstName} {m.User?.lastName}</span>
                    )}
                    <p className="text-xs text-gray-500">
                      {m.User?.role} {m.User?.Player ? `· Rank #${m.User.Player.ranking || 'N/A'} · ELO ${parseFloat(m.User.Player.eloRating || 1500).toFixed(0)}` : ''}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                  m.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                  m.role === 'captain' ? 'bg-blue-100 text-blue-700' :
                  m.role === 'coach' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-600'
                }`}>{m.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
