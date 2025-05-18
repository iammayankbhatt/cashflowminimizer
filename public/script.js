
// === public/script.js ===
const apiBase = 'http://localhost:3000';

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addBtn').addEventListener('click', addExpense);
  document.getElementById('settleBtn').addEventListener('click', settleUp);
  document.getElementById('resetBtn').addEventListener('click', resetAll);
  loadExpenses();
});

async function addExpense() {
  const paidBy = document.getElementById('paidBy').value.trim();
  const amount = parseFloat(document.getElementById('amount').value);
  const description = document.getElementById('description').value.trim();
  const sharedRaw = document.getElementById('sharedAmong').value.trim();
  const sharedAmong = sharedRaw.split(',').map(name => name.trim()).filter(Boolean);

  if (!paidBy || isNaN(amount) || sharedAmong.length === 0) {
    alert('Please fill in all fields correctly');
    return;
  }

  const expense = { paidBy, amount, description, sharedAmong };

  try {
    const res = await fetch(`${apiBase}/add-expense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expense)
    });
    const data = await res.json();
    alert(data.message);

    document.getElementById('paidBy').value = '';
    document.getElementById('amount').value = '';
    document.getElementById('description').value = '';
    document.getElementById('sharedAmong').value = '';

    loadExpenses();
  } catch (err) {
    alert('Error adding expense');
  }
}

async function loadExpenses() {
  try {
    const res = await fetch(`${apiBase}/expenses`);
    const data = await res.json();

    const expenseList = document.getElementById('expenseList');
    expenseList.innerHTML = '';

    data.expenses.forEach((exp, index) => {
      const li = document.createElement('li');
      li.innerHTML = `<strong>${exp.paidBy}</strong> paid ₹${exp.amount} for ${exp.description} (shared among: ${exp.sharedAmong.join(', ')}) 
        <button onclick="editExpense(${index})">Edit</button>`;
      expenseList.appendChild(li);
    });
  } catch (err) {
    console.error('Error loading expenses');
  }
}

async function editExpense(index) {
  const newAmount = prompt('Enter new amount:');
  const newDescription = prompt('Enter new description:');
  const newShared = prompt('Enter new members (comma-separated):');

  const updatedExpense = {
    index,
    amount: parseFloat(newAmount),
    description: newDescription,
    sharedAmong: newShared.split(',').map(name => name.trim())
  };

  const res = await fetch(`${apiBase}/edit-expense`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedExpense)
  });
  const data = await res.json();
  alert(data.message);
  loadExpenses();
}

async function settleUp() {
  try {
    const res = await fetch(`${apiBase}/settle-up`);
    const data = await res.json();

    const resultList = document.getElementById('result');
    resultList.innerHTML = '';

    if (data.settlements.length === 0) {
      resultList.innerHTML = '<li>No settlements needed</li>';
      return;
    }

    data.settlements.forEach(item => {
      const li = document.createElement('li');
      li.textContent = item;
      resultList.appendChild(li);
    });
  } catch (err) {
    alert('Error retrieving settlements');
  }
}

async function resetAll() {
  try {
    const res = await fetch(`${apiBase}/reset`, {
      method: 'POST'
    });
    const data = await res.json();
    alert(data.message);
    document.getElementById('result').innerHTML = '';
    document.getElementById('expenseList').innerHTML = '';
  } catch (err) {
    alert('Error resetting data');
  }
}
