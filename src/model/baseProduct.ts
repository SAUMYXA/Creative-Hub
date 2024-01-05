export{}
const mongoose = require('mongoose');
const BaseProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    size: {
        type: String,
        required: true,
    },
    fabric: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    // Add any other design-related fields you need
});

const BaseProduct = mongoose.model('BaseProduct', BaseProductSchema);

module.exports = BaseProduct;
