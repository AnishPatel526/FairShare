# Expense Splitter

This web application helps you and your friends or roommates track shared expenses and settle up easily.  It was designed as a moderately complex sophomore‑level project to demonstrate full‑stack development skills without becoming overwhelming.  The app allows you to add participants, log expenses, and see who owes whom at a glance.  A dark mode toggle and modern styling make it look polished while still approachable.

## Features

* **Participants management** – add the names of people who will share expenses.  Participants are stored in memory for simplicity; you could extend this to a database.
* **Expense tracking** – log an expense with a description, total amount, the person who paid, and the people who benefited.  Expenses are split evenly among all selected participants.
* **Balance summary** – see a breakdown of how much each participant owes or is owed based on all recorded expenses.
* **Dark mode** – switch between light and dark themes using the toggle in the header.  The UI uses CSS variables to make theming straightforward.
* **Clean UI** – responsive cards and forms provide a pleasant experience without relying on heavyweight UI frameworks.

## Tech Stack

* **Frontend:** React, React Router, Webpack, CSS modules
* **Backend:** Node.js, Express
* **State:** In‑memory arrays on the server side; no database is required for the basic functionality, but hooks for a database are easy to add

## Getting Started

These steps assume you have Node.js and npm installed on your machine.  Clone or download the repository, then from the project root:

```bash
cd expense-splitter/backend
npm install
npm start
```

In another terminal tab:

```bash
cd expense-splitter/frontend
npm install
npm start
```

The frontend will launch at `http://localhost:3000` and the backend API will run on `http://localhost:5000`.  The frontend proxy in `webpack.config.js` redirects API requests to the backend during development.

## Next Steps

Here are a few ideas for extending this project:

* **Persistent storage:** Replace the in‑memory arrays with a real database such as PostgreSQL or SQLite.  Update the routes accordingly.
* **User authentication:** Add login and authentication so participants have their own accounts and balances persist across sessions.
* **Payment integration:** Integrate with a payment provider (e.g. Stripe or PayPal) to allow users to settle up directly in the app.
* **Better UX:** Add drag‑and‑drop reordering of expenses, more detailed filtering and sorting, or data visualisations.
