import React, { useMemo } from 'react';
import ExpensePieChart from './ExpensePieChart';

export default function Summary({ summary = {}, participants = [] }) {
  const entries = useMemo(() => Object.entries(summary), [summary]);
  const getName = (id) => {
    const participant = participants.find((p) => p.id === Number(id) || p.id === id);
    return participant?.name || 'Unknown';
  };

  if (!entries.length) {
    return <p className="empty-state">No expenses yet.</p>;
  }

  return (
    <div className="summary-layout">
      <ExpensePieChart summary={summary} participants={participants} />
      <table className="summary-table">
        <thead>
          <tr>
            <th>Participant</th>
            <th>Balance</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(([id, balance]) => (
            <tr key={id}>
              <td>{getName(id)}</td>
              <td className={balance < 0 ? 'negative' : 'positive'}>
                {balance < 0 ? `Owes $${(-balance).toFixed(2)}` : `Gets $${balance.toFixed(2)}`}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
