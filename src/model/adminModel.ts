export {};
const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  section: String, // Add a field to store the section tag
  photo1: String, // URL for the first image
  photo2: String, // URL for the second image
});

module.exports = mongoose.model('Admin', adminSchema);