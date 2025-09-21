import React from 'react';

export default function ExpenseList({ expenses = [], participants = [] }) {
  const getName = (id) => participants.find((p) => p.id === id)?.name || 'Unknown';
  return (
    <ul className="expense-list">
      {expenses.map((exp) => (
        <li key={exp.id} className="expense-item">
          <div className="expense-header">
            <span className="expense-description">{exp.description}</span>
            <span className="expense-amount">${exp.amount.toFixed(2)}</span>
          </div>
          <div className="expense-meta">
            <small>Paid by: {getName(exp.paidBy)}</small>
            <small>
              Split between: {exp.participants.map((pid) => getName(pid)).join(', ')}
            </small>
          </div>
        </li>
      ))}
    </ul>
  );
}