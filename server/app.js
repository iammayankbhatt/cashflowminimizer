// === server/app.js ===
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

let expenses = [];

app.post('/add-expense', (req, res) => {
  expenses.push(req.body);
  res.json({ message: 'Expense added' });
});

app.get('/expenses', (req, res) => {
  res.json({ expenses });
});

app.put('/edit-expense', (req, res) => {
  const { index, amount, description, sharedAmong } = req.body;
  if (expenses[index]) {
    expenses[index].amount = amount;
    expenses[index].description = description;
    expenses[index].sharedAmong = sharedAmong;
    res.json({ message: 'Expense updated' });
  } else {
    res.status(404).json({ message: 'Expense not found' });
  }
});

app.post('/reset', (req, res) => {
  expenses = [];
  res.json({ message: 'All data reset' });
});

app.get('/settle-up', (req, res) => {
  const balance = {};
  expenses.forEach(({ paidBy, amount, sharedAmong }) => {
    const share = amount / sharedAmong.length;
    sharedAmong.forEach(name => {
      if (name !== paidBy) {
        balance[name]=(balance[name] || 0)-share;
        balance[paidBy] = (balance[paidBy] || 0)+share;
      }
    });
  });

  const people = Object.entries(balance).filter(([_, val]) => val !== 0);
  const debtors = people.filter(([_, val]) => val < 0).map(([name, val]) => [name, -val]);
  const creditors = people.filter(([_, val]) => val > 0);

  const settlements = [];
  while (debtors.length && creditors.length) {
    const [debtor, debt] = debtors[0];
    const [creditor, credit] = creditors[0];
    const amount = Math.min(debt, credit);

    settlements.push(`${debtor} pays ₹${amount.toFixed(2)} to ${creditor}`);

    if (debt > credit) debtors[0][1] -= credit, creditors.shift();
    else if (credit > debt) creditors[0][1] -= debt, debtors.shift();
    else debtors.shift(), creditors.shift();
  }

  res.json({ settlements });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));
