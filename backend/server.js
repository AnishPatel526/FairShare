const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In‑memory data stores
const participants = [];
const expenses = [];

// Helper to compute balances
function computeSummary() {
  const summary = {};
  participants.forEach((p) => {
    summary[p.id] = 0;
  });
  // For each expense, split amount evenly among participants selected
  expenses.forEach((exp) => {
    const share = exp.amount / exp.participants.length;
    exp.participants.forEach((participantId) => {
      // Participant owes share
      summary[participantId] -= share;
    });
    // Payer paid total
    summary[exp.paidBy] += exp.amount;
  });
  return summary;
}

// Participants routes
app.get('/api/participants', (req, res) => {
  res.json(participants);
});

app.post('/api/participants', (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const newParticipant = { id: uuidv4(), name: name.trim() };
  participants.push(newParticipant);
  res.status(201).json(newParticipant);
});

app.delete('/api/participants/:id', (req, res) => {
  const { id } = req.params;
  const index = participants.findIndex((p) => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Participant not found' });
  }

  participants.splice(index, 1);

  for (let i = expenses.length - 1; i >= 0; i -= 1) {
    const expense = expenses[i];
    if (expense.paidBy === id) {
      expenses.splice(i, 1);
      continue;
    }
    const updatedParticipants = expense.participants.filter((pid) => pid !== id);
    if (!updatedParticipants.length) {
      expenses.splice(i, 1);
    } else if (updatedParticipants.length !== expense.participants.length) {
      expenses[i] = { ...expense, participants: updatedParticipants };
    }
  }

  res.status(204).end();
});

// Expenses routes
app.get('/api/expenses', (req, res) => {
  res.json(expenses);
});

app.post('/api/expenses', (req, res) => {
  const { description, amount, paidBy, participants: participantIds } = req.body;
  if (!description || typeof amount !== 'number' || !paidBy || !Array.isArray(participantIds) || participantIds.length === 0) {
    return res.status(400).json({ error: 'Invalid expense data' });
  }
  const expense = {
    id: uuidv4(),
    description: description.trim(),
    amount,
    paidBy,
    participants: participantIds,
    createdAt: new Date().toISOString()
  };
  expenses.push(expense);
  res.status(201).json(expense);
});

// Summary route
app.get('/api/summary', (req, res) => {
  const summary = computeSummary();
  res.json(summary);
});

app.listen(PORT, () => {
  console.log(`Expense splitter backend running on port ${PORT}`);
});
