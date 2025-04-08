const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  tokens: { type: Number, default: 10 },
  role: { type: String, default: 'user' }
});
module.exports = mongoose.model('User', userSchema);