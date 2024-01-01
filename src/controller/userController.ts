export {};

const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const sendmail = require("../middleware/mail");
const jwt = require("jsonwebtoken");
const {v4 : uuidv4} = require('uuid')
const customlog=require("../controller/loggerController")
const Post = require("../model/postModel")

const Product = require("../model/ProductModle")

type user={
    name: string,
    username: string, 
    email: string,
    password: string,
    token: string,
    UID: string,
    typeOfLogin: string,
    stories:string,

    // DOB?:number,
    // mobileNumber?:number,
    // gender?:string,
    // address?:address
}


exports.registerUser = async (req: any, res: any) => {

    const { name, email, password, username,stories } = req.body;
    // validation each field shold be filled

    if (!name || !email || !password || !username) {
        return res.status(400).json({
            msg: "Please enter all fields",
        });
    }
    if (password.length < 6) {
        return res.status(400).json({
            msg: "Passwords is too shorts",
        });
    }

    const datetime=new Date().toLocaleString().replace(',','');
    //Permament token
    const token = jwt.sign(
        {
            name: name,
            email: email,
            datetime:datetime
        },
        process.env.JWT_SECRET
        );
    console.log(token);
    //unique user id to access images from s3
    const newId = uuidv4()
    const objectToHash = {
        uuid: newId,
        email: email
      };
    const UID=await bcrypt.hash(JSON.stringify(objectToHash),10);
    // console.log(UID);
    // validation passed

    User.findOne({
        email: email,
    })
        .then((user: any) => {
            if (user) {
                return res.status(400).json({
                    msg: "User is already exists",
                });
            }
            
            const newUser: user ={
                name,
                username,
                email,
                password,
                token,
                UID,
                stories,
                typeOfLogin:"Email",
                
            };
            console.log(newUser);
            
            bcrypt.genSalt(10, function (err: any, salt: any) {
                bcrypt.hash(newUser.password, salt, async function (err: any, hash: any) {
                    if (err){ 
                        customlog.log('error','error while registering user');
                        res.json({error:err})};
                    newUser.password = hash;
                    
                    const newUserDoc=await User.create(newUser)
                    if (newUserDoc) { 
                        console.log(newUserDoc);
                    } 
                });
            });
            res.json({ success: true, msg: "New User Added" });
            customlog.log('info','route: /user/register msg: success');
        })
        .catch((err: any) => {
            customlog.log('error','error while registering user');
            res.json({error:err})});

    // sendmail.sendMail(req.body.email, );     ;
};

exports.loginUser = async (req: any, res: any) => {
    try{
    // (req, res, next);
    console.log("User Authenticated Successful!!!!");
    console.log(req.body);

    // res.send(
    //     req.body
    // );
    // res.send("User Logged In Succefully and will return jwt token");
    // here we will generate the toen and send to frontend
    const datetime=new Date().toLocaleString().replace(',','');
    const user = await User.findOne({
        email: req.body.email,
    });
    const token = jwt.sign(
        {
            _id: user.token,
            email: user.email,
            datetime:datetime
            
        },
        process.env.JWT_SECRET, { expiresIn: '1h' }
    );
    console.log(token);
    
    // send the refresh token in cookies
    if(req.body.apiDocs === "true"){
        res.cookie("Authorization", `Bearer ${token}`,{
            httpOnly: true,
            maxAge:10*1000
        });
        res.redirect('/api-docs');
    }
    else{
        res.header("auth-token", token);
        res.cookie('refresh-token', user.token,{
            httpOnly:true,
            maxAge:60*60*24*7*1000
        });
        res.json({"auth-token":token,
      "user-id":user._id});
        customlog.log('info','route: /user/login msg: success');
    }
    }
    catch(err){
        customlog.log('error','error while logging in user');
    }
};

exports.userDashboard = (req: any, res: any) => {
    res.send("THis is dashboard");
};

// Import necessary modules
import axios, { AxiosResponse } from 'axios';

// Define the request body interface
interface EmailRequestBody {
    subject: string;
    to_email: string;
    message: string;
    html_body: string;
}

// Function to make a POST request using axios
async function sendEmail(apiUrl: string, requestBody: EmailRequestBody): Promise<AxiosResponse<any>> {
    try {
        const response = await axios.post(apiUrl, requestBody, {
            headers: {
                // 'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json',
            },
        });

        return response;
    } catch (error) {
        console.error('Error in POST api:', error);
        throw error;
    }
}

