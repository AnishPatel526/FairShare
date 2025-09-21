import React, { useState, useEffect } from 'react';

export default function AddExpenseForm({ participants = [], onAdd }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);

  useEffect(() => {
    if (participants.length === 0) {
      setPaidBy('');
      setSelectedParticipants([]);
      return;
    }
    setPaidBy((prev) => {
      const exists = participants.some((p) => String(p.id) === String(prev));
      return exists ? prev : String(participants[0].id);
    });
    setSelectedParticipants((prev) => {
      if (!prev.length) {
        return participants.map((p) => String(p.id));
      }
      const validIds = participants.map((p) => String(p.id));
      const filtered = prev.filter((id) => validIds.includes(String(id)));
      return filtered.length ? filtered : validIds;
    });
  }, [participants]);

  const handleSplitChange = (event) => {
    const values = Array.from(event.target.selectedOptions).map((option) => option.value);
    setSelectedParticipants(values);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!description.trim() || isNaN(amt) || amt <= 0 || !paidBy || selectedParticipants.length === 0) {
      return;
    }
    onAdd({ description: description.trim(), amount: amt, paidBy, participants: selectedParticipants });
    setDescription('');
    setAmount('');
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <input
        type="text"
        placeholder="Expense description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <input
        type="number"
        step="0.01"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
      />
      <div className="form-row">
        <label>Paid by:</label>
        <select
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
          className="select-control"
        >
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <label htmlFor="split-between">Split between:</label>
        <select
          id="split-between"
          multiple
          className="select-control select-control--multi"
          value={selectedParticipants}
          onChange={handleSplitChange}
          size={Math.min(Math.max(participants.length, 3), 6)}
        >
          {participants.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <p className="hint-text">Hold Ctrl/⌘ to select more than one person.</p>
      </div>
      <button type="submit">Add Expense</button>
    </form>
  );
}
