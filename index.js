
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const SECRET = process.env.JWT_SECRET || 'supersecret';

const users = [
  { id: 1, username: "admin", password: bcrypt.hashSync("admin123", 10), isAdmin: true, tokens: 100 }
];
const items = [
  { id: 1, name: "ดาบเทพ", image: "https://i.imgur.com/RMBlZ0L.png", rate: 0.1 },
  { id: 2, name: "หมวกหายาก", image: "https://i.imgur.com/IQFuwl7.png", rate: 0.2 },
  { id: 3, name: "ยาฟื้นพลัง", image: "https://i.imgur.com/w1URbXk.png", rate: 0.7 }
];
const logs = [];

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.sendStatus(401);
  const token = auth.split(" ")[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch {
    res.sendStatus(403);
  }
}

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ username: user.username, id: user.id, isAdmin: user.isAdmin }, SECRET);
    res.json({ token, user: { username: user.username, isAdmin: user.isAdmin } });
  } else {
    res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
  }
});

app.post("/api/gacha", authMiddleware, (req, res) => {
  const user = users.find(u => u.username === req.user.username);
  if (!user || user.tokens <= 0) return res.status(403).json({ error: "Token ไม่พอ" });

  const rand = Math.random();
  let acc = 0;
  let item;
  for (let i of items) {
    acc += i.rate;
    if (rand <= acc) {
      item = i;
      break;
    }
  }
  user.tokens -= 1;
  logs.push({ user: user.username, item: item.name, time: new Date() });
  res.json(item);
});

app.get("/api/logs", authMiddleware, (req, res) => {
  if (!req.user.isAdmin) return res.sendStatus(403);
  res.json(logs);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log("Server running on port " + PORT));
