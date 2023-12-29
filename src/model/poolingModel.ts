export {};
const mongoose = require('mongoose');

const poolSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the user who created the pool
  },
  product: {
    // type:String,
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product', // Reference to the product being pooled
  },
  minOrders: {
    type: Number,
    required: true,
  },
  timeDuration: {
    type: Number, // Specify the time duration in milliseconds or another suitable format
    required: true,
  },
  lockInAmount: {
    type: Number, // Minimum amount to enter the pool
    required: true,
  },
  totalProductPrice: {
    type: Number,
    required: true,
  },
  currentPool: {
    type: Number,
    // required: true,
  },
  startDatetime: {
    type: Date,
    default: Date.now,
  },
  endDatetime: {
    type: Date,
    // Calculate the end date based on the timeDuration and startDatetime
  },
  poolDiscount:{
   type:Number,
  },
  poolAmount:{
    type:Number
  },
  payLater:{
    type:Number
  },
  participants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the users participating in the pool
      },
      // contribution: {
      //   type: Number,
      // },
    },
  ],
  status: {
    type: String, // You can use this field to track the status (e.g., 'open', 'closed')
    default: 'open',
  },
});

const Pool = mongoose.model('Pool', poolSchema);

module.exports = Pool;