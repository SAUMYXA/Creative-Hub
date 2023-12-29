export {};
import { Request, Response, NextFunction } from "express";
const Product = require("../model/ProductModle");
const User = require("../model/userModel");
const Post = require("../model/postModel");
const mongoose = require("mongoose");
const customlog = require("../controller/loggerController");

exports.search = async (req: any, res: any) => {
  
  try {
    const keyword = req.params.data;
    const minPrice = req.params.minPrice || 0;
    const maxPrice = req.params.maxPrice || 2000;
    const filter = req.query.filter;
    const currentUserId = req.user.id;
    let products = [];
    let posts = [];
    let pooled_designs = [];
    let users = [];
    let hashtags = [];
    if (filter === "products" || filter === undefined) {
        products = await Product.find({
            $or: [
              { name: { $regex: keyword, $options: "i" } },
              { caption: { $regex: keyword, $options: "i" } },
              { productDetails: { $regex: keyword, $options: "i" } },
              { description: { $regex: keyword, $options: "i" } },
              { colour_available: { $regex: keyword, $options: "i" } },
              { cloth_category: { $regex: keyword, $options: "i" } },
              { fabric_available: { $regex: keyword, $options: "i" } },
              { location: { $regex: keyword, $options: "i" } },
              { hashtags: { $regex: keyword, $options: "i" } },
              { price: { $gte: minPrice, $lte: maxPrice } },
            ],
          });
    }

    if (filter === "posts" || filter === undefined) {
      posts = await Post.find({
        $or: [
          { caption: { $regex: keyword, $options: "i" } },
          { location: { $regex: keyword, $options: "i" } },
          { hashtags: { $regex: keyword, $options: "i" } },
        ],
      });
    }

    if (filter === "pooled_designs" || filter === undefined) {
      pooled_designs = await Product.find({
        pooled_user: { $exists: true, $ne: [] },
      });
    }

    if (filter === "users") {
      console.log("calling");
      const user = await User.find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { username: { $regex: keyword, $options: "i" } },
        ],
      });

      users = user.map((userData: any) => {
        const isFollowing = userData.followers.includes(currentUserId);
        return {
          username: userData.username,
          avatar: userData.avatar,
          name: userData.name,
          UID: userData.UID,
          isFollowing,
        };
      });
    }
  
    if(filter === "hashtag"){
      hashtags = await Product.find({
        hashtags: { $regex: keyword, $options: "i" },
      });  
    }
    res.json({ products, posts, pooled_designs, users, hashtags });
    customlog.log("info", "route: /search/:data msg: success");
  } catch (err) {
    customlog.log("error", "error searching");
    res.json({ error: err });
  }
};

exports.addUserToPool = async (req: any, res: any) => {
  try {
    const product = await Product.findById(req.params.productId);
    const user = await User.findById(req.user._id);
    console.log(product);
    console.log(user);
    product.pooled_user.push(req.user._id);
    user.pooled_design.push(product._id);
    user.save();
    product.save();
    res.json(product);
    customlog.log("info", "route: /pooldesign/:productId msg: success");
  } catch (err) {
    customlog.log("error", "error adding user to pool");
    res.json({ error: err });
  }
};

exports.getAllProducts = async (req: any, res: any) => {
  try {
    const call = Number(req.params.call);
    const number = Number(req.params.number);
    const products = await Product.find();
    console.log(products.slice(call * number, (call + 1) * number));
    res.json(products.slice(call * number, (call + 1) * number));
    customlog.log("info", "route: /getAllProducts/:number/:call msg: success");
  } catch (err) {
    customlog.log("error", "error fetching products for homepage");
    res.json({ error: err });
  }
};

exports.getProductInfo = async (req: any, res: any) => {
  try {
    let product = await Product.findById(req.params.id);
    res.json(product);
    customlog.log("info", "route: /product/info/:id msg: success");
  } catch (err) {
    customlog.log("error", "Error fetching product info");
    res.json({ error: err });
  }
};

