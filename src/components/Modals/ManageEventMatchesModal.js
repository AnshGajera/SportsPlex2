import React, { useState } from 'react';

const ManageEventMatchesModal = ({ isOpen, onClose, event, matches, onAddMatch }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    date: '',
    teams: '',
    round: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddMatch(form);
    setForm({ name: '', date: '', teams: '', round: '' });
    setShowForm(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Manage Matches for {event?.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg">&times;</button>
        </div>
        <div className="space-y-4">
          {matches && matches.length > 0 ? (
            <div className="space-y-3">
              {matches.map((match, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-4 flex justify-between items-center border">
                  <div>
                    <div className="font-semibold text-gray-800">{match.name}</div>
                    <div className="text-sm text-gray-500">{match.round} &middot; {match.teams}</div>
                    <div className="text-xs text-gray-400">{match.date}</div>
                  </div>
                  {/* Edit/Delete buttons can go here */}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-center">No matches added yet.</div>
          )}
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700"
        >
          {showForm ? 'Cancel' : 'Add Match'}
        </button>
        {showForm && (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Match Name"
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:outline-none"
              required
            />
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:outline-none"
              required
            />
            <input
              type="text"
              name="teams"
              value={form.teams}
              onChange={handleChange}
              placeholder="Teams (e.g. Team A vs Team B)"
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:outline-none"
              required
            />
            <input
              type="text"
              name="round"
              value={form.round}
              onChange={handleChange}
              placeholder="Round (e.g. Semi Final)"
              className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700"
            >
              Save Match
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ManageEventMatchesModal;
