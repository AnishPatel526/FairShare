import React from 'react';

export default function ParticipantList({ participants = [], onRemove }) {
  if (!participants.length) {
    return <p className="empty-state">No participants yet. Add a name to start splitting.</p>;
  }

  const handleRemove = (id) => {
    if (typeof onRemove === 'function') {
      onRemove(id);
    }
  };

  return (
    <ul className="participant-list">
      {participants.map((p) => (
        <li key={p.id}>
          <span className="participant-bullet" aria-hidden="true" />
          <span className="participant-name">{p.name}</span>
          <button
            type="button"
            className="participant-remove"
            onClick={() => handleRemove(p.id)}
            aria-label={`Remove ${p.name}`}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
