const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Mock Database (เพิ่มผู้ใช้ตัวอย่าง)
let users = [
  { username: 'testuser', password: '$2b$10$R4sfMkZlL5S6FAsfu1FhmuTz/U9m4QklFwDIsI6f8W7kQbwpLgfuG' } // password: 'testpassword'
];

// Register Route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
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
    const items = ["Item1", "Item2", "Item3", "Item4"];
    const randomItem = items[Math.floor(Math.random() * items.length)];
    res.json({ item: randomItem });
  } catch (error) {
    res.status(401).send("Invalid token");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
