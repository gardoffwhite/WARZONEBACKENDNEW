const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Item = require('../models/Item');
const Log = require('../models/Log');
const User = require('../models/User');

function adminAuth(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err || user.role !== 'admin') return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// Get logs of draws
router.get('/logs', adminAuth, async (req, res) => {
  const logs = await Log.find().populate('userId itemId').sort({ timestamp: -1 });
  res.json(logs);
});

// Get all items
router.get('/items', adminAuth, async (req, res) => {
  const items = await Item.find();
  res.json(items);
});

// Add or update an item
router.post('/items', adminAuth, async (req, res) => {
  const { id, name, rate } = req.body;
  let item;
  if (id) {
    item = await Item.findByIdAndUpdate(id, { name, rate }, { new: true });
  } else {
    item = new Item({ name, rate });
    await item.save();
  }
  res.json(item);
});

// Delete an item
router.delete('/items/:id', adminAuth, async (req, res) => {
  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: 'Item deleted' });
});

module.exports = router;