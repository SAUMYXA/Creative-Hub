export {};

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
    },
    productID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductModle",
    },
    price: {
        type: String,
    },
    colour: {
        type: String,
    },
    fabric: {
        type: String,
    },
    quantity: {
        type: Number
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
    },
    orderDate: {
      type: Date,
      default: Date.now,
    },
    userAddress: {
        type:String
    },
    isCanceled: {
      type: Boolean,
      default: false, // Adjust the default value based on your logic
    },

  },
  {
    timestamps: true,
  }
);

const OrderDB = mongoose.model("Order", orderSchema);

module.exports = OrderDB;
