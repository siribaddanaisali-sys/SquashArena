import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function TournamentDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const [tournament, setTournament] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [draw, setDraw] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTournamentData();
  }, [id]);

  const fetchTournamentData = async () => {
    try {
      setLoading(true);
      const [tournamentData, regsData] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/tournaments/${id}/registrations`),
      ]);
      setTournament(tournamentData);
      setRegistrations(Array.isArray(regsData) ? regsData : []);

      // Try to fetch draw
      try {
        const drawData = await api.get(`/tournaments/${id}/draw`);
        setDraw(drawData);
      } catch (e) {
        // No draw yet - that's fine
      }

      // Check if current user is registered
      if (token) {
        try {
          const myReg = await api.get(`/tournaments/${id}/my-registration`);
          setIsRegistered(myReg.registered);
        } catch (e) {}
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setActionLoading(true);
    try {
      await api.post(`/tournaments/${id}/register`);
      setIsRegistered(true);
      fetchTournamentData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/tournaments/${id}/register`);
      setIsRegistered(false);
      fetchTournamentData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateDraw = async () => {
    setActionLoading(true);
    try {
      await api.post(`/tournaments/${id}/draw`);
      fetchTournamentData();
      setActiveTab('bracket');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeedPlayers = async () => {
    setActionLoading(true);
    try {
      await api.put(`/tournaments/${id}/seed`);
      fetchTournamentData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="text-center py-12 text-lg">Loading tournament...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;
  if (!tournament) return <div className="text-center py-12">Tournament not found</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'ongoing': return 'bg-blue-100 text-blue-800';
      case 'upcoming': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOrganiser = user?.role === 'organiser';
  const isPlayer = user?.role === 'player';

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Link to="/tournaments" className="text-squash-primary hover:underline mb-4 inline-block">
          ← Back to Tournaments
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold">{tournament.name}</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(tournament.status)}`}>
                {tournament.status?.charAt(0).toUpperCase() + tournament.status?.slice(1)}
              </span>
              <span className="text-gray-600 capitalize">{tournament.category}</span>
              <span className="text-gray-600">📍 {tournament.location}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-squash-primary bg-opacity-10 rounded-lg p-4">
              <p className="text-3xl font-bold text-squash-primary">
                {tournament.registeredParticipants}/{tournament.maxParticipants}
              </p>
              <p className="text-sm text-gray-600">Participants</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 mb-6">
        {isPlayer && tournament.registrationOpen && !isRegistered && (
          <button onClick={handleRegister} disabled={actionLoading}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50">
            {actionLoading ? 'Processing...' : '✅ Register for Tournament'}
          </button>
        )}
        {isPlayer && isRegistered && tournament.registrationOpen && (
          <button onClick={handleWithdraw} disabled={actionLoading}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50">
            {actionLoading ? 'Processing...' : '❌ Withdraw'}
          </button>
        )}
        {isRegistered && (
          <span className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
            ✓ You are registered
          </span>
        )}
        {isOrganiser && (
          <>
            <button onClick={handleSeedPlayers} disabled={actionLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              🎯 Auto-Seed Players
            </button>
            <button onClick={handleGenerateDraw} disabled={actionLoading}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50">
              🏆 Generate Draw
            </button>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        {['info', 'players', 'bracket'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-semibold capitalize border-b-2 transition ${
              activeTab === tab
                ? 'border-squash-primary text-squash-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}>
            {tab === 'info' ? '📋 Info' : tab === 'players' ? `👥 Players (${registrations.length})` : '🏆 Bracket'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Tournament Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-gray-600">Category</span><span className="font-semibold capitalize">{tournament.category}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Draw Type</span><span className="font-semibold capitalize">{(tournament.drawType || 'single_elimination').replace(/_/g, ' ')}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Start Date</span><span className="font-semibold">{new Date(tournament.startDate).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">End Date</span><span className="font-semibold">{new Date(tournament.endDate).toLocaleDateString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Location</span><span className="font-semibold">{tournament.location}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Registration</span><span className={`font-semibold ${tournament.registrationOpen ? 'text-green-600' : 'text-red-600'}`}>{tournament.registrationOpen ? 'Open' : 'Closed'}</span></div>
              {tournament.prizePool > 0 && (
                <div className="flex justify-between"><span className="text-gray-600">Prize Pool</span><span className="font-semibold text-green-600">${parseFloat(tournament.prizePool).toLocaleString()}</span></div>
              )}
            </div>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Description</h3>
            <p className="text-gray-700">{tournament.description || 'No description provided.'}</p>
            {tournament.organizer && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-gray-600">Organized by: <span className="font-semibold">{tournament.organizer.firstName} {tournament.organizer.lastName}</span></p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'players' && (
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Registered Players ({registrations.length})</h3>
          {registrations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No players registered yet.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-3 px-2">Seed</th>
                  <th className="py-3 px-2">Player</th>
                  <th className="py-3 px-2">Ranking</th>
                  <th className="py-3 px-2">ELO Rating</th>
                  <th className="py-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg, idx) => (
                  <tr key={reg.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2 font-bold">{reg.seedNumber || '-'}</td>
                    <td className="py-3 px-2">
                      <Link to={`/players/${reg.Player?.id}`} className="text-squash-primary hover:underline">
                        {reg.Player?.User?.firstName} {reg.Player?.User?.lastName}
                      </Link>
                    </td>
                    <td className="py-3 px-2">#{reg.Player?.ranking || 'N/A'}</td>
                    <td className="py-3 px-2">{parseFloat(reg.Player?.eloRating || 1500).toFixed(0)}</td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        reg.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        reg.status === 'withdrawn' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>{reg.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'bracket' && (
        <div>
          {!draw ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg">No bracket generated yet.</p>
              {isOrganiser && (
                <p className="text-gray-400 mt-2">Use "Generate Draw" to create the bracket.</p>
              )}
            </div>
          ) : (
            <BracketView draw={draw} />
          )}
        </div>
      )}
    </div>
  );
}

// Bracket Visualization Component
function BracketView({ draw }) {
  const { bracketData, drawType } = draw;
  const rounds = bracketData?.rounds || [];

  if (drawType === 'round_robin') {
    return (
      <div>
        <h3 className="text-xl font-bold mb-4">Round Robin Draw</h3>
        {/* Standings */}
        {bracketData.standings && (
          <div className="card mb-6">
            <h4 className="font-bold mb-3">Standings</h4>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="py-2">#</th><th className="py-2">Player</th>
                  <th className="py-2">P</th><th className="py-2">W</th>
                  <th className="py-2">L</th><th className="py-2">Pts</th>
                </tr>
              </thead>
              <tbody>
                {bracketData.standings.map((s, i) => (
                  <tr key={i} className="border-b"><td className="py-2">{i+1}</td>
                    <td className="py-2">{s.playerName}</td><td className="py-2">{s.played}</td>
                    <td className="py-2">{s.wins}</td><td className="py-2">{s.losses}</td>
                    <td className="py-2 font-bold">{s.points}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {/* Rounds */}
        {rounds.map(round => (
          <div key={round.roundNumber} className="card mb-4">
            <h4 className="font-bold mb-3">{round.name}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {round.matches.map((match, i) => (
                <MatchCard key={i} match={match} />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Single/Double Elimination Bracket
  return (
    <div>
      <h3 className="text-xl font-bold mb-4">
        {(drawType || 'single_elimination').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Bracket
      </h3>
      <div className="overflow-x-auto">
        <div className="flex gap-8 min-w-max py-4">
          {rounds.map((round, rIdx) => (
            <div key={rIdx} className="flex flex-col justify-around min-w-[220px]">
              <h4 className="text-center font-bold text-sm text-gray-600 mb-4">{round.name}</h4>
              <div className="flex flex-col justify-around flex-1 gap-4">
                {round.matches.map((match, mIdx) => (
                  <div key={mIdx} className="border rounded-lg overflow-hidden shadow-sm bg-white"
                    style={{ marginTop: rIdx > 0 ? `${Math.pow(2, rIdx) * 10}px` : '0' }}>
                    <div className={`px-3 py-2 border-b flex justify-between items-center ${
                      match.winnerId && match.player1?.playerId === match.winnerId ? 'bg-green-50 font-bold' : 'bg-gray-50'
                    }`}>
                      <span className="text-sm">
                        {match.player1?.seedNumber && <span className="text-gray-400 mr-1">[{match.player1.seedNumber}]</span>}
                        {match.player1?.playerName || 'TBD'}
                      </span>
                      {match.score && <span className="text-xs text-gray-500">{getMatchScoreDisplay(match, 1)}</span>}
                    </div>
                    <div className={`px-3 py-2 flex justify-between items-center ${
                      match.winnerId && match.player2?.playerId === match.winnerId ? 'bg-green-50 font-bold' : ''
                    }`}>
                      <span className="text-sm">
                        {match.player2?.seedNumber && <span className="text-gray-400 mr-1">[{match.player2.seedNumber}]</span>}
                        {match.player2?.playerName || 'TBD'}
                      </span>
                      {match.score && <span className="text-xs text-gray-500">{getMatchScoreDisplay(match, 2)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MatchCard({ match }) {
  return (
    <div className="border rounded-lg p-3 bg-white shadow-sm">
      <div className="flex justify-between items-center">
        <span className={`text-sm ${match.winnerId === match.player1?.playerId ? 'font-bold text-green-700' : ''}`}>
          {match.player1?.playerName || 'TBD'}
        </span>
        <span className="text-xs text-gray-400">vs</span>
        <span className={`text-sm ${match.winnerId === match.player2?.playerId ? 'font-bold text-green-700' : ''}`}>
          {match.player2?.playerName || 'TBD'}
        </span>
      </div>
      <div className="text-center mt-1">
        <span className={`text-xs px-2 py-0.5 rounded ${
          match.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>{match.status}</span>
      </div>
    </div>
  );
}

function getMatchScoreDisplay(match, playerNum) {
  if (!match.score?.games) return '';
  return match.score.games.map(g => playerNum === 1 ? g[0] : g[1]).join(' ');
}
