export {};

const mongoose = require('mongoose');

var categorySchema = new mongoose.Schema({
    name: {
        type: String,
        // required: true
    },
    imageNames: [{
      type: String,
      // required: true
    }],
    imageUrls: [{
        type: String,
        // required: true,
    }],
    fabric_available: [{
        type: String,
    }],

}, {
    timestamps: true
})
const CategoryDB = mongoose.model('Category', categorySchema);

module.exports = CategoryDB;
