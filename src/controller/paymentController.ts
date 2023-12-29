// const Razorpay = require('razorpay');
// const Payment = require("../model/PaymentModel")
// const crypto = require('crypto')

// export const instance = new Razorpay({
//     key_id: process.env.RAZORPAY_API_KEY,
//     key_secret: process.env.RAZORPAY_APT_SECRET,
//   });
  

// exports.checkout = async (req:any ,res:any) => {
//     const options = {
//         amount: Number(req.body.amount*100),
//         currency : "INR",
//     };

//     const order = await instance.orders.create(options);

//     res.status(200).json({
//         success : true,
//         order,
//     });
// };


// exports.paymentVerification = async (req:any , res:any) => {
//     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
//     req.body;

//   const body = razorpay_order_id + "|" + razorpay_payment_id;

//   const expectedSignature = crypto
//     .createHmac("sha256", process.env.RAZORPAY_APT_SECRET)
//     .update(body.toString())
//     .digest("hex");

//   const isAuthentic = expectedSignature === razorpay_signature;

//   if (isAuthentic) {
//     // Database comes here

//     await Payment.create({
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       userid : req.user._id
//     });

//     res.json({razorpay_payment_id})
//     res.redirect(
//       `http://localhost:3000/paymentsuccess?reference=${razorpay_payment_id}`
//     );
//   } else {
//     res.status(400).json({
//       success: false,
//     });
//   }
// // }

// const User = require("../model/userModel")
// // const User = require("../database/user.js");
// // const User = require("../model/userModel")
// // const Razorpay = require("razorpay");
// const allOrdersModal = require("../model/PaymentModel");

// let instance = new Razorpay({
//   key_id: process.env.RZP_KEY, // your `KEY_ID`
//   key_secret: process.env.RZP_SECRET, // your `KEY_SECRET`
// });

// // const sendMail = require("./index/sendmail");

// exports.razorpay_get = async function (req:any, res: any, next:any) {
//   const user = req.user;
//   await User.findOne(
//     {
//       _id: req.user._id,
//     },
//     function (err:any, foundUser :any) {
//       if (!err) {
//         const amount = parseInt(
//           foundUser.orders[foundUser.orders.length - 1].amount
//         );
//         res.render("razorpay", {
//           amount: Math.round(amount * 100),
//           name: foundUser.firstName + " " + foundUser.lastName,
//           email: foundUser.username,
//         });
//       } else {
//         res.render("404");
//       }
//     }
//   );
// };

// module.exports.api_payment_orderpost = function (req:any, res:any) {
//   const params = req.body;
//   instance.orders
//     .create(params)
//     .then((data:any) => {
//       res.send({
//         sub: data,
//         status: "success",
//       });
//     })
//     .catch((error:any) => {
//       res.send({
//         sub: error,
//         status: "failed",
//       });
//     });
// };

// module.exports.api_payment_verifypost = function (req : any, res : any, next:any) {
//   const body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
//   var crypto = require("crypto");
//   var expectedSignature = crypto
//     .createHmac("sha256", process.env.RZP_SECRET)
//     .update(body.toString())
//     .digest("hex");
//   console.log("sig" + req.body.razorpay_signature);
//   console.log("sig" + expectedSignature);

//   if (expectedSignature === req.body.razorpay_signature) {
//     response = {
//       payment: "done succesfull",
//     };
//     res.send("Payment done");

//     const user = req.user;
//     const date = new Date().toLocaleString({
//       timezone: "Asia/Kolkata",
//       dateStyle: "full",
//       timeStyle: "full",
//       weekday: "short",
//       month: "narrow",
//     });

//     User.findOne(
//       {
//         _id: req.user._id,
//       },
//       function (err:any, foundUSer:any) {
//         if (err) {
//           res.render("404");
//         } else {
//           if (foundUSer) {
//             let amount = parseInt(
//               foundUSer.orders[foundUSer.orders.length - 1].amount
//             );
//             if (amount >= 1199) {
//               amount = amount - 0.2 * amount;
//             }
//             const newCodOrder = new allOrdersModal({
//               user_id: foundUSer._id,
//               email: foundUSer.username,
//               name: foundUSer.firstName + " " + user.lastName,
//               phone: foundUSer.phoneNo,
//               address: foundUSer.address,
//               amount: amount,
//               method: "Razorpay",
//               coupon: foundUSer.orders[foundUSer.orders.length - 1].coupon,
//               products: foundUSer.orders[foundUSer.orders.length - 1].products,
//               time: date,
//               gift: foundUSer.orders[foundUSer.orders.length - 1].gift,

