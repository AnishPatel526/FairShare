import React, { useState } from 'react';

export default function AddParticipantForm({ onAdd }) {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="participant-form">
      <input
        type="text"
        placeholder="Add participant"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <button type="submit">Add</button>
    </form>
  );
}