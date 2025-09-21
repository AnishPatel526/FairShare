import React, { useContext, useEffect, useState } from 'react';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
import ParticipantList from './components/ParticipantList';
import AddParticipantForm from './components/AddParticipantForm';
import ExpenseList from './components/ExpenseList';
import AddExpenseForm from './components/AddExpenseForm';
import Summary from './components/Summary';
import api from './services/api';

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const STORAGE_KEY = 'expense-splitter-local-data';

function readLocalData() {
  if (typeof window === 'undefined') {
    return { participants: [], expenses: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { participants: [], expenses: [] };
    const parsed = JSON.parse(raw);
    return {
      participants: Array.isArray(parsed.participants) ? parsed.participants : [],
      expenses: Array.isArray(parsed.expenses) ? parsed.expenses : [],
    };
  } catch (err) {
    console.error('Failed to read local data', err);
    return { participants: [], expenses: [] };
  }
}

const normaliseId = (value) => {
  if (value === null || value === undefined) return '';
  return typeof value === 'number' ? String(value) : value;
};

function computeSummary(participants, expenses) {
  const summary = {};
  participants.forEach((p) => {
    const id = normaliseId(p.id);
    summary[id] = 0;
  });
  expenses.forEach((exp) => {
    const amount = Number(exp.amount) || 0;
    if (!Array.isArray(exp.participants) || exp.participants.length === 0) {
      return;
    }
    const share = amount / exp.participants.length;
    exp.participants.forEach((participantId) => {
      const pid = normaliseId(participantId);
      summary[pid] = (summary[pid] || 0) - share;
    });
    const payer = normaliseId(exp.paidBy);
    summary[payer] = (summary[payer] || 0) + amount;
  });
  return summary;
}

const persistLocalData = (participants, expenses) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ participants, expenses })
    );
  } catch (err) {
    console.error('Failed to persist local data', err);
  }
};