// Example usage
exports.forgotPassword = async (req: any, res: any) => {
    const { email } = req.body;

    // Finding user
    const user = await User.findOne({
        email: email,
    });

    // User not exist
    if (!user) {
        return res.status(400).json({
            msg: "User is not exists",
        });
    }

    // User exists, then create a one-time link valid for 10 minutes
    const secret = process.env.JWT_SECRET + user.password;
    const payload = {
        email: user.email,
        id: user.id,
    };
    const token = jwt.sign(payload, secret, {
        expiresIn: "15m",
    });

    // Construct the link
    const link = `${req.protocol}://${req.get('host')}/reset-password/${user.id}/${token}`;

    const emailRequestBody: EmailRequestBody = {
      subject: "Password Reset",
      to_email: user.email,
      message: "Password reset link",
      html_body: `<p style="font-family: 'Roboto', sans-serif; color: #333;">Hello,</p>
          <p style="font-family: 'Roboto', sans-serif; color: #555;">You have requested to reset your password. Click the link below to reset your password:</p>
          <p style="font-family: 'Roboto', sans-serif; color: #3498db;"><a href="${link}" style="color: #3498db; text-decoration: none;">Reset Password</a></p>
          <p style="font-family: 'Roboto', sans-serif; color: #555;">If you didn't request this, please ignore this email.</p>
          <p style="font-family: 'Roboto', sans-serif; color: #555;">Thank you,</p>
          <p style="font-family: 'Roboto', sans-serif; color: #555;">The Canverro Team</p>
          `,
  };
  

    // Define your API URL and auth token
    const apiUrl = 'http://email4320414842.canverro.com/send_email/';
    // const authToken = 'your_auth_token';  // Replace with your actual auth token

    try {
        // Send the email
        const emailResponse = await sendEmail(apiUrl, emailRequestBody);

        // Log the response or handle it as needed
        console.log('Email response:', emailResponse.data);

        // Send success response
        // res.status(200).json({
        //     msg: "Password reset link sent successfully",
        // }); 
         res.render('mail_send_success')

    } catch (error) {
        console.error('Error sending email:', error);

        // Send error response
        res.status(500).json({
            msg: "Error sending password reset email",
        });
    }
};


// reset password link routers

exports.resetPassword = async (req: any, res: any) => {
  const { id, token } = req.params;
  // res.send(req.params);
  //if invalid id has passed then do this
  const user = await User.findById(id);
  if (!user) {
      res.send("invalid id");
  }
  // valid id then check token and update the password
  const secret = process.env.JWT_SECRET + user.password;
  try {
      const payload = jwt.verify(token, secret);
      res.render('reset-password',{email:user.email})
      customlog.log('info','route: /forgot-password msg: success');
      // res.send("forgot password page for perticular user");
  } catch (err: any) {
      customlog.log('error','error while resetting password');
      console.log(err);
      res.send(err.message);
  }
};
exports.resetPassword2 = async (req: any, res: any) => {
const { id, token } = req.params;
const { password1, password2 } = req.body;

const user = await User.findById(id);
if (!user) {
  return res.status(400).json({ error: "Invalid id" });
}

const secret = process.env.JWT_SECRET + user.password;

try {
  const payload = jwt.verify(token, secret);


  bcrypt.genSalt(10, function (err: any, salt: any) {
    if (err) {
      customlog.log('error', 'error while resetting password - failed to generate salt');
      return res.status(500).json({ error: "Error generating salt" });
    }
  
    console.log("Generated salt:", salt);
  
    if (!password1) {
      customlog.log('error', 'error while resetting password - password1 is undefined or empty');
      return res.status(400).json({ error: "Password is undefined or empty" });
    }
  
    bcrypt.hash(password1, salt, async function (err: any, hash: any) {
      if (err) {
        customlog.log('error', 'error while resetting password - failed to hash password');
        console.error(err); // Log the error to the console for debugging
        return res.status(500).json({ error: "Error while hashing password" });
      }
      // Log the hashed password for debugging
      console.log("Hashed Password:", hash);
      user.password = hash;
      user.save(function (err: any, updatedUser: any) {
        if (err) {
          customlog.log('error', 'error while resetting password - failed to save password');
          console.error(err); // Log the error to the console for debugging
          return res.status(500).json({ error: "Error while saving password" });
        }
        // Log the updated user object for debugging
        console.log("Updated User:", updatedUser);
  
        customlog.log('info', 'route: /reset-password msg: success');
        // return res.json({ msg: "Password Changed" });
        res.render('passwordChanged')
      });
    });
  });
} catch (err: any) {
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired' });
  }
  customlog.log('error', 'error while resetting password');
  console.log(err);
  return res.status(400).json({ error: err.message });
}
}
//updating the password of perticular user to new password
exports.resetPasswordPost = async (req: any, res: any) => {
  const { password1, password2 } = req.body;
  const email=req.user.email;
  // to find out the user account data
  const user=await User.findOne({email:email});
  // validation both password should be same
  if (password1 !== password2) {
      return res.status(400).json({
          msg: "Passwords do not match",
      });
  }
  // validation password should not less than 6
  if (password1.length < 6) {
      return res.status(400).json({
          msg: "Passwords is too shorts",
      });
  }
  bcrypt.genSalt(10, function (err: any, salt: any) {
      bcrypt.hash(password1, salt, function (err: any, hash: any) {
          if (err){ 
              customlog.log('error','error while resetting password');
              res.json({error: err})};
          user.password=hash;
          user.save(function (err: any) {
              if (err)
              {
                  customlog.log('error','error while resetting password');
                  res.json({error: err})
              }
              customlog.log('info','route: /reset-password msg: success');
              res.json({msg:"Password Changed"});
          });
          
      });
  });
  
};

