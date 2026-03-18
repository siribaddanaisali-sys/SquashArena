import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      let endpoint = '/dashboard/player';
      if (user?.role === 'organiser') endpoint = '/dashboard/organiser';
      else if (user?.role === 'coach') endpoint = '/dashboard/coach';

      const result = await api.get(endpoint);
      setData(result);
    } catch (err) {
      console.error('Dashboard load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-lg">Loading dashboard...</div>;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Welcome, {user?.firstName}!</h1>
        <p className="text-gray-600 mt-2">Role: <span className="font-bold text-squash-primary capitalize">{user?.role}</span></p>
      </div>

      {user?.role === 'player' && data?.player && <PlayerDashboard data={data} />}
      {user?.role === 'organiser' && data?.stats && <OrganiserDashboard data={data} />}
      {user?.role === 'coach' && data?.coach && <CoachDashboard data={data} />}
      {!['player', 'organiser', 'coach'].includes(user?.role) && <ViewerDashboard />}
    </div>
  );
}

function PlayerDashboard({ data }) {
  const { player, upcomingMatches, recentMatches, registeredTournaments, clubs, currentCoaches, pendingCoaches } = data;
  const [showCoachPicker, setShowCoachPicker] = useState(false);
  const [coachSearch, setCoachSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [availableCoaches, setAvailableCoaches] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [loadingCoaches, setLoadingCoaches] = useState(false);
  const [myCoaches, setMyCoaches] = useState(currentCoaches || []);
  const [myPendingCoaches, setMyPendingCoaches] = useState(pendingCoaches || []);
  const [expandedCountries, setExpandedCountries] = useState({});

  const fetchAvailableCoaches = async (search = '', country = '') => {
    try {
      setLoadingCoaches(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (country) params.set('country', country);
      const qs = params.toString();
      const result = await api.get(`/players/coaches/available${qs ? `?${qs}` : ''}`);
      setAvailableCoaches(result.groups || []);
      if (result.countries) setCountryList(result.countries);
    } catch (err) {
      console.error('Failed to load coaches:', err);
    } finally {
      setLoadingCoaches(false);
    }
  };

  const openCoachPicker = () => {
    setShowCoachPicker(true);
    setCountryFilter('');
    fetchAvailableCoaches();
  };

  const handleCoachSearch = (e) => {
    const val = e.target.value;
    setCoachSearch(val);
    fetchAvailableCoaches(val, countryFilter);
  };

  const handleCountryFilter = (e) => {
    const val = e.target.value;
    setCountryFilter(val);
    fetchAvailableCoaches(coachSearch, val);
  };

  const assignCoach = async (coachId) => {
    try {
      await api.post('/players/my/coaches', { coachId });
      const updated = await api.get('/players/my/coaches');
      setMyCoaches(updated.current || []);
      setMyPendingCoaches(updated.pending || []);
      setShowCoachPicker(false);
      setCoachSearch('');
      setCountryFilter('');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to send request');
    }
  };

  const removeCoach = async (linkId) => {
    if (!confirm('Remove this coach?')) return;
    try {
      await api.delete(`/players/my/coaches/${linkId}`);
      setMyCoaches(prev => prev.filter(c => c.linkId !== linkId));
      setMyPendingCoaches(prev => prev.filter(c => c.linkId !== linkId));
    } catch (err) {
      alert('Failed to remove coach');
    }
  };

  const toggleCountry = (country) => {
    setExpandedCountries(prev => ({ ...prev, [country]: !prev[country] }));
  };

  const isAssignedOrPending = (coachId) => {
    return myCoaches.some(mc => mc.coachId === coachId) || myPendingCoaches.some(mc => mc.coachId === coachId);
  };

  const getCoachStatus = (coachId) => {
    if (myCoaches.some(mc => mc.coachId === coachId)) return 'active';
    if (myPendingCoaches.some(mc => mc.coachId === coachId)) return 'pending';
    return null;
  };

  return (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <StatCard label="ELO Rating" value={parseFloat(player.eloRating || 1500).toFixed(0)} color="blue" />
        <StatCard label="Matches" value={player.totalMatches} color="gray" />
        <StatCard label="Wins" value={player.wins} color="green" />
        <StatCard label="Losses" value={player.losses} color="red" />
        <StatCard label="Win %" value={`${player.winPercentage}%`} color="purple" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StatCard label="World Ranking" value={`#${player.ranking || 'N/A'}`} color="yellow" />
        <StatCard label="Points" value={parseFloat(player.points || 0).toFixed(0)} color="indigo" />
      </div>

      {/* Upcoming Matches */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Upcoming Matches</h2>
        {upcomingMatches?.length > 0 ? (
          <div className="divide-y">
            {upcomingMatches.map(m => {
              const opponent = m.player1Id === player.id ? m.player2 : m.player1;
              const oppName = `${opponent?.User?.firstName || ''} ${opponent?.User?.lastName || ''}`;
              return (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold">vs {oppName} <span className="text-gray-400 text-sm">(#{opponent?.ranking})</span></p>
                    <p className="text-sm text-gray-500">{m.Tournament?.name} · Round {m.roundNumber}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{new Date(m.scheduledTime).toLocaleDateString()}</p>
                    <Link to={`/live-scoring/${m.id}`} className="text-xs text-squash-primary hover:underline font-semibold">Score →</Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <p className="text-gray-500">No upcoming matches</p>}
      </div>

      {/* Recent Results */}
      <div className="card mb-6">
        <h2 className="text-xl font-bold mb-4">Recent Results</h2>
        {recentMatches?.length > 0 ? (
          <div className="divide-y">
            {recentMatches.map(m => {
              const isWinner = m.winnerId === player.id;
              const opponent = m.player1Id === player.id ? m.player2 : m.player1;
              const oppName = `${opponent?.User?.firstName || ''} ${opponent?.User?.lastName || ''}`;
              return (
                <div key={m.id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      isWinner ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>{isWinner ? 'W' : 'L'}</span>
                    <div>
                      <p className="font-semibold">vs {oppName}</p>
                      <p className="text-sm text-gray-500">{m.Tournament?.name}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">{new Date(m.scheduledTime).toLocaleDateString()}</p>
                </div>
              );
            })}
          </div>
        ) : <p className="text-gray-500">No recent matches</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Registered Tournaments */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">My Tournaments</h2>
          {registeredTournaments?.length > 0 ? (
            <div className="divide-y">
              {registeredTournaments.map(reg => (
                <Link key={reg.id} to={`/tournaments/${reg.Tournament?.id}`} className="py-3 block hover:bg-gray-50 -mx-4 px-4 rounded">
                  <p className="font-semibold">{reg.Tournament?.name}</p>
                  <p className="text-sm text-gray-500">
                    {reg.Tournament?.location} · {new Date(reg.Tournament?.startDate).toLocaleDateString()}
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-semibold ${
                      reg.Tournament?.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                      reg.Tournament?.status === 'ongoing' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>{reg.Tournament?.status}</span>
                  </p>
                </Link>
              ))}
            </div>
          ) : <p className="text-gray-500">Not registered for any tournaments</p>}
        </div>

        {/* Club Memberships */}
        <div className="card">
          <h2 className="text-xl font-bold mb-4">My Clubs</h2>
          {clubs?.length > 0 ? (
            <div className="divide-y">
              {clubs.map(cm => (
                <Link key={cm.id} to={`/clubs/${cm.Club?.id}`} className="py-3 block hover:bg-gray-50 -mx-4 px-4 rounded">
                  <p className="font-semibold">{cm.Club?.name}</p>
                  <p className="text-sm text-gray-500">{cm.Club?.city}, {cm.Club?.country}</p>
                </Link>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-gray-500 mb-2">Not a member of any club</p>
              <Link to="/clubs" className="text-squash-primary text-sm hover:underline font-semibold">Browse clubs →</Link>
            </div>
          )}
        </div>
      </div>

      {/* My Coach Section */}
      <div className="card mt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">My Coach</h2>
          <button onClick={openCoachPicker} className="btn-primary text-sm px-4 py-2">
            {myCoaches.length > 0 ? 'Change Coach' : 'Select Coach'}
          </button>
        </div>

        {/* Active Coaches */}
        {myCoaches.length > 0 && (
          <div className="divide-y">
            {myCoaches.map(c => (
              <div key={c.linkId} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-squash-primary text-white flex items-center justify-center font-bold">
                    {c.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{c.name}</p>
                    <p className="text-sm text-gray-500">
                      {c.certification && <span className="mr-2">{c.certification}</span>}
                      {c.specialization && <span>· {c.specialization}</span>}
                    </p>
                    <p className="text-xs text-gray-400">Since {new Date(c.startDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <button onClick={() => removeCoach(c.linkId)} className="text-red-500 hover:text-red-700 text-sm font-semibold">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Pending Coaches */}
        {myPendingCoaches.length > 0 && (
          <div className={myCoaches.length > 0 ? 'mt-4 pt-4 border-t' : ''}>
            <p className="text-sm font-semibold text-yellow-600 mb-2">Pending Approval</p>
            <div className="divide-y">
              {myPendingCoaches.map(c => (
                <div key={c.linkId} className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold">{c.name}
                        <span className="ml-2 px-2 py-0.5 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">Pending</span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {c.certification && <span className="mr-2">{c.certification}</span>}
                        {c.specialization && <span>· {c.specialization}</span>}
                      </p>
                      <p className="text-xs text-gray-400">Requested {new Date(c.startDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={() => removeCoach(c.linkId)} className="text-gray-400 hover:text-red-500 text-sm font-semibold">
                    Cancel
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {myCoaches.length === 0 && myPendingCoaches.length === 0 && (
          <p className="text-gray-500">No coach selected. Selecting a coach is optional.</p>
        )}
      </div>

      {/* Coach Picker Modal */}
      {showCoachPicker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold">Select a Coach</h3>
                <button onClick={() => { setShowCoachPicker(false); setCoachSearch(''); setCountryFilter(''); }} className="text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={coachSearch}
                  onChange={handleCoachSearch}
                  className="input flex-1"
                  autoFocus
                />
                <select
                  value={countryFilter}
                  onChange={handleCountryFilter}
                  className="input w-40"
                >
                  <option value="">All Countries</option>
                  {countryList.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              {loadingCoaches ? (
                <p className="text-center text-gray-500 py-8">Loading coaches...</p>
              ) : availableCoaches.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No coaches found</p>
              ) : (
                availableCoaches.map(group => (
                  <div key={group.country} className="mb-3">
                    <button
                      onClick={() => toggleCountry(group.country)}
                      className="w-full flex items-center justify-between py-2 px-3 bg-gray-100 rounded-lg font-semibold text-sm hover:bg-gray-200"
                    >
                      <span>{group.country} ({group.coaches.length})</span>
                      <span className="text-gray-400">{expandedCountries[group.country] ? '▲' : '▼'}</span>
                    </button>
                    {expandedCountries[group.country] && (
                      <div className="mt-1 divide-y ml-2">
                        {group.coaches.map(c => {
                          const status = getCoachStatus(c.id);
                          return (
                            <div key={c.id} className="py-2 flex items-center justify-between">
                              <div>
                                <p className="font-semibold">{c.firstName} {c.lastName}</p>
                                <p className="text-xs text-gray-500">
                                  {c.certification && <span className="mr-2">{c.certification}</span>}
                                  {c.specialization && <span>· {c.specialization}</span>}
                                  {c.experience > 0 && <span> · {c.experience} yrs exp</span>}
                                </p>
                              </div>
                              {status === 'active' ? (
                                <span className="text-xs text-green-600 font-semibold">Assigned</span>
                              ) : status === 'pending' ? (
                                <span className="text-xs text-yellow-600 font-semibold">Pending</span>
                              ) : (
                                <button onClick={() => assignCoach(c.id)} className="btn-primary text-xs px-3 py-1">Select</button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function OrganiserDashboard({ data }) {
  const { stats, upcomingTournaments, ongoingTournaments, recentTournaments } = data;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Tournaments" value={stats.totalTournaments} color="blue" />
        <StatCard label="Upcoming" value={stats.upcoming} color="green" />
        <StatCard label="Ongoing" value={stats.ongoing} color="yellow" />
        <StatCard label="Total Matches" value={stats.totalMatches} color="gray" />
      </div>

      {ongoingTournaments?.length > 0 && (
        <div className="card mb-6 border-l-4 border-green-500">
          <h2 className="text-xl font-bold mb-4 text-green-700">Ongoing Tournaments</h2>
          <div className="divide-y">
            {ongoingTournaments.map(t => (
              <Link key={t.id} to={`/tournaments/${t.id}`} className="py-3 block hover:bg-gray-50 -mx-4 px-4 rounded">
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-gray-500">{t.location} · {t.registrations?.length || 0} players</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {upcomingTournaments?.length > 0 && (
        <div className="card mb-6">
          <h2 className="text-xl font-bold mb-4">Upcoming Tournaments</h2>
          <div className="divide-y">
            {upcomingTournaments.map(t => (
              <Link key={t.id} to={`/tournaments/${t.id}`} className="py-3 block hover:bg-gray-50 -mx-4 px-4 rounded">
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-gray-500">
                  {t.location} · Starts {new Date(t.startDate).toLocaleDateString()}
                  · {t.registeredParticipants}/{t.maxParticipants} registered
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function CoachDashboard({ data }) {
  const { coach, players, pendingRequests: initialPending } = data;
  const [pendingRequests, setPendingRequests] = useState(initialPending || []);

  const handleApprove = async (linkId) => {
    try {
      await api.put(`/players/coach/requests/${linkId}/approve`);
      setPendingRequests(prev => prev.filter(r => r.linkId !== linkId));
    } catch (err) {
      alert('Failed to approve request');
    }
  };

  const handleReject = async (linkId) => {
    if (!confirm('Reject this player request?')) return;
    try {
      await api.put(`/players/coach/requests/${linkId}/reject`);
      setPendingRequests(prev => prev.filter(r => r.linkId !== linkId));
    } catch (err) {
      alert('Failed to reject request');
    }
  };

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Level" value={coach.certification} color="blue" />
        <StatCard label="Experience" value={`${coach.experience} yrs`} color="green" />
        <StatCard label="Players" value={players.length} color="purple" />
        <StatCard label="Pending" value={pendingRequests.length} color="yellow" />
      </div>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <div className="card mb-6 border-l-4 border-yellow-400">
          <h2 className="text-xl font-bold mb-4 text-yellow-700">Pending Player Requests</h2>
          <div className="divide-y">
            {pendingRequests.map(r => (
              <div key={r.linkId} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center font-bold">
                    {r.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{r.name}</p>
                    <p className="text-sm text-gray-500">
                      Rank #{r.ranking} · ELO {parseFloat(r.eloRating || 1500).toFixed(0)}
                    </p>
                    <p className="text-xs text-gray-400">Requested {new Date(r.requestedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleApprove(r.linkId)} className="bg-green-500 hover:bg-green-600 text-white text-xs px-3 py-1.5 rounded font-semibold">
                    Approve
                  </button>
                  <button onClick={() => handleReject(r.linkId)} className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded font-semibold">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h2 className="text-xl font-bold mb-4">My Players</h2>
        {players.length > 0 ? (
          <div className="divide-y">
            {players.map(p => (
              <Link key={p.id} to={`/players/${p.id}`} className="py-3 flex items-center justify-between hover:bg-gray-50 -mx-4 px-4 rounded">
                <div>
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-sm text-gray-500">Rank #{p.ranking} · {p.nationality}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-squash-primary">{parseFloat(p.eloRating || 1500).toFixed(0)}</p>
                  <p className="text-xs text-gray-500">W{p.wins} L{p.losses}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : <p className="text-gray-500">No players assigned yet</p>}
      </div>
    </>
  );
}

function ViewerDashboard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Link to="/tournaments" className="card hover:shadow-lg transition-shadow text-center py-8">
        <div className="text-4xl mb-3">🏆</div>
        <h3 className="text-xl font-bold">Browse Tournaments</h3>
        <p className="text-gray-500 text-sm mt-1">View all upcoming tournaments</p>
      </Link>
      <Link to="/rankings" className="card hover:shadow-lg transition-shadow text-center py-8">
        <div className="text-4xl mb-3">📊</div>
        <h3 className="text-xl font-bold">Rankings</h3>
        <p className="text-gray-500 text-sm mt-1">View world and regional rankings</p>
      </Link>
      <Link to="/players" className="card hover:shadow-lg transition-shadow text-center py-8">
        <div className="text-4xl mb-3">👥</div>
        <h3 className="text-xl font-bold">Players</h3>
        <p className="text-gray-500 text-sm mt-1">Explore player profiles</p>
      </Link>
      <Link to="/clubs" className="card hover:shadow-lg transition-shadow text-center py-8">
        <div className="text-4xl mb-3">🏢</div>
        <h3 className="text-xl font-bold">Clubs</h3>
        <p className="text-gray-500 text-sm mt-1">Find and join squash clubs</p>
      </Link>
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: 'text-blue-600', green: 'text-green-600', red: 'text-red-600',
    purple: 'text-purple-600', gray: 'text-gray-700', yellow: 'text-yellow-600',
    indigo: 'text-indigo-600',
  };
  return (
    <div className="card text-center">
      <div className={`text-2xl font-bold ${colors[color] || colors.gray}`}>{value}</div>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  );
}
