export {};
const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  mediaUrl: String,
  caption: String,
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model('Story', storySchema);
