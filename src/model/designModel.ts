export {};
const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel",
      },
      
apparel:String,
size:String,
fabric:String,
color:String,
gender:String,
  text1: String,
  text2: String,
  text3: String, 
  text4: String,
  photos: [String], 
 BaseProduct : {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BaseProduct",
},
});

module.exports = mongoose.model('Design', designSchema);