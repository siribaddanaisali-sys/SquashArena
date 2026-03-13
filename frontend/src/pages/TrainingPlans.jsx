import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function TrainingPlans() {
  const { user } = useAuth();
  const isCoach = user?.role === 'coach';
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [coachPlayers, setCoachPlayers] = useState([]);
  const [form, setForm] = useState({
    playerId: '', title: '', description: '', category: 'general',
    startDate: '', endDate: '', exercises: '',
  });

  useEffect(() => {
    fetchPlans();
    if (isCoach) fetchCoachPlayers();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const endpoint = isCoach ? '/training-plans/coach' : '/training-plans/player';
      const data = await api.get(endpoint);
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoachPlayers = async () => {
    try {
      const data = await api.get('/dashboard/coach');
      setCoachPlayers(data.players || []);
    } catch {
      // silently fail
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const exerciseList = form.exercises
        ? form.exercises.split('\n').filter(e => e.trim()).map(e => e.trim())
        : [];

      await api.post('/training-plans', {
        ...form,
        exercises: exerciseList,
      });
      setShowForm(false);
      setForm({ playerId: '', title: '', description: '', category: 'general', startDate: '', endDate: '', exercises: '' });
      fetchPlans();
    } catch (err) {
      setError(err.message);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/training-plans/${id}`, { status });
      fetchPlans();
    } catch (err) {
      setError(err.message);
    }
  };

  const deletePlan = async (id) => {
    try {
      await api.delete(`/training-plans/${id}`);
      fetchPlans();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="text-center py-12">Loading training plans...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">📋 Training Plans</h1>
        {isCoach && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary">
            {showForm ? 'Cancel' : '+ Create Plan'}
          </button>
        )}
      </div>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      {showForm && isCoach && (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Create Training Plan</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select className="input-field" value={form.playerId} onChange={e => setForm({ ...form, playerId: e.target.value })} required>
              <option value="">Select Player...</option>
              {coachPlayers.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <input className="input-field" placeholder="Plan Title *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
            <select className="input-field" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              <option value="general">General</option>
              <option value="technical">Technical</option>
              <option value="fitness">Fitness</option>
              <option value="mental">Mental</option>
              <option value="tactical">Tactical</option>
            </select>
            <input className="input-field" type="date" placeholder="Start Date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
            <input className="input-field" type="date" placeholder="End Date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
            <textarea className="input-field md:col-span-2" rows="2" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            <textarea className="input-field md:col-span-2" rows="4" placeholder="Exercises (one per line)&#10;e.g. Front court drives x50&#10;Ghosting patterns 15 min&#10;Boast and drive drill" value={form.exercises} onChange={e => setForm({ ...form, exercises: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary mt-4">Create Plan</button>
        </form>
      )}

      {plans.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600">No training plans found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plans.map(plan => (
            <div key={plan.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold">{plan.title}</h3>
                  <p className="text-sm text-gray-600">
                    {isCoach
                      ? `Player: ${plan.player?.User?.firstName} ${plan.player?.User?.lastName}`
                      : `Coach: ${plan.coach?.User?.firstName} ${plan.coach?.User?.lastName}`
                    }
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`text-xs px-2 py-1 rounded capitalize ${
                    plan.category === 'fitness' ? 'bg-orange-100 text-orange-800' :
                    plan.category === 'technical' ? 'bg-blue-100 text-blue-800' :
                    plan.category === 'mental' ? 'bg-purple-100 text-purple-800' :
                    plan.category === 'tactical' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {plan.category}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    plan.status === 'active' ? 'bg-green-100 text-green-800' :
                    plan.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {plan.status}
                  </span>
                </div>
              </div>

              {plan.description && <p className="text-gray-600 text-sm mb-3">{plan.description}</p>}

              <div className="text-sm text-gray-500 mb-3">
                📅 {new Date(plan.startDate).toLocaleDateString()}
                {plan.endDate && ` — ${new Date(plan.endDate).toLocaleDateString()}`}
              </div>

              {plan.exercises && (Array.isArray(plan.exercises) ? plan.exercises : (() => { try { return JSON.parse(plan.exercises); } catch { return []; } })()).length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-2">Exercises:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {(Array.isArray(plan.exercises) ? plan.exercises : (() => { try { return JSON.parse(plan.exercises); } catch { return []; } })()).map((ex, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="text-green-500">✓</span> {ex}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {isCoach && (
                <div className="border-t pt-3 mt-3 flex gap-2">
                  {plan.status === 'active' && (
                    <button onClick={() => updateStatus(plan.id, 'completed')} className="text-sm text-green-600 hover:underline">Mark Complete</button>
                  )}
                  <button onClick={() => deletePlan(plan.id)} className="text-sm text-red-600 hover:underline">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
