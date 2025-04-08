const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Item = require('../models/Item');
const Log = require('../models/Log');

function auth(req, res, next) {
  const header = req.headers['authorization'];
  const token = header && header.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

router.post('/draw', auth, async (req, res) => {
  const { characterName } = req.body;
  const user = await User.findById(req.user.id);
  if (!user || user.tokens <= 0) return res.status(400).json({ message: 'Not enough tokens' });

  const items = await Item.find();
  const roll = Math.random();
  let sum = 0;
  let drawnItem = null;

  for (const item of items) {
    sum += item.rate;
    if (roll <= sum) {
      drawnItem = item;
      break;
    }
  }

  if (!drawnItem) return res.status(500).json({ message: 'Item draw failed' });

  user.tokens -= 1;
  await user.save();

  await Log.create({ userId: user._id, itemId: drawnItem._id, characterName });
  res.json({ item: drawnItem });
});

module.exports = router;