export {};
const express = require("express");
const route = express.Router();
const passport = require("passport");
const services = require("../services/render");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const passportSetup = require("../passport/passport-setup");
const userController = require("../controller/userController");
const adminController = require("../controller/adminController");
const mailController = require("../middleware/mail");
const uploadController = require("../controller/uploadController");
const orderController = require("../controller/orderController");
const postController = require("../controller/postController");
const paymentController = require("../controller/paymentController");
const adminUploadController = require("../controller/adminUploadController");
const upload = require("../middleware/multer");
const isAuthorized = require("../middleware/isAuthorized");
const auth = require("../middleware/auth");
const mail = require("../middleware/mail");
const render = require("../services/render");
const { Router } = require("express");
const routervalue =require("../dynamic_values/routes");
const jwt = require("jsonwebtoken");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const dir = path.join(__dirname, "..", "..");
// const paymentController =  require("../controller/paymentController");


// var GeneralPath = path.join(dir, "/logs/general-log.log");
// var GeneralPath = path.join(dir, "/logs/general-log.log");
// var GeneralPath = path.join(dir, "/logs/general-log.log");
// const red = require();
/**
 *
 *  @description Root Route
 *  @method GET /
 */

//query = /git/pull?branch=master
//route.get("/git/pull", auth, isAuthorized('admin'), (req:any, res:any) => {
route.get("/git/pull",(req:any, res:any) => {
  // Get the branch name from the query parameter
  const branch = req.query.branch;

  if (!branch) {
    return res.status(400).send("Branch name is required.");
  }

  // Execute the git-pull.sh script with the provided branch name
  exec(`./scripts/git-pull.sh ${branch}`, (error:any, stdout:any, stderr:any) => {
    if (error) {
      console.error(`Error executing script: ${error}`);
      return res
        .status(500)
        .send("An error occurred while executing the script.");
    }
    if (stderr) {
      console.error(`Script execution error: ${stderr}`);
      return res
        .status(500)
        .send("An error occurred while executing the script.");
    }

    // Success: script executed without errors
    console.log(`Script output: ${stdout}`);
    res.send("Git pull completed successfully.");
  });
});

route.get(routervalue.homeRouter, services.homeRoutes);

// route.get("/logs", auth, isAuthorized('admin'), (req: any, res: any) => {
//   fs.readFile(GeneralPath, "utf8", (err: any, data: any) => {
//     if (err) {
//       return res.status(500).send("Internal Server Error");
//     }
//     const logData = data.split(",\n");
//     res.status(200).json({ logs: logData });
//   });
// });
// route.get("/logs", auth, isAuthorized('admin'), (req: any, res: any) => {
//   fs.readFile(GeneralPath, "utf8", (err: any, data: any) => {
//     if (err) {
//       return res.status(500).send("Internal Server Error");
//     }
//     const logData = data.split(",\n");
//     res.status(200).json({ logs: logData });
//   });
// });
// route.get("/logs", auth, isAuthorized('admin'), (req: any, res: any) => {
//   fs.readFile(GeneralPath, "utf8", (err: any, data: any) => {
//     if (err) {
//       return res.status(500).send("Internal Server Error");
//     }
//     const logData = data.split(",\n");
//     res.status(200).json({ logs: logData });
//   });
// });
// route.get("/logs", auth, isAuthorized('admin'), (req: any, res: any) => {
//   fs.readFile(GeneralPath, "utf8", (err: any, data: any) => {
//     if (err) {
//       return res.status(500).send("Internal Server Error");
//     }
//     const logData = data.split(",\n");
//     res.status(200).json({ logs: logData });
//   });
// });

// Authentication Routes

/**
 * @description Google Sign In Route
 * @method GET /google
 */
