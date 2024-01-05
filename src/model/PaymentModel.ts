export {};

// const mongoose = require("mongoose")

// const paymentschema = new mongoose.Schema(
//     {
//         razorpay_order_id: {
//             type: String,
//             required: true,
//         },
//         razorpay_payment_id: {
//             type: String,
//             required:true,
//         },
//         razorpay_signature: {
//             type: String,
//             required: true,
//         },

//         userid: {
//             type: String,
//             required:true,
//             ref: "userModel",
//         }
//     }
// );
// const Payment = mongoose.model("Payment", paymentschema)

// module.exports = Payment;

const mongoose = require("mongoose");

const allOrdersSchema = new mongoose.Schema({
  user_id: String,
  email: String,
  phone: String,
  name: String,
  address: String,
  amount: String,
  method: String,
  coupon: String,
  products: [],
  time: String,
  gift: String,
  orderStatus:String,
  quantity:String,
});

const allOrdersModal = new mongoose.model("allOrdersModal", allOrdersSchema);
module.exports = allOrdersModal ;