exports.getTemporaryToken=async (req: any, res: any) =>{
    try{
    const refreshToken = req.headers.authorization;
    const user = await User.findOne({
        token: refreshToken
    });
    const datetime=new Date().toLocaleString().replace(',','');
    const token = jwt.sign(
        {
            _id: user.token,
            email: user.email,
            datetime:datetime
        },
        process.env.JWT_SECRET, { expiresIn: '1h' }
    );
    customlog.log('info','route: /temporary-token msg: success');
    res.send(token);
    }
    catch(err){
        customlog.log('error','error fetching temporary token');
    }
}



exports.getUserInfo= async(req: any, res: any)=>{
  try{
      let userId=req.user._id;
      let userData=await User.findById(userId);
      userData.password='';
      console.log(userData);
      customlog.log('info','route: /getUserInfo msg: success');
      res.json({
          name:userData.name,
          email:userData.email,
          username:userData.username,
          DOB:userData.DOB,
          mobileNumber:userData.mobileNumber,
          gender:userData.gender,
          profilenio:userData.profilebio,
          address:{
              city: userData.address.city,
              state: userData.address.state,
          },
          userid:req.user._id
      });
  
  }
  catch(err){
      customlog.log('error','error getting user info');
      res.json({error: err})
  }
}

// exports.setDeliveryAddress= async(req: any, res: any)=>{
//     try{
//         let userId=req.user._id;
//         let user=await User.findById(userId);
//         console.log(req.body);
//         const address={
//             fullname:req.body.fullname,
//             mobilenumber:req.body.mobilenumber,
//             flathouseno:req.body.flathouseno,
//             area:req.body.area,
//             landmark:req.body.landmark,
//             city:req.body.city,
//             pin:req.body.pin,
//             state:req.body.state,
//             country:req.body.country,
//         }
//         user.address=address;
//         user.save(function (err: any) {
//             if (err)
//             {
//                 customlog.log('error','error while resetting delevery address');
//                 res.send({error:err});
//             }
//             customlog.log('info','route: /setDeliveryAddress msg: success');
//             res.json({msg:"Address Added"});
//         })
//         console.log(address);
//     }
//     catch(err){
//         customlog.log('error','error while resetting delevery address');
//         res.json({error: err});
//     }
// }



