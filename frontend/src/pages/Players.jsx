import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';

export default function Players() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filterNationality, setFilterNationality] = useState('');
  const [filterHand, setFilterHand] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortBy, setSortBy] = useState('ranking');

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        const data = await api.get('/players');
        const playersList = Array.isArray(data) ? data : [];
        setPlayers(playersList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPlayers();
  }, []);

  const nationalities = useMemo(() => {
    const set = new Set(players.map(p => p.nationality).filter(Boolean));
    return [...set].sort();
  }, [players]);

  const filteredPlayers = useMemo(() => {
    let result = [...players];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        (p.User?.firstName?.toLowerCase().includes(q)) ||
        (p.User?.lastName?.toLowerCase().includes(q)) ||
        (p.nationality?.toLowerCase().includes(q))
      );
    }
    if (filterNationality) result = result.filter(p => p.nationality === filterNationality);
    if (filterHand) result = result.filter(p => p.hand === filterHand);
    if (filterStatus) result = result.filter(p => p.status === filterStatus);

    result.sort((a, b) => {
      if (sortBy === 'ranking') return (a.ranking || 999) - (b.ranking || 999);
      if (sortBy === 'elo') return parseFloat(b.eloRating) - parseFloat(a.eloRating);
      if (sortBy === 'wins') return b.wins - a.wins;
      if (sortBy === 'name') return `${a.User?.firstName}`.localeCompare(`${b.User?.firstName}`);
      return 0;
    });

    return result;
  }, [players, search, filterNationality, filterHand, filterStatus, sortBy]);

  if (loading) return <div className="text-center py-12">Loading players...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-6">👥 Players Directory</h1>

      {/* Search & Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            className="input-field"
            placeholder="🔍 Search by name or nationality..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select className="input-field" value={filterNationality} onChange={e => setFilterNationality(e.target.value)}>
            <option value="">All Nationalities</option>
            {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <select className="input-field" value={filterHand} onChange={e => setFilterHand(e.target.value)}>
            <option value="">All Hands</option>
            <option value="right">Right</option>
            <option value="left">Left</option>
          </select>
          <select className="input-field" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="retired">Retired</option>
          </select>
          <select className="input-field" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="ranking">Sort: Ranking</option>
            <option value="elo">Sort: ELO</option>
            <option value="wins">Sort: Wins</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>
        <p className="text-gray-500 text-sm mt-2">{filteredPlayers.length} of {players.length} players</p>
      </div>

      {filteredPlayers.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600">No players match your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <Link to={`/players/${player.id}`} key={player.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-start gap-4 mb-4">
                <div className="text-2xl font-bold text-squash-primary">#{player.ranking || '-'}</div>
                <div>
                  <h3 className="text-lg font-bold">{player.User?.firstName || ''} {player.User?.lastName || 'Player'}</h3>
                  <p className="text-gray-600 text-sm">{player.nationality || ''}</p>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">ELO Rating</p>
                    <p className="font-bold text-lg">{parseFloat(player.eloRating || 1500).toFixed(0)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Record</p>
                    <p className="font-bold">{player.wins || 0}W - {player.losses || 0}L</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Hand</p>
                    <p className="font-bold capitalize">{player.hand || 'right'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className={`font-bold text-xs px-2 py-1 rounded ${
                      player.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100'
                    }`}>{player.status || 'N/A'}</p>
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
