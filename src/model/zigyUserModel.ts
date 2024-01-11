const mongoose = require('mongoose');
var zigyUserSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: Number,
        required: true,
        unique: true
    },

    product:[{
        productId:{
            type: String
        },
        designUrl: {
            type: String
        }
    }]
    
    
}, {
    timestamps: true
})

const zigyUserDB = mongoose.model('zigyUserDB', zigyUserSchema);

module.exports = zigyUserDB;
