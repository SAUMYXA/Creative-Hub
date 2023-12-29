export {}

const mongoose = require('mongoose');

var ProductDesignSchema = new mongoose.Schema({
    images3dURL: [{
        type: String,
    }],
    UID : {
        type : String,
    },

    colour_available: [{
        type: String,
    }],
    cloth_category: {
        type: String,
    },
    fabric_available: [{
        type: String,
    }],

} , {
    timestamps: true
})

const productsdesignDB = mongoose.model('products-design', ProductDesignSchema);

module.exports = productsdesignDB;