exports.removeAddressById = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
  
    // Extract the address ID from the request params
    const addressIdToRemove = req.body.addressId;
  
    // Find the index of the address in the user's address array
    const addressIndex = user.address.findIndex(
      (existingAddress: any) => existingAddress._id.toString() === addressIdToRemove
    );
  
    // If the address exists, remove it from the array
    if (addressIndex !== -1) {
      user.address.splice(addressIndex, 1);
  
      // Save the updated user document
      await user.save();
  
      return res.json({ msg: 'Address removed successfully' });
    } else {
      return res.json({ error: 'Address not found' });
    }
  } catch (error) {
    console.error('Error while removing address:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
  };
  
  
  
  // Import necessary modules and models
  const mongoose = require('mongoose');
  
  // Add this API endpoint to remove an address by its ID
  exports.removeAddressById = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const addressIdToRemove = req.body.addressId; // Assuming the addressId is passed in the request body
  
    // Use Mongoose's $pull operator to remove the address with the given ID
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { address: { _id: mongoose.Types.ObjectId(addressIdToRemove) } } },
      { new: true } // Return the modified document
    );
  
    // Check if the address with the given ID was successfully removed
    if (!user) {
      console.error('Address not found');
      res.json({ error: 'Address not found' });
      return;
    }
  
    console.log('Route: /removeAddressById Msg: success');
    res.json({ msg: 'Address removed successfully' });
  } catch (err:any) {
    console.error('Error while removing delivery address');
  res.json({ error: err.message || 'Internal Server Error' });
  }
  };

  
  exports.setDeliveryAddress = async (req: any, res: any) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);
      console.log(req.body);
  
      const address = {
        // _id: new mongoose.Types.ObjectId(),
        // _id: new mongoose.Types.ObjectId(),
        fullname: req.body.fullname,
        mobilenumber: req.body.mobilenumber,
        flathouseno: req.body.flathouseno,
        area: req.body.area,
        landmark: req.body.landmark,
        city: req.body.city,
        pin: req.body.pin,
        state: req.body.state,
        country: req.body.country,
      };
  
      // Check if the same address already exists in the user's address array
      const addressExists = user.address.some((existingAddress: any) =>
        compareAddresses(existingAddress, address)
      );
  
      if (addressExists) {
        customlog.log('error', 'Address already exists');
        res.json({ error: 'Address already exists' });
        return; // Return early to prevent adding the address to the array
      }
  
      // Add the new address to the user's address array
      user.address.push(address);
  
      user.save(function (err: any) {
        if (err) {
          customlog.log('error', 'error while resetting delivery address');
          res.send({ error: err });
        }
        customlog.log('info', 'route: /setDeliveryAddress msg: success');
        res.json({ msg: "Address Added" });
      });
  
      console.log(address);
    } catch (err) {
      customlog.log('error', 'error while resetting delivery address');
      res.json({ error: err });
    }
  };
  
  // Function to compare two addresses for equality
  function compareAddresses(address1: any, address2: any) {
    
    return (
      address1.fullname === address2.fullname &&
      address1.mobilenumber === address2.mobilenumber &&
      address1.flathouseno === address2.flathouseno &&
      address1.area === address2.area &&
      address1.landmark === address2.landmark &&
      address1.city === address2.city &&
      address1.pin === address2.pin &&
      address1.state === address2.state &&
      address1.country === address2.country
    );
}

exports.getDeliveryAddress = async(req:any , res:any)=>{
    try {
        let userId = req.user._id;
        let userData = await User.findById(userId);
        res.json(userData.address);
        console.log(userData.address)
        customlog.log('info','route: /getDeliveryAddress msg: success');

    }catch(err){
      console.log(err)
      console.log(err)
        customlog.log('error','error while retrieving the delivery address');
        res.json({error: err});
    }
}