route.get(
  routervalue.googleRouter,
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

route.get(
  routervalue.googleCallback,
  passport.authenticate("google", {
    failureRedirect: "/failedAuth",
  }),
  (req: any, res: any) =>{
    // Successful authentication, redirect home.
    const datetime = new Date().toLocaleString().replace(',','');
    const token = jwt.sign({
      id:req.user.googleId,
      email:req.user.email,
      datetime:datetime,
    },process.env.JWT_SECRET, { expiresIn: '1h' });
    res.header("auth-token",token);
    res.redirect("/good");
  }
);
/**
 * @description if Authentication failed
 * @method GET /failedAuth
 */
route.get(routervalue.failedAuth, (req: any, res: any) => res.send("You Failed to log in!"));
/**
 * @description if Authentication success
 * @method GET /good
 */
route.get(routervalue.good, (req: any, res: any) => {
  res.send(" Authenticated successfully ");
});

/**
 * @description User Login using email password
 * @method GET /user/login
 */

route.get(routervalue.loginRouter, services.loginRoute);

route.get(routervalue.registerRouter, services.registerRoute);

route.get(routervalue.dashboard, userController.userDashboard);
route.get(routervalue.profile, auth, render.showProfile);

// Creating API to call database
route.post(routervalue.registerRouter, userController.registerUser);
route.post(
  routervalue.loginRouter,
  passport.authenticate("local", {
    // successRedirect: '/dashboard',
    failureRedirect: "/failedAuth",
  }),
  userController.loginUser
);

route.post(routervalue.logout, function (req: any, res: any, next: any) {
  req.logout(function (err: any) {
    if (err) {
      return next(err);
    }
    res.send({
      msg: "Logout successfully"
    });
  });
});

/**
 * @description Forgot Password Route
 */
// route.get(routervalue.forgotPassword, services.forgotPassword);
// route.get(routervalue.forgotPassword, services.forgotPassword);
// route.get(routervalue.forgotPassword, services.forgotPassword);

route.post(routervalue.forgotPassword, userController.forgotPassword);

route.get(routervalue.resetPasswordGet, userController.resetPassword);
route.post(routervalue.resetPassword,auth,userController.resetPasswordPost);
route.post(routervalue.resetPassword2,userController.resetPassword2);
route.post(routervalue.resetPassword2,userController.resetPassword2);
route.post(routervalue.resetPassword2,userController.resetPassword2);

//Creating route to get the temporary token
route.get(routervalue.temporaryToken,userController.getTemporaryToken);

// Upload Product Routes
/**
 * @description
 * @method GET /upload Image
 */

route.post(
  routervalue.uploadProduct,auth,
  upload.single("image"),
  uploadController.uploadProduct
);
//get all posts
route.get(routervalue.getallPost, uploadController.getAllPosts);

//route to get detailed info about a product
route.get(routervalue.postInfo,uploadController.getPostInfo);

/**
 * @description
 * @method POST /post/upload
 */
// route.post(routervalue.postUpload, auth,uploadController.uploadPost);
route.post(routervalue.uploadPost, auth , upload.single("file"), uploadController.uploadPost)

/**
 * @descripton
 * @method GET /post/:id
 */
route.get(routervalue.likePost, auth, uploadController.likeandUnlikePost);

/**
 * @description
 * @method DELETE /post/:id
 */
route.delete(routervalue.deletePost, auth, uploadController.deletePost);

/**
 * @description
 * @method GET /follow/:id
 */
route.get(routervalue.subscribeUser, auth, uploadController.subscribeUser);

//! Remaining
/**
 * @description
 * @method GET /getPosts
 */
route.get(routervalue.getPosts, auth, uploadController.getPostsOfFollowing);

//search routes
route.get(routervalue.searchRouter,auth,postController.search);


//pool design route
route.get(routervalue.poolDesign,auth,postController.addUserToPool);

//get all products route
route.get(routervalue.getAllProduct,postController.getAllProducts);

//get product info route

route.get(routervalue.productInfo,postController.getProductInfo);


//route to like a product
route.get(routervalue.likeProduct, auth, postController.likeandUnlikeProduct);

//route to get liked products
route.get(routervalue.getLikedProducts,auth,postController.getLikedProducts);

//route to get liked posts
route.get(routervalue.getLikedPosts,auth,postController.getLikedPosts);

//add product to wishlist
route.get(routervalue.addtoWishlist,auth,postController.addToWishlist);
route.get(routervalue.removeFromWishlist,auth,postController.removeFromWishlist);
route.get(routervalue.getWishlistByListName,auth,postController.getWishlistByListName);
// route.get(routervalue.removeFromWishlist,auth,postController.removeFromWishlist);
// route.get(routervalue.getWishlistByListName,auth,postController.getWishlistByListName);
// route.get(routervalue.removeFromWishlist,auth,postController.removeFromWishlist);
// route.get(routervalue.getWishlistByListName,auth,postController.getWishlistByListName);
// route.get(routervalue.removeFromWishlist,auth,postController.removeFromWishlist);
// route.get(routervalue.getWishlistByListName,auth,postController.getWishlistByListName);
// route.get(routervalue.removeFromWishlist,auth,postController.removeFromWishlist);
// route.get(routervalue.getWishlistByListName,auth,postController.getWishlistByListName);

//post review to product
route.post(routervalue.postReviewProduct,auth,postController.postReviewProduct);

//add rating to product
route.get(routervalue.addRatingProduct,auth,postController.postRatingProduct);

//get review for product
route.get(routervalue.getReviewProduct,postController.getReviewProduct);

//get pooled design
route.get(routervalue.getPooledDesign,auth,postController.getPooledDesign);

//get pooled design
route.get(routervalue.getWishlist,auth,postController.getWishlist);

//get user information
route.get(routervalue.getUserInfo,auth,userController.getUserInfo);

//search products from hashtags
route.get(routervalue.getProductHashtag,postController.getProductsHashtag);

//get user products
route.get(routervalue.getUserProducts,auth,postController.getUserProducts);

//get user posts
route.get(routervalue.getUserPosts,auth,postController.getUserPosts);

//get user Followers
route.get(routervalue.getUserFollowers,auth,userController.getUserFollowers);

//gets user Following
route.get(routervalue.getUserFollowing,userController.getUserFollowing);
route.get(routervalue.getUserFollowing,userController.getUserFollowing);
route.get(routervalue.getUserFollowing,userController.getUserFollowing);
route.get(routervalue.getUserFollowing,userController.getUserFollowing);

route.post(routervalue.addUserFollowing,auth,userController.addUserFollowing);
// route.post(routervalue.addUserFollowing,auth,userController.addUserFollowing);
// route.post(routervalue.addUserFollowing,auth,userController.addUserFollowing);
// route.post(routervalue.addUserFollowing,auth,userController.addUserFollowing);
// route.post(routervalue.addUserFollowing,auth,userController.addUserFollowing);
//set delivery address of userF
route.post(routervalue.setDeliveryAddress,auth,userController.setDeliveryAddress);

//placing an order
route.get(routervalue.placeOrder,auth,orderController.placeOrder);
route.get(routervalue.removeOrder,auth,orderController.removeOrder);
route.get(routervalue.removeOrder,auth,orderController.removeOrder);
route.get(routervalue.removeOrder,auth,orderController.removeOrder);
route.get(routervalue.removeOrder,auth,orderController.removeOrder);
route.get(routervalue.removeOrder,auth,orderController.removeOrder);
//Get my orders
route.get(routervalue.myOrders,auth,orderController.myOrders);
route.get(routervalue.getCanceledProducts,auth,orderController.getCanceledProducts)
route.get(routervalue.getSuccessfulOrders,auth,orderController.getSuccessfulOrders)

route.get(routervalue.getCanceledProducts,auth,orderController.getCanceledProducts)
route.get(routervalue.getSuccessfulOrders,auth,orderController.getSuccessfulOrders)

route.get(routervalue.getCanceledProducts,auth,orderController.getCanceledProducts)
route.get(routervalue.getSuccessfulOrders,auth,orderController.getSuccessfulOrders)

route.get(routervalue.getCanceledProducts,auth,orderController.getCanceledProducts)
route.get(routervalue.getSuccessfulOrders,auth,orderController.getSuccessfulOrders)

route.get(routervalue.getCanceledProducts,auth,orderController.getCanceledProducts)
route.get(routervalue.getSuccessfulOrders,auth,orderController.getSuccessfulOrders)


//Get All pooled designs 
route.get(routervalue.getAllPooledDesigns,postController.getAllPooledDesigns);

//set categories (admin)
route.post(routervalue.setCategory, auth,upload.single("image"),adminController.uploadCategory);

//get all categories
route.get(routervalue.getAllCategories,auth,adminController.getCategories)

//upload 3d image
// route.post(routervalue.upload3d,[auth,mail],upload.single("image"),adminController.upload3d);
route.post(routervalue.upload3d,auth,upload.single("image"),adminController.upload3d);

//upload image for zigy.in
route.post(routervalue.uploadZigy,upload.single("image"),uploadController.uploadZigy);

//get other user data 
route.get(routervalue.getOtherUserInfo,auth,userController.getOtherUserInfo);

//add to Cart
// route.post(routervalue.addToCart,auth,userController.addToCart)

//remove from cart
route.get(routervalue.removefromCart,auth,userController.removeFromCart)

//get Cart
route.get(routervalue.getCart,userController.getCart)
route.get(routervalue.getCart,userController.getCart)
route.get(routervalue.getCart,userController.getCart)
route.get(routervalue.getCart,userController.getCart)

//get DeliveryAddress
route.get(routervalue.getDeliveryAddress,auth,userController.getDeliveryAddress)

//remove address
route.post(routervalue.removeAddressById,auth,userController.removeAddressById)
// route.post(routervalue.removeAddress,auth,userController.removeAddress)
// route.post(routervalue.removeAddress,auth,userController.removeAddress)
// route.post(routervalue.removeAddress,auth,userController.removeAddress)

//post rating for product
route.post(routervalue.postRatingProduct,auth,userController.postRatingProduct)

//get rating for product
route.get(routervalue.getRatingProduct,auth,userController.getRatingProduct)

//checkout
// route.post(routervalue.checkout,auth,paymentController.postcheckout);

//payment verification
// route.post(routervalue.paymentVerification,auth,paymentController.paymentVerification);

//razorpay 
route.get(routervalue.razorpay,auth,paymentController.razorpay_get)
route.post(routervalue.orderpost,auth,paymentController.api_payment_orderpost)
route.post(routervalue.verifypost , auth , paymentController.api_payment_verifypost)

//get razorpay key 
route.get(routervalue.razorpaykey,auth, paymentController.getrazorpaykey)

//get other user's posts & products
route.get(routervalue.getOtherUserPostsandProducts,auth , userController.getOtherUserPostsandProducts)

// get update product in the cart 

route.get(routervalue.getupdateproduct,auth,userController.getupdateproduct)

route.post(routervalue.savedDesign,auth,uploadController.savedDesign)

route.post(routervalue.unSaveDesign,auth,uploadController.unSaveDesign)
route.post(routervalue.uploadProfilePicture,auth,uploadController.uploadProfilePicture)
route.get(routervalue.getUserProfile,auth,uploadController.getUserProfile)
route.get(routervalue.getallProfileImages,uploadController.getallProfileImages)
// route.post(routervalue.uploadStory,auth,uploadController.uploadStory)
// route.post(
//   routervalue.uploadStory,auth,
//   upload.single("image"),
//   uploadController.uploadStory
// );
route.get(routervalue.searchProduct,uploadController.searchProduct)
route.get(routervalue.searchPost,uploadController.searchPost)
route.get(routervalue.searchUser,auth,uploadController.searchUser)
route.put(routervalue.reportPost,auth,uploadController.reportPost)
route.put(routervalue.hidePost,auth,uploadController.hidePost)
route.post(routervalue.favorites,auth,uploadController.favorites)
route.get(routervalue.topHashtagsforPosts,auth,uploadController.topHashtagsforPosts)
route.get(routervalue.topHashtagsforProducts,auth,uploadController.topHashtagsforProducts)
route.get(routervalue.productDetails,auth,uploadController.productDetails)
route.get(routervalue.postDetails,auth,uploadController.postDetails)

route.post(routervalue.createPool,uploadController.createPool)
route.get(routervalue.activePool,uploadController.activePool)
route.post(routervalue.joinPool,uploadController.joinPool)
route.get(routervalue.statusPool,uploadController.statusPool)
route.put(routervalue.closePool,uploadController.closePool)
route.get(routervalue.detailsOfPool,uploadController.detailsOfPool)
route.get(routervalue.imagesOfPooledProducts,uploadController.imagesOfPooledProducts)
route.get(routervalue.topcloth_categoryforProducts,auth,uploadController.topcloth_categoryforProducts)
// route.post(routervalue.uploadShopPagePosters,uploadController.uploadShopPagePosters)
route.get(routervalue.getImagesByAdmin,uploadController.getImagesByAdmin)

route.get(routervalue.searchHashtag,uploadController.searchHashtag)
route.get(routervalue.recommendedtopcloth_categoryforProducts,uploadController.recommendedtopcloth_categoryforProducts)

route.get(routervalue.userDetails,uploadController.userDetails)
route.post(routervalue.unFollow,userController.unFollow);
route.get(routervalue.getFollowingsInfo,uploadController.getFollowingsInfo)
route.get(routervalue.getFollowersInfo,uploadController.getFollowersInfo)
route.get(routervalue.getColorFabricSizeOfProduct,uploadController.getColorFabricSizeOfProduct)
route.get(routervalue.getAllDesignsScreenshot,uploadController.getAllDesignsScreenshot)
route.get(routervalue.getApparelsOfDesigns,uploadController.getApparelsOfDesigns)
route.get(routervalue.userFollowingFollowersCount,uploadController.userFollowingFollowersCount)
route.get(routervalue.featured_recommended_products,uploadController.featured_recommended_products)
route.post(routervalue.addCommentsToPost,uploadController.addCommentsToPost)
route.post(routervalue.addCommentsToPost,uploadController.addCommentsToPost)
route.post(routervalue.addCommentsToPost,uploadController.addCommentsToPost)
route.post(routervalue.addCommentsToPost,uploadController.addCommentsToPost)
route.post(routervalue.addCommentsToPost,uploadController.addCommentsToPost)
route.post(routervalue.addCommentsToPost,uploadController.addCommentsToPost)
route.get(routervalue.getComments,uploadController.getComments)
route.put(routervalue.updateUser,uploadController.updateUser)
route.get(routervalue.detailUser,uploadController.detailUser)
route.post(routervalue.support,uploadController.support)
route.get(routervalue.createdPostsAndSavedDesigns,uploadController.createdPostsAndSavedDesigns)
route.post(routervalue.updatePoolSuccessFail,uploadController.updatePoolSuccessFail)
route.get(routervalue.successRate,uploadController.successRate)
route.post(routervalue.likeAndUnlikeComment,uploadController.likeAndUnlikeComment)
route.post(routervalue.productFavorites,uploadController.productFavorites)
route.get(routervalue.addressOfUser,uploadController.addressOfUser)
route.post(routervalue.addAddress,uploadController.addAddress)
route.post(routervalue.createLinkedAccount,uploadController.createLinkedAccount)
route.post(routervalue.transfers,uploadController.transfers)
route.post(routervalue.addtocart,uploadController.addtocart)
// route.post(routervalue.removefromcart,uploadController.removefromcart)
route.get(routervalue.getAllCartProducts,uploadController.getAllCartProducts)
route.post(routervalue.removefromcart,uploadController.removefromcart)
route.get(routervalue.getSavedDesigns,uploadController.getSavedDesigns)
route.post(routervalue.addCoupon,uploadController.addCoupon)
route.post(routervalue.applyCoupon,uploadController.applyCoupon)
route.get(routervalue.getAllCoupons,uploadController.getAllCoupons)
route.get(routervalue.getFollowersAndFollowingInfo,uploadController.getFollowersAndFollowingInfo)
route.post(routervalue.followAndUnfollowUser,uploadController.followAndUnfollowUser)
route.post(routervalue.addReview,uploadController.addReview)

// const uploadMiddleware=require("../middleware/multer")
// route.post(routervalue.handleAdminUpload, uploadMiddleware.array('image'), adminUploadController.handleAdminUpload);
module.exports = route;

