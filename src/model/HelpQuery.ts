export {};
const mongoose = require('mongoose');


const helpQuerySchema = new mongoose.Schema({
  name: String,
  email: String,
  query: String,
  timestamp: { type: Date, default: Date.now },
});

const HelpQuery = mongoose.model('HelpQuery', helpQuerySchema);
