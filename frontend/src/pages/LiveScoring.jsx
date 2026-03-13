import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function LiveScoring() {
  const { matchId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [games, setGames] = useState([]);
  const [currentGame, setCurrentGame] = useState({ p1: 0, p2: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMatch();
  }, [matchId]);

  const fetchMatch = async () => {
    try {
      setLoading(true);
      const data = await api.get(`/matches/${matchId}`);
      setMatch(data);
      // Load existing score
      const score = data.score || { games: [] };
      const existingGames = Array.isArray(score.games) ? score.games : [];
      setGames(existingGames);
      if (data.status === 'ongoing' || data.status === 'scheduled') {
        // If no games yet or last game is complete, start fresh
        const lastGame = existingGames[existingGames.length - 1];
        if (!lastGame || (lastGame[0] >= 11 || lastGame[1] >= 11)) {
          setCurrentGame({ p1: 0, p2: 0 });
        } else {
          setCurrentGame({ p1: lastGame[0], p2: lastGame[1] });
          setGames(existingGames.slice(0, -1));
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addPoint = useCallback((player) => {
    if (match?.status === 'completed') return;
    setCurrentGame(prev => {
      const next = { ...prev };
      next[player]++;
      // Check if game is won (11 points, win by 2 if over 10)
      const p1 = next.p1, p2 = next.p2;
      if ((p1 >= 11 || p2 >= 11) && Math.abs(p1 - p2) >= 2) {
        // Game complete - add to games list
        setGames(g => [...g, [p1, p2]]);
        return { p1: 0, p2: 0 };
      }
      return next;
    });
  }, [match?.status]);

  const removePoint = useCallback((player) => {
    setCurrentGame(prev => ({
      ...prev,
      [player]: Math.max(0, prev[player] - 1),
    }));
  }, []);

  const allGames = currentGame.p1 > 0 || currentGame.p2 > 0
    ? [...games, [currentGame.p1, currentGame.p2]]
    : games;

  const p1GamesWon = games.filter(g => g[0] > g[1]).length;
  const p2GamesWon = games.filter(g => g[1] > g[0]).length;

  const isMatchComplete = p1GamesWon >= 3 || p2GamesWon >= 3;
  const winnerId = isMatchComplete
    ? (p1GamesWon >= 3 ? match?.player1Id : match?.player2Id)
    : null;

  const saveScore = async (finalize = false) => {
    if (!match) return;
    setSaving(true);
    try {
      const body = {
        score: { games: allGames },
        status: finalize && isMatchComplete ? 'completed' : 'ongoing',
      };
      if (finalize && isMatchComplete) {
        body.winnerId = winnerId;
      }
      await api.put(`/matches/${matchId}/score`, body);
      if (finalize && isMatchComplete) {
        await fetchMatch();
      }
    } catch (err) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const startMatch = async () => {
    try {
      await api.put(`/matches/${matchId}/score`, { score: { games: [] }, status: 'ongoing' });
      await fetchMatch();
    } catch (err) {
      alert('Failed to start match: ' + err.message);
    }
  };

  if (loading) return <div className="text-center py-12 text-lg">Loading match...</div>;
  if (error) return <div className="text-center py-12 text-red-600">Error: {error}</div>;
  if (!match) return <div className="text-center py-12">Match not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <Link to={match.tournamentId ? `/tournaments/${match.tournamentId}` : '/matches'} className="text-squash-primary hover:underline mb-4 inline-block">
        ← Back
      </Link>

      <h1 className="text-3xl font-bold mb-2">Live Scoring</h1>
      <p className="text-gray-500 mb-6">
        Round {match.roundNumber} · {match.status === 'completed' ? 'Final' : 'In Progress'}
      </p>

      {/* Score Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between text-center">
          <div className="flex-1">
            <p className="text-lg font-bold text-squash-dark">Player 1</p>
            <p className="text-sm text-gray-500">#{match.player1Id?.substring(0, 8)}</p>
          </div>
          <div className="px-6">
            <div className="flex items-center gap-4 text-4xl font-bold">
              <span className={p1GamesWon >= 3 ? 'text-green-600' : 'text-squash-dark'}>{p1GamesWon}</span>
              <span className="text-gray-300">-</span>
              <span className={p2GamesWon >= 3 ? 'text-green-600' : 'text-squash-dark'}>{p2GamesWon}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Games</p>
          </div>
          <div className="flex-1">
            <p className="text-lg font-bold text-squash-dark">Player 2</p>
            <p className="text-sm text-gray-500">#{match.player2Id?.substring(0, 8)}</p>
          </div>
        </div>
      </div>

      {/* Game History */}
      {games.length > 0 && (
        <div className="card mb-6">
          <h3 className="font-bold mb-3">Game Scores</h3>
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            {games.map((g, i) => (
              <React.Fragment key={i}>
                <div className={`py-2 rounded ${g[0] > g[1] ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600'}`}>{g[0]}</div>
                <div className="py-2 text-gray-400 text-sm">Game {i + 1}</div>
                <div className={`py-2 rounded ${g[1] > g[0] ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600'}`}>{g[1]}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Current Game Scoring */}
      {match.status !== 'completed' && !isMatchComplete && (
        <div className="card mb-6">
          <h3 className="font-bold mb-4 text-center">Game {games.length + 1}</h3>
          {match.status === 'scheduled' ? (
            <div className="text-center">
              <button onClick={startMatch} className="bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-green-700">
                Start Match
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="text-center flex-1">
                <div className="text-6xl font-bold text-squash-dark mb-4">{currentGame.p1}</div>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => addPoint('p1')}
                    className="bg-squash-primary text-white w-16 h-16 rounded-full text-2xl font-bold hover:opacity-90 active:scale-95 transition-transform">
                    +
                  </button>
                  <button onClick={() => removePoint('p1')}
                    className="bg-gray-200 text-gray-700 w-12 h-12 rounded-full text-xl hover:bg-gray-300 active:scale-95 transition-transform">
                    −
                  </button>
                </div>
              </div>
              <div className="text-3xl text-gray-300 font-bold">:</div>
              <div className="text-center flex-1">
                <div className="text-6xl font-bold text-squash-dark mb-4">{currentGame.p2}</div>
                <div className="flex gap-2 justify-center">
                  <button onClick={() => addPoint('p2')}
                    className="bg-squash-primary text-white w-16 h-16 rounded-full text-2xl font-bold hover:opacity-90 active:scale-95 transition-transform">
                    +
                  </button>
                  <button onClick={() => removePoint('p2')}
                    className="bg-gray-200 text-gray-700 w-12 h-12 rounded-full text-xl hover:bg-gray-300 active:scale-95 transition-transform">
                    −
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Match Complete */}
      {isMatchComplete && match.status !== 'completed' && (
        <div className="card mb-6 bg-green-50 border-green-200">
          <h3 className="text-xl font-bold text-green-700 text-center mb-4">
            Match Complete! {p1GamesWon >= 3 ? 'Player 1' : 'Player 2'} Wins {p1GamesWon}-{p2GamesWon}
          </h3>
          <div className="text-center">
            <button onClick={() => saveScore(true)} disabled={saving}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 disabled:opacity-50">
              {saving ? 'Finalizing...' : 'Finalize Result'}
            </button>
          </div>
        </div>
      )}

      {match.status === 'completed' && (
        <div className="card mb-6 bg-blue-50 border-blue-200 text-center">
          <p className="text-lg font-bold text-blue-700">Match Completed</p>
          <p className="text-blue-600">Final Score: {p1GamesWon} - {p2GamesWon}</p>
        </div>
      )}

      {/* Save Button */}
      {match.status === 'ongoing' && !isMatchComplete && (
        <div className="text-center">
          <button onClick={() => saveScore(false)} disabled={saving}
            className="bg-squash-primary text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Score'}
          </button>
        </div>
      )}
    </div>
  );
}