//               orderStatus: "Your order has been processed",
//             });
//             foundUSer.orders.forEach(function (item: { method: string; }, i: string | number) {
//               if (item.method === "Order Not Confirm") {
//                 // console.log("1"+item);
//                 const orderNot = foundUSer.orders[i]._id;

//                 User.findOneAndUpdate(
//                   {
//                     _id: req.user._id,
//                   },
//                   {
//                     $pull: {
//                       orders: {
//                         _id: orderNot,
//                       },
//                     },
//                   },
//                   function (err:any) {
//                     if (err) {
//                       console.log(err);
//                     } else {
//                     }
//                   }
//                 );
//               }
//             });

//             User.findOneAndUpdate(
//               {
//                 _id: req.user._id,
//               },
//               {
//                 cartu: [],
//               },
//               function (err: any) {
//                 if (err) {
//                   console.log(err);
//                 } else {
//                 }
//               }
//             );

//             const ordersALL = req.user.orders;

//             // sendMail(
//             //   foundUSer.username,
//             //   `Your Order has been placed , Team Zigy`,
//             //   `Method : Razorpay , Pay ${amount} on Delivery`,
//             //   foundUSer.firstName,
//             //   "2"
//             // )
//             //   .then((result) => console.log("Email sent...", result))
//             //   .catch((error) => console.log(error.message));
//             // sendMail(
//             //   process.env.ZIGY_RECIEVE_PURCHASE,
//             //   `${req.user.username} has bought a product from razorpay`,
//             //   `${req.user.username} , ${req.user.firstName} ${
//             //     req.user.lastName
//             //   } , ${
//             //     req.user.phoneNo
//             //   } , has bought a product from razorpay of ${amount} : ${
//             //     ordersALL[ordersALL.length - 1]
//             //   }`,
//             //   `${req.user.firstName},"3"`
//             // );

//             foundUSer.orders.push(newCodOrder);
//             foundUSer.save();
//             newCodOrder.save((err:any) => {
//               if (!err) {
//                 // res.render("paymentDone");
//               } else {
//                 // res.send("Order Not Placed");
//               }
//             });
//           }
//         }
//       }
//     );
//     //  res.send(response);
//   } else {
//     var response = {
//       payment: "failed",
//     };
//     res.send("Payment failed");
//   }
//   next();
// };


// import User from "../model/userModel";
// import Razorpay from "razorpay";
// import allOrdersModal from "../model/PaymentModel";

const User = require('../model/userModel');
const Razorpay = require('razorpay');
const allOrdersModal = require('../model/PaymentModel')

const instance = new Razorpay({
  key_id: process.env.RZP_KEY,
  key_secret: process.env.RZP_SECRET,
});

exports.razorpay_get = async function (req: any, res: any, next: any) {
  const user = req.user;
  await User.findOne(
    {
      _id: req.user._id,
    },
    function (err: any, foundUser: any) {
      if (!err) {
        const amount = parseInt(
          foundUser.orders[foundUser.orders.length - 1].amount
        );
        res.render("razorpay", {
          amount: Math.round(amount * 100),
          name: foundUser.firstName + " " + foundUser.lastName,
          email: foundUser.username,
        });
      } else {
        res.render("404");
      }
    }
  );
};

exports.api_payment_orderpost = function (req: any, res: any) {
  const params = req.body;
  instance.orders
    .create(params)
    .then((data: any) => {
      res.send({
        sub: data,
        status: "success",
      });
    })
    .catch((error: any) => {
      res.send({
        sub: error,
        status: "failed",
      });
    });
};

