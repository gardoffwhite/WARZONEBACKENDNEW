const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

let users = [];
let itemLogs = [];
let tokenStore = {};
let itemRates = {
  "Sword": 50,
  "Shield": 30,
  "Legendary Helmet": 20
};

function randomItem() {
  const items = Object.entries(itemRates);
  const totalWeight = items.reduce((sum, [_, rate]) => sum + rate, 0);
  let rand = Math.random() * totalWeight;
  for (let [item, rate] of items) {
    if (rand < rate) return item;
    rand -= rate;
  }
  return null;
}

// Register
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: 'User already exists' });
  }
  users.push({ username, password });
  tokenStore[username] = 0;
  res.status(201).json({ message: 'Registered successfully' });
});

// Login
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ user: { username } });
});

// Add token (admin)
app.post('/api/admin/token', (req, res) => {
  const { username, amount } = req.body;
  if (!tokenStore[username]) tokenStore[username] = 0;
  tokenStore[username] += amount;
  res.json({ tokens: tokenStore[username] });
});

// Update item rates (admin)
app.post('/api/admin/rates', (req, res) => {
  itemRates = req.body;
  res.json({ message: 'Rates updated' });
});

// Get logs (admin)
app.get('/api/admin/logs', (req, res) => {
  res.json(itemLogs);
});

// Roll item
app.post('/api/roll', (req, res) => {
  const { username, characterName } = req.body;
  if (!tokenStore[username] || tokenStore[username] <= 0) {
    return res.status(400).json({ error: 'Not enough tokens' });
  }
  const item = randomItem();
  tokenStore[username] -= 1;
  itemLogs.push({ username, characterName, item, timestamp: new Date() });
  res.json({ item });
});

// Get user tokens
app.get('/api/tokens/:username', (req, res) => {
  const { username } = req.params;
  res.json({ tokens: tokenStore[username] || 0 });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