// Update the getUserFollowing API
exports.getUserFollowing = async (req:any, res:any) => {

    try {
      const userId = req.body.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Get an array of user IDs that the user is following, including their own ID
      const followingIds = [userId, ...user.following.map((id: any) => id.toString())];
  
      const userDetails = [];
  
      // Loop through users in followingIds and collect their details
      for (const followingId of followingIds) {
        const followingUser = await User.findById(followingId);
        if (followingUser) {
          const { _id, username, ProfileUrl } = followingUser;
          userDetails.push({ _id, username, ProfileUrl });
        }
      }
  
      res.json(userDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  }

// Update the getUserFollowing API
exports.getUserFollowing = async (req:any, res:any) => {

    try {
      const userId = req.body.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Get an array of user IDs that the user is following, including their own ID
      const followingIds = [userId, ...user.following.map((id: any) => id.toString())];
  
      const userDetails = [];
  
      // Loop through users in followingIds and collect their details
      for (const followingId of followingIds) {
        const followingUser = await User.findById(followingId);
        if (followingUser) {
          const { _id, username, ProfileUrl } = followingUser;
          userDetails.push({ _id, username, ProfileUrl });
        }
      }
  
      res.json(userDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  


// Sort the collected stories by createdAt
// storiesWithUsernames.sort((a, b) => b.createdAt - a.createdAt);


// Sort the collected stories by createdAt
// storiesWithUsernames.sort((a, b) => b.createdAt - a.createdAt);









exports.getUserFollowers = async(req:any,res:any)=>{
  try{
      let userId = req.user._id;
      let userData = await User.findById(userId);
      res.json(userData.followers);
      console.log(userData.followers);
      customlog.log('info','route: /getUserFollowers msg: success');
  }catch(err){
      customlog.log('error','error while retrieving the following lists');
      res.json({error: err});
  }
}
exports.getOtherUserInfo = async(req:any, res:any)=>{
  try{
      const uid = req.params.uid;
      const userData = await User.findOne({ UID : uid });

      if (!userData) {
        // Handle the case where user with the specified uid is not found
        return res.status(404).json({ error: 'User not found' });
    }

      // const productData = await User.find({avatar :userId})
      const currentUserId = req.user._id;
      const isFollowing = userData.followers.includes(currentUserId);
      res.json({ 
          _id:userData._id,
          username:userData.username,
          avatar:userData.avatar,
          name:userData.name,
          followers:userData.followers,
          following : userData.following,
          posts : userData.posts,
          product : userData.products,
          isFollowing,
      });
      customlog.log('info','route: /getOtherUserInfo msg: success');
  }catch(err){
      customlog.log('error','error while getting the other user info');
      res.json({error: err});
  }
}


// exports.addToCart = async (req : any, res : any) => {
//     try {
//       console.log("hi");
//       const product = await Product.findById(req.params.productid);
//       let userId = req.user._id;
//       let user = await User.findById(userId);
//       console.log(user);
  
//       if (!product) {
//         return res.status(404).json({
//           success: false,
//           message: "Product not found",
//         });
//       } else {
//         try {
//           const newCartItem = {
//             quantity: req.params.quantity,
//             productid: req.params.productid,
//             size: req.params.size,
//             colour: req.params.colour,
//           };
          
//           user.mycart.push(newCartItem); // Add the newCartItem to mycart array
  
//           await user.save();
//           console.log(user.mycart);
  
//           res.status(200).json({
//             success: true,
//             message: "Product added to the Cart",
//           });
//         } catch (err) {
//           console.log(err);
//           res.status(500).json({
//             success: false,
//             message: "Error while adding product to cart",
//             error: err,
//           });
//         }
//       }
//     } catch (err) {
//       console.log(err);
//       res.status(500).json({
//         success: false,
//         message: "Error while product to cart",
//         error: err,
//       });
//     }
//   };

// exports.addToCart = async (req:any, res:any) => {
//     try {
//       console.log("hi");
//       const product = await Product.findById(req.params.productid);
//       let userId = req.user._id;
//       let user = await User.findById(userId);
//       console.log(user);
  
//       if (!product) {
//         return res.status(404).json({
//           success: false,
//           message: "Product not found",
//         });
//       } else {
//         try {
//           const newCartItem = {
//             quantity: req.params.quantity,
//             productid: req.params.productid,
//             size: req.params.size,
//             colour: req.params.colour,
//           };
  
//           // Check if the product already exists in the cart
//           const existingCartItemIndex = user.mycart.findIndex(
//             (item:any) => item.productid.toString() === req.params.productid
//           );
  
//           if (existingCartItemIndex !== -1) {
//             // Product already exists in the cart
//             const existingCartItem = user.mycart[existingCartItemIndex];
  
//             // Update the cart item with new color, size, and quantity
//             existingCartItem.colour = req.params.colour;
//             existingCartItem.size = req.params.size;
//             existingCartItem.quantity = req.params.quantity;
//           } else {
//             // Product doesn't exist in the cart, add newCartItem
//             user.mycart.push(newCartItem);
//           }
  
//           await user.save();
//           console.log(user.mycart);
  
//           res.status(200).json({
//             success: true,
//             message: "Product added to the Cart",
//           });
//         } catch (err) {
//           console.log(err);
//           res.status(500).json({
//             success: false,
//             message: "Error while adding product to cart",
//             error: err,
//           });
//         }
//       }
//     } catch (err) {
//       console.log(err);
//       res.status(500).json({
// //         success: false,
// //         message: "Error while adding product to cart",
// //         error: err,
// //       });
// //     }
// //   };
  
// exports.addToCart = async (req:any, res:any) => {
//   try {
//     const productId = req.body.productId;
//     const size = req.body.size;
//     const colour = req.body.colour;
//     const quantity = req.body.quantity;
//     const price = req.body.price;
//     const discount = req.body.discount;
//     const fabric = req.body.fabric;

//     const user = await User.findById(req.body.userId);

//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const newCartItem = {
//       productId: productId,
//       size: size,
//       colour: colour,
//       quantity: quantity,
//       price: price,
//       discount: discount,
//       fabric: fabric,
//     };
    
//     // Check if the product already exists in the cart
//     const existingCartItemIndex = user.mycart.findIndex(
//       (item:any) =>
//         item.productId.toString() === productId &&
//         item.size === size &&
//         item.colour === colour
//     );

//     if (existingCartItemIndex !== -1) {
//       // Product already exists in the cart
//       const existingCartItem = user.mycart[existingCartItemIndex];

//       // Increase the quantity of the existing cart item
//       existingCartItem.quantity += parseInt(quantity);
//     } else {
//       // Product doesn't exist in the cart, add newCartItem
//       user.mycart.push(newCartItem);
//     }

//     await user.save();

//     res.status(200).json({
//       success: true,
//       message: "Product added to the Cart",
//       data: newCartItem,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({
//       success: false,
//       message: "Error while adding product to cart",
//       error: err,
//     });
//   }
// };

  

  exports.getCart = async (req: any, res: any) => {
    try {
      let userId = req.params.userId;
      let userData = await User.findById(userId);
  
      if (userData && userData.mycart) {
        console.log(userData.mycart);
        res.json(userData.mycart);
        customlog.log('info', 'route: /getCart msg: success');
      } else {
        // If userData or userData.mycart is undefined or null
        res.json([]); // Or any other appropriate response for an empty cart
        customlog.log('info', 'route: /getCart msg: empty cart');
      }
    } catch (err) {
      customlog.log('error', 'error fetching cart');
      res.json({ error: err });
    }
  };
  

  exports.removeFromCart = async (req :any, res : any) => {
    try {
      const userId = req.user._id;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }
  
      const cartItemId = req.params.productId;
      console.log(cartItemId);
      const cartItemIndex = user.mycart.findIndex((item: any) => item.productid === cartItemId);
      console.log(cartItemIndex)
  
      if (cartItemIndex === -1) {
        return res.status(404).json({
          success: false,
          message: "Item not found in cart",
        });
      }
  
      user.mycart.splice(cartItemIndex, 1);
      await user.save();
  
      res.status(200).json({
        success: true,
        message: "Item removed from cart",
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({
        success: false,
        message: "Error while removing item from cart",
        error: err,
      });
    }
  };

  
  exports.postRatingProduct = async(req: any, res: any)=>{
    try{
        let userId=req.user._id;
        let userData=await User.findById(userId);
        //at a later stage add functionality to allow posting review by those who actually bought the product
        const product = await Product.findById(req.params.id);
        let rating=req.body.rating;
        // console.log(review);
        if (rating) {
        product.rating.push({user:userId,rating:rating});
        await product.save();
        res.json({msg:"rating added"});
        }
        else{
            res.json({msg:"invalid input"});
        }
        customlog.log('info','route: /postRatingProduct/:id msg: success');
    }
    catch(err){
        customlog.log('error','error posting rating for product')
        res.json({error:err});
    }
}
  
exports.getRatingProduct = async(req: any, res: any)=>{
    try{
        const product = await Product.findById(req.params.id);
        console.log(product.rating);
        res.json(product.rating);
        customlog.log('info','route: /getRatingProduct/:id msg: success');

    }
    catch(err){
        customlog.log('error','error fetching product rating')
        res.json({error:err});
    }
}

exports.removeAddress = async (req: any, res: any) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const addressId = req.params.addressId;
    console.log(addressId)

    // Find the index of the address object with a matching _id
    const addressIndex = user.address.findIndex((item: any) => item._id.toString() === addressId);

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Address not found",
      });
    }

    // Remove the address from the array
    user.address.splice(addressIndex, 1);

    await user.save();

    res.status(200).json({
      success: true,
      message: "Address removed",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Error while removing address",
      error: err,
    });
  }
};


exports.getOtherUserPostsandProducts = async(req:any, res:any)=>{
  try{
      const userId = req.params.id;
      const userData = await User.findById(userId);

      const postDetails = await Post.find({ _id: { $in: userData.posts } });
      const productDetails = await Product.find({_id: {$in : userData.products}});
      res.json({
          posts : postDetails,
          product : productDetails,
      });
      customlog.log('info','route: /getOtherUserPostsandProducts msg: success');
  }catch(err){
      customlog.log('error','error while getting the other users posts and products info');
      res.json({error: err});
  }
}

exports.getupdateproduct = async (req: any, res: any) => {
  try {
    const productId = req.params.productid;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const productToUpdate = user.mycart.find(
  (item: any) => item.productid && item.productid === productId.toString());


    if (!productToUpdate) {
      return res.status(404).json({
        success: false,
        message: "Product not found in the cart",
      });
    }

    // Check if the 'size' parameter is provided in the request body
    if (req.params.size) {
      productToUpdate.size = req.params.size;
    }

    // Check if the 'colour' parameter is provided in the request body
    if (req.params.colour) {
      productToUpdate.colour = req.params.colour;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: productToUpdate,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// exports.addUserFollowing = async(req:any,res:any) => {
//   const user_id=req.body._id;
//   const userTofollow_id = req.params.id;
//   if(user_id!==userTofollow_id){
//       try{
//           const user= await User.findById(user_id)
//           const userTofollow= await User.findById(userTofollow_id)
//           if(!userTofollow.followers.includes(user_id)){
//              await user.updateOne({$push: {following:userTofollow_id}})
//              await userTofollow.updateOne({$push: {followers:user_id}})
//              res.json({"msg":"usser followed successfully!"})
           
//         customlog.log('info','route: /addUserFollowing msg: success');
//             //  res.status(200).json({"msg":"user followed successfully"})
//           }
//           else{
//           res.json({"msg":"user already followed!"})
           
//         customlog.log('info','route: /addUserFollowing msg: error');
//             // return res.status(403).json({"msg":"User already followed"})
//           }
//       }
//       catch{
//         res.json({"msg":"failed!"})
           
//         customlog.log('info','route: /addUserFollowing msg: error');
//           // res.status(200).json({"msg":"failed"})
//       }
//     }
//       else{
//         res.json({"msg":"cant follow!"})
           
//         customlog.log('info','route: /addUserFollowing msg: error');
//         // res.status(403).json({"msg":"cant follow"})
//       }
    
//   }
  exports.addUserFollowing = async(req:any,res:any) => {
  const user_id=req.body._id;
  const userTofollow_id = req.params.id;
  if(user_id!==userTofollow_id){
      try{
          const user= await User.findById(user_id)
          const userTofollow= await User.findById(userTofollow_id)
          if(!userTofollow.followers.includes(user_id)){
             await user.updateOne({$push: {following:userTofollow_id}})
             await userTofollow.updateOne({$push: {followers:user_id}})
             res.json({"msg":"usser followed successfully!"})
           
        customlog.log('info','route: /addUserFollowing msg: success');
            //  res.status(200).json({"msg":"user followed successfully"})
          }
          else{
          res.json({"msg":"user already followed!"})
           
        customlog.log('info','route: /addUserFollowing msg: error');
            // return res.status(403).json({"msg":"User already followed"})
          }
      }
      catch{
        res.json({"msg":"failed!"})
           
        customlog.log('info','route: /addUserFollowing msg: error');
          // res.status(200).json({"msg":"failed"})
      }
    }
      else{
        res.json({"msg":"cant follow!"})
           
        customlog.log('info','route: /addUserFollowing msg: error');
        // res.status(403).json({"msg":"cant follow"})
      }
    
  }
  
  exports.unFollow = async (req: any, res: any) => {
    const user_id = req.body._id;
    const userToUnfollow_id = req.params.id;
  
    if (user_id !== userToUnfollow_id) {
      try {
        const user = await User.findById(user_id);
        const userToUnfollow = await User.findById(userToUnfollow_id);
  
        if (!userToUnfollow) {
          return res.status(404).json({ message: 'User to unfollow not found' });
        }
  
        if (userToUnfollow.followers.includes(user_id)) {
          await user.updateOne({ $pull: { following: userToUnfollow_id } });
          await userToUnfollow.updateOne({ $pull: { followers: user_id } });
          res.json({ "msg": "User unfollowed successfully!" });
          console.log('User unfollowed successfully');
        } else {
          res.status(403).json({ "msg": "User already unfollowed" });
          console.log('User already unfollowed');
        }
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    } else {
      res.status(403).json({ "msg": "Can't unfollow yourself" });
      console.log("Can't unfollow yourself");
    }
  }
  
  
  
  
  
  

  
  