exports.api_payment_verifypost = function (req: any, res: any, next: any) {
  const body = req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
  var crypto = require("crypto");
  var expectedSignature = crypto
    .createHmac("sha256", process.env.RZP_SECRET)
    .update(body.toString())
    .digest("hex");
  console.log("sig" + req.body.razorpay_signature);
  console.log("sig" + expectedSignature);

  if (expectedSignature === req.body.razorpay_signature) {
    response = {
      payment: "done succesfull",
    };
    res.send("Payment done");

    const user = req.user;
    // const date = new Date().toLocaleString({
    //   timezone: "Asia/Kolkata",
    //   dateStyle: "full",
    //   timeStyle: "full",
    //   weekday: "short",
    //   month: "narrow",
    // });

    User.findOne(
      {
        _id: req.user._id,
      },
      function (err: any, foundUSer: any) {
        if (err) {
          res.render("404");
        } else {
          if (foundUSer) {
            let amount = parseInt(
              foundUSer.orders[foundUSer.orders.length - 1].amount
            );
            if (amount >= 1199) {
              amount = amount - 0.2 * amount;
            }
            const newCodOrder = new allOrdersModal({
              user_id: foundUSer._id,
              email: foundUSer.email,
              name: foundUSer.fullname,
              phone: foundUSer.mobileNumber,
              address: foundUSer.address,
              amount: amount,
              method: "Razorpay",
              // coupon: foundUSer.orders[foundUSer.orders.length - 1].coupon,
              // products: foundUSer.myOrders[foundUSer.myOrders.length - 1].products,
              time: Date.now,
              // gift: foundUSer.orders[foundUSer.orders.length - 1].gift,

              orderStatus: "Your order has been processed",
            });
            // foundUSer.orders.forEach(function (
            //   item: { method: string },
            //   i: string | number
            // ) {
            //   if (item.method === "Order Not Confirm") {
            //     // console.log("1"+item);
            //     const orderNot = foundUSer.orders[i]._id;

            //     User.findOneAndUpdate(
            //       {
            //         _id: req.user._id,
            //       },
            //       {
            //         $pull: {
            //           orders: {
            //             _id: orderNot,
            //           },
            //         },
            //       },
            //       function (err: any) {
            //         if (err) {
            //           console.log(err);
            //         } else {
            //         }
            //       }
            //     );
            //   }
            // });

            // User.findOneAndUpdate(
            //   {
            //     _id: req.user._id,
            //   },
            //   {
            //     cartu: [],
            //   },
            //   function (err: any) {
            //     if (err) {
            //       console.log(err);
            //     } else {
            //     }
            //   }
            // );

            // const ordersALL = req.user.orders;

            // sendMail(
            //   foundUSer.username,
            //   `Your Order has been placed , Team Zigy`,
            //   `Method : Razorpay , Pay ${amount} on Delivery`,
            //   foundUSer.firstName,
            //   "2"
            // )
            //   .then((result) => console.log("Email sent...", result))
            //   .catch((error) => console.log(error.message));
            // sendMail(
            //   process.env.ZIGY_RECIEVE_PURCHASE,
            //   `${req.user.username} has bought a product from razorpay`,
            //   `${req.user.username} , ${req.user.firstName} ${
            //     req.user.lastName
            //   } , ${
            //     req.user.phoneNo
            //   } , has bought a product from razorpay of ${amount} : ${
            //     ordersALL[ordersALL.length - 1]
            //   }`,
            //   `${req.user.firstName},"3"`
            // );

            foundUSer.orders.push(newCodOrder);
            foundUSer.save();
            newCodOrder.save((err: any) => {
              if (!err) {
                // res.render("paymentDone");
              } else {
                // res.send("Order Not Placed");
              }
            });
          }
        }
      }
    );
     res.send(response);
  } else {
    var response = {
      payment: "failed",
    };
    res.send("Payment failed");
  }
  next();
};

exports.getrazorpaykey = async (req:any , res:any) => {
  try{
    if (req){
      res.json ({
        razorpay_api_key : process.env.RZP_KEY,
        razorpay_api_secret : process.env.RZP_SECRET
      })

    }
  }catch(err:any) {
    res.json({err})
  }
  
  
};