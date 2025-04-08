const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const app = express();
const port = 5000;

app.use(express.json());

let users = [];  // This is a mock database. Replace with actual DB in production.
let items = ["Item1", "Item2", "Item3", "Item4"];  // List of available items for gacha

// Register Route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(400).send("Username and Password are required!");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = { username, password: hashedPassword };
  users.push(newUser);
  res.status(201).send("User registered successfully!");
});

// Login Route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).send("User not found!");

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).send("Incorrect password!");

  const token = jwt.sign({ username: user.username }, 'secretKey');
  res.json({ token });
});

// Gacha Route
app.post('/gacha', (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, 'secretKey');
    const randomItem = items[Math.floor(Math.random() * items.length)];
    res.json({ item: randomItem });
  } catch (error) {
    res.status(401).send("Invalid token");
  }
});

// Admin Route to add/remove tokens (Mock)
app.post('/admin/token', (req, res) => {
  // Implement admin token functionality (Add or Remove tokens for users)
  res.send('Admin token functionality');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
