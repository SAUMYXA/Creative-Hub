export {};
const mongoose = require('mongoose');

const adminfor3DSchema = new mongoose.Schema({
  apparel: String, // Add a field to store the section tag
  photo1: String, // URL for the first image
});
module.exports = mongoose.model('images3D', adminfor3DSchema);
