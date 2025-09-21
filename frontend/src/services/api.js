const API_BASE = '/api';

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(errorText || 'API error');
  }

  if (res.status === 204) {
    return null;
  }

  const text = await res.text();
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error('Failed to parse API response', err);
    throw err;
  }
}

const api = {
  getParticipants: () => request(`${API_BASE}/participants`),
  addParticipant: (data) =>
    request(`${API_BASE}/participants`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  removeParticipant: (id) =>
    request(`${API_BASE}/participants/${id}`, {
      method: 'DELETE',
    }),
  getExpenses: () => request(`${API_BASE}/expenses`),
  addExpense: (data) =>
    request(`${API_BASE}/expenses`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getSummary: () => request(`${API_BASE}/summary`),
};

export default api;
