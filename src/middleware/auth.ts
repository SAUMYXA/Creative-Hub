// export {};

// const jwt = require("jsonwebtoken");
// const { collection } = require("../model/userModel");
// const User = require("../model/userModel");



// const auth = async (req: any, res: any, next: any) => {
//   try {
//     if (!req.header("Authorization")) {
//       return res.json({
//         message: "Access denied"
//       });
//     }
//     const token = req.header("Authorization").replace("Bearer ", "");

//     // const token = req.headers['Authorization'];
//     if (!token) {
//      return res.status(401).send("Access Denied");
//     } else {
//       // if header has token then verify the token and get the user id
//       const verifyUser = jwt.verify(token, process.env.JWT_SECRET);
//       const user = await User.findOne({
//         token: verifyUser._id,
//       });
//       req.user = user;
//       console.log("User is Authorized");
//       next();
//     }
//   } catch (err) {
//     console.log(err);
//     res.status(401).send(err);
//   }
// };
// module.exports = auth;

export {};

const jwt = require("jsonwebtoken");
const User = require("../model/userModel");

const auth = async (req:any, res:any, next:any) => {
  try {
    if (!req.headers.hasOwnProperty("authorization")) {
      return res.json({
        message: "Access denied"
      });
    }

    const token = req.headers.authorization.replace("Bearer ", "");

    if (!token) {
      return res.status(401).send("Access Denied");
    } else {
      const verifyUser = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findOne({
        token: verifyUser._id,
      });
      req.user = user;
      console.log("User is Authorized");
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(401).send(err);
  }
};

module.exports = auth;