function AppContent() {
  const { theme, toggleTheme } = useContext(ThemeContext);
  // State for participants, expenses and summary
  const [participants, setParticipants] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({});
  const [isOffline, setIsOffline] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Load initial data
  useEffect(() => {
    async function fetchData() {
      try {
        const [pList, eList, s] = await Promise.all([
          api.getParticipants(),
          api.getExpenses(),
          api.getSummary(),
        ]);
        setParticipants(pList);
        setExpenses(eList);
        setSummary(s);
        setIsOffline(false);
        setStatusMessage('');
      } catch (err) {
        console.error(err);
        const local = readLocalData();
        setParticipants(local.participants);
        setExpenses(local.expenses);
        const localSummary = computeSummary(local.participants, local.expenses);
        setSummary(localSummary);
        setIsOffline(true);
        setStatusMessage('Could not reach the server. Working offline with data saved in this browser.');
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    persistLocalData(participants, expenses);
  }, [participants, expenses]);

  useEffect(() => {
    if (isOffline) {
      const localSummary = computeSummary(participants, expenses);
      setSummary(localSummary);
    }
  }, [isOffline, participants, expenses]);

  // Handlers for adding participant and expense
  const handleAddParticipant = async (name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const createLocalParticipant = () => ({
      id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: trimmed,
    });

    if (isOffline) {
      const localParticipant = createLocalParticipant();
      setParticipants((prev) => [...prev, localParticipant]);
      setStatusMessage('Offline mode: participants are saved locally on this device.');
      return;
    }

    try {
      const newP = await api.addParticipant({ name: trimmed });
      setParticipants((prev) => [...prev, newP]);
      setStatusMessage('');
    } catch (err) {
      console.error(err);
      const localParticipant = createLocalParticipant();
      setParticipants((prev) => [...prev, localParticipant]);
      setIsOffline(true);
      setStatusMessage('Server is unreachable. Added participant locally so you can keep working.');
    }
  };

  const handleAddExpense = async (expenseData) => {
    const normalisedExpense = {
      ...expenseData,
      amount: Number(expenseData.amount),
      participants: expenseData.participants.map((id) => normaliseId(id)),
      paidBy: normaliseId(expenseData.paidBy),
    };
    const createLocalExpense = () => ({
      ...normalisedExpense,
      id: `local-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
    });

    if (isOffline) {
      const localExpense = createLocalExpense();
      setExpenses((prev) => [...prev, localExpense]);
      setStatusMessage('Offline mode: expenses update totals locally.');
      return;
    }

    try {
      const newExp = await api.addExpense(normalisedExpense);
      setExpenses((prev) => [...prev, newExp]);
      const s = await api.getSummary();
      setSummary(s);
      setStatusMessage('');
    } catch (err) {
      console.error(err);
      const localExpense = createLocalExpense();
      setExpenses((prev) => [...prev, localExpense]);
      setIsOffline(true);
      setStatusMessage('Server is unreachable. Logged the expense locally and updated balances.');
    }
  };

  const removeParticipantFromState = (id) => {
    const idToRemove = normaliseId(id);
    if (!idToRemove) return;

    setParticipants((prev) => prev.filter((p) => normaliseId(p.id) !== idToRemove));
    setExpenses((prev) =>
      prev.reduce((acc, exp) => {
        const payerId = normaliseId(exp.paidBy);
        if (payerId === idToRemove) {
          return acc;
        }
        const participantIds = Array.isArray(exp.participants) ? exp.participants : [];
        const filtered = participantIds.filter((pid) => normaliseId(pid) !== idToRemove);
        if (!filtered.length) {
          return acc;
        }
        if (filtered.length === participantIds.length) {
          acc.push(exp);
        } else {
          acc.push({ ...exp, participants: filtered });
        }
        return acc;
      }, [])
    );
  };

  const handleRemoveParticipant = async (id) => {
    const idToRemove = normaliseId(id);
    if (!idToRemove) return;

    if (isOffline) {
      removeParticipantFromState(idToRemove);
      setStatusMessage('Offline mode: removed participant locally.');
      return;
    }

    try {
      await api.removeParticipant(idToRemove);
      removeParticipantFromState(idToRemove);
      const s = await api.getSummary();
      setSummary(s);
      setStatusMessage('');
    } catch (err) {
      console.error(err);
      removeParticipantFromState(idToRemove);
      setIsOffline(true);
      setStatusMessage('Server is unreachable. Removed participant locally.');
    }
  };

  return (
    <div className="app-container" data-theme={theme}>
      <header className="app-header">
        <div className="app-header__titles">
          <h1>Expense Splitter</h1>
          <p className="app-subtitle">Track group spending and settle up with confidence.</p>
        </div>
        <button className="theme-toggle" type="button" onClick={toggleTheme}>
          {theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        </button>
      </header>
      {statusMessage ? (
        <div className={`status-banner${isOffline ? ' status-banner--warning' : ''}`}>
          {statusMessage}
        </div>
      ) : null}
      <main className="content-grid">
        <section className="panel participants-section">
          <div className="section-heading">
            <h2>Participants</h2>
            <p className="section-subtitle">Add everyone involved so expenses stay fair.</p>
          </div>
          <AddParticipantForm onAdd={handleAddParticipant} />
          <ParticipantList participants={participants} onRemove={handleRemoveParticipant} />
        </section>
        <section className="panel expenses-section">
          <div className="section-heading">
            <h2>Expenses</h2>
            <p className="section-subtitle">Log purchases and choose who split each cost.</p>
          </div>
          <AddExpenseForm
            participants={participants}
            onAdd={handleAddExpense}
          />
          <ExpenseList
            expenses={expenses}
            participants={participants}
          />
        </section>
        <section className="panel summary-section">
          <div className="section-heading">
            <h2>Summary</h2>
            <p className="section-subtitle">See who owes and who gets reimbursed at a glance.</p>
          </div>
          <Summary summary={summary} participants={participants} />
        </section>
      </main>
    </div>
  );
}
