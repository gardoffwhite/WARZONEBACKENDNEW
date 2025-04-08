// index.js
require('dotenv').config();  // โหลด Environment Variables

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

// ตั้งค่า JSON parser และ CORS
app.use(bodyParser.json());
app.use(cors());

// Simulate User Database (ควรใช้ฐานข้อมูลจริงในโปรเจกต์จริง)
let users = require('./data/users.json');

// โหลด Secret Key สำหรับ JWT
const JWT_SECRET = process.env.JWT_SECRET;

// Mock Authentication (ล็อกอิน)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (users[username] && users[username].password === password) {
        return res.json({ token: 'dummy-jwt-token', message: 'Login successful' });
    }

    return res.status(401).json({ message: 'Invalid username or password' });
});

// Route เพิ่ม token สำหรับ admin
app.post('/api/admin/token', (req, res) => {
    const { username, target, amount } = req.body;

    if (!(username && users[username]?.isAdmin)) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    if (!users[target]) return res.status(404).json({ error: 'User not found' });

    users[target].tokens += amount;
    saveUsers(); // Save to file
    res.json({ success: true });
});

// ฟังก์ชันบันทึกผู้ใช้กลับไปยังไฟล์
function saveUsers() {
    fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
}

// ตั้งค่า PORT และเริ่มเซิร์ฟเวอร์
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
