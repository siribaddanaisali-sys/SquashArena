import React, { useState, useEffect } from 'react';

export default function Tournaments() {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await fetch('/api/tournaments');
        const data = await response.json();
        setTournaments(data);
      } catch (error) {
        console.error('Failed to fetch tournaments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTournaments();
  }, []);

  if (loading) return <div className="text-center py-12">Loading tournaments...</div>;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Tournaments</h1>
      <div className="space-y-4">
        {tournaments.map(tournament => (
          <div key={tournament.id} className="card">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">{tournament.name}</h2>
                <p className="text-gray-600 mt-2">{tournament.description}</p>
                <div className="flex gap-4 mt-4 text-sm">
                  <span><strong>Category:</strong> {tournament.category}</span>
                  <span><strong>Location:</strong> {tournament.location}</span>
                  <span><strong>Status:</strong> <span className="text-squash-primary">{tournament.status}</span></span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-squash-secondary">{tournament.registeredParticipants}/{tournament.maxParticipants}</p>
                <p className="text-sm text-gray-600">Participants</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