exports.likeandUnlikeProduct = async (req: any, res: any) => {
  try {
    const product = await Product.findById(req.params.id);
    const user = await User.findById(req.user._id);
    // const user = await User.findById(req.user._id);
    if (!product) {
      customlog.log("error", "error liking product");
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    if (product.likes.includes(req.user._id)) {
      try {
        const indexProduct = product.likes.indexOf(req.user._id);
        const indexUser = user.likedProduct.indexOf(req.params.id);
        // console.log(req.user._id);
        product.likes.splice(indexProduct, 1);
        user.likedProduct.splice(indexUser, 1);
        // post.likes.pull(user._id)
        await product.save();
        await user.save();
        return res.status(200).json({
          success: true,
          message: "unliked",
        });
      } catch (err) {
        customlog.log("error", "error liking product");
        res.json({
          err: err,
        });
      }
    } else {
      product.likes.push(req.user._id);
      user.likedProduct.push(req.params.id);
      await product.save();
      await user.save();
      // console.log(user);
      res.status(200).json({
        success: true,
        message: "liked",
      });
      customlog.log("info", "route: /product/like/:id msg: success");
    }
  } catch (err) {
    customlog.log("error", "error liking product");
    res.json({ error: err });
  }
};

exports.getLikedProducts = async (req: any, res: any) => {
  try {
    let userId = req.user._id;
    let userData = await User.findById(userId);
    let likedProducts = String(userData.likedProduct);
    console.log(likedProducts);
    if (likedProducts) {
      let likedProductsData = await Product.find({
        _id: likedProducts.split(","),
      });
      res.json(likedProductsData);
    } else {
      res.json({ msg: "no liked product" });
    }
    customlog.log("info", "route: /getLikedProducts msg: success");
  } catch (err) {
    customlog.log("error", "error fetching liked products");
    res.json({ error: err });
  }
};

exports.getLikedPosts = async (req: any, res: any) => {
  try {
    let userId = req.user._id;
    let userData = await User.findById(userId);
    let likedPosts = String(userData.likedPost);
    if (likedPosts) {
      let likedPostsData = await Post.find({ _id: likedPosts.split(",") });
      res.json(likedPostsData);
    } else {
      res.json({ msg: "no liked product" });
    }
    customlog.log("info", "route: /getLikedPosts msg: success");
  } catch (err) {
    customlog.log("error", "error fetching liked post");
    res.json({ error: err });
  }
};

exports.addToWishlist = async (req: any, res: any) => {
  try {
    const product = await Product.findById(req.params.id);
    let userId = req.user._id;
    let user = await User.findById(userId);
    console.log(user);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }
    if (user.wishList.includes(req.params.id)) {
      try {
        const indexProduct = user.wishList.indexOf(req.params.id);
        user.wishList.splice(indexProduct, 1);
        await user.save();
        return res.status(200).json({
          success: true,
          message: "removed from wishlist",
        });
      } catch (err) {
        customlog.log("error", "error wishlisting product");
        res.json({
          err: err,
        });
      }
    } else {
      user.wishList.push(req.params.id);
      await user.save();
      res.status(200).json({
        success: true,
        message: "added to wishlist",
      });
    }
    customlog.log("info", "route: /addToWishlist/:id msg: success");
  } catch (err) {
    customlog.log("error", "error wishlisting product");
    res.json({ error: err });
  }
};
exports.removeFromWishlist = async (req: any, res: any) => {
  try {
    const product = await Product.findById(req.params.id);
    let userId = req.user._id;
    let user = await User.findById(userId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (user.wishList.includes(req.params.id)) {
      try {
        const indexProduct = user.wishList.indexOf(req.params.id);
        user.wishList.splice(indexProduct, 1);
        await user.save();
        return res.status(200).json({
          success: true,
          message: "Removed from wishlist",
        });
      } catch (err) {
        console.error('Error removing from wishlist:', err);
        res.status(500).json({
          success: false,
          message: "Internal Server Error",
        });
      }
    } else {
      res.status(404).json({
        success: false,
        message: "Product not found in wishlist",
      });
    }
  } catch (err) {
    console.error('Error removing from wishlist:', err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


// Controller to get wishlist by list name
// Import the necessary models




// API route to get wishlisted products by listName
exports.getWishlistByListName = async (req:any, res:any) => {
  try {
    const { listName } = req.params;
    const userId = req.user._id; // Assuming you have middleware to get the user from the token

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Find the wishlist by name directly
    const wishlist = await User.findOne(
      { _id: userId, 'wishList.name': listName },
      { 'wishList.$': 1 }
    );

    if (!wishlist || !wishlist.wishList || wishlist.wishList.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found',
      });
    }

    // Get detailed information about products in the wishlist
    const detailedProducts = await Promise.all(
      wishlist.wishList[0].products.map(async (productId:any) => {
        const product = await Product.findById(productId);
        return {
          productName: product?.name,
          image: product?.imageUrl,
          productDesc: product?.productDetails,
          ownerName: product?.owner.name,
          ownerId: product?.owner._id,
          rating: product?.rating,
          size: product?.sizes_available,
          color: product?.colour_available,
          price: product?.price,
          discount: product?.discount,
        };
      })
    );

    res.json({
      success: true,
      wishlist: detailedProducts,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    });
  }
};




exports.postReviewProduct = async (req: any, res: any) => {
  try {
    let userId = req.user._id;
    let userData = await User.findById(userId);
    //at a later stage add functionality to allow posting review by those who actually bought the product
    const product = await Product.findById(req.params.id);
    let review = req.body.review;
    // console.log(review);
    if (review) {
      product.review.push({ user: userId, comment: review });
      await product.save();
      res.json({ msg: "review added" });
    } else {
      res.json({ msg: "invalid input" });
    }
    customlog.log("info", "route: /postReviewProduct/:id msg: success");
  } catch (err) {
    customlog.log("error", "error posting review for product");
    res.json({ error: err });
  }
};

exports.postRatingProduct = async (req: any, res: any) => {
  try {
    let userId = req.user._id;
    let userData = await User.findById(userId);
    const product = await Product.findById(req.params.id);
    const rating = req.params.rating;
    let obj = product.rating.find(
      (o: any) => String(o.user) === String(req.user._id)
    );
    console.log(obj);
    if (!obj) {
      product.rating.push({ user: userId, rating: rating });
      await product.save();
      res.json({ msg: "rating added" });
    } else {
      product.rating.find(
        (o: any) => String(o.user) === String(req.user._id)
      ).rating = rating;
      await product.save();
      res.json({ msg: "rating updated" });
    }
    customlog.log("info", "route: /postRatingProduct/:id/:rating msg: success");
  } catch (err) {
    customlog.log("error", "error rating product");
    res.json({ error: err });
  }
};

exports.getReviewProduct = async (req: any, res: any) => {
  try {
    const product = await Product.findById(req.params.id);
    console.log(product.review);
    res.json(product.review);
    customlog.log("info", "route: /getReviewProduct/:id msg: success");
  } catch (err) {
    customlog.log("error", "error fetching product review");
    res.json({ error: err });
  }
};

exports.getPooledDesign = async (req: any, res: any) => {
  try {
    let userId = req.user._id;
    let userData = await User.findById(userId);
    console.log(userData.pooled_design);
    res.json(userData.pooled_design);
    customlog.log("info", "route: /getPooledDesign msg: success");
  } catch (err) {
    customlog.log("error", "error fetching pooled designs");
    res.json({ error: err });
  }
};

exports.getWishlist = async (req: any, res: any) => {
  try {
    let userId = req.user._id;
    let userData = await User.findById(userId);
    console.log(userData.wishList);
    res.json(userData.wishList);
    customlog.log("info", "route: /getWishlist msg: success");
  } catch (err) {
    customlog.log("error", "error fetching wishlist");
    res.json({ error: err });
  }
};

exports.getProductsHashtag = async (req: any, res: any) => {
  try {
    const products = await Product.find({
      hashtags: { $regex: req.params.hashtag },
    });
    res.json(products);
    customlog.log("info", "route: /getProductsHashtag/:hashtag msg: success");
  } catch (err) {
    customlog.log("error", "error fetching hashtagged products");
    res.json({ error: err });
  }
};
exports.getUserProducts = async (req: any, res: any) => {
  try {
    let userId = req.user._id;
    let userData = await User.findById(userId);
    const products = await Product.find({
      _id: { $in: userData.products },
    });
    res.json(products);
    console.log(products);
    customlog.log("info", "route: /getUserProducts msg: success");
  } catch (err) {
    customlog.log("error", "error fetching user products");
    res.json({ error: err });
  }
};

exports.getUserPosts = async (req: any, res: any) => {
  try {
    let userId = req.user._id;
    let userData = await User.findById(userId);
    const posts = await Post.find({
      _id: { $in: userData.posts },
    });
    res.json(posts);
    console.log(posts);
    customlog.log("info", "route: /getUserPosts msg: success");
  } catch (err) {
    customlog.log("error", "error fetching user posts");
    res.json({ error: err });
  }
};

exports.getAllPooledDesigns = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pooledDesign = await Product.find({
      pooled_user: { $exists: true, $ne: [] },
    });

    res.status(200).json(pooledDesign);
    customlog.log("info", "route: /getAllPooledDesign(s) msg: success");
  } catch (err) {
    customlog.log("error", "error fetching all pooled products");
    res.json({ error: err });
  }
};

exports.postreplycommentpost = async (req: any, res: any) => {
  try {
    const comment = await Post.comments.findById(req.params.id);
    let replycomment = req.body.replycomment;
    let userid = req.user._id;

    if (replycomment) {
      Post.comment.replies.push({ user: userid });
    }
  } catch (err) {
    customlog.log("error", "error posting the comment");
    res.json({ error: err });
  }
};
