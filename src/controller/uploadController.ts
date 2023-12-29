export {};
// var cloudinary = require('../services/cloudinary');
const cloudinary = require('cloudinary').v2;
const cloudiConfig = require('../services/cloudinary');
// const upload = require('../middleware/multer');
const Product = require('../model/ProductModle');
const Post = require('../model/postModel');
const User = require('../model/userModel');
const zigyUser = require('../model/zigyUserModel');
const Pool=require('../model/poolingModel')
const Design=require("../model/designModel")
// const Pool=require('../model/poolingModel')
// const Pool=require('../model/poolingModel')
// const Pool=require('../model/poolingModel')
const mongoose = require('mongoose');
const io=require("socket.io")
// const { S3Client, PutObjectCommand,GetObjectCommand } = require("@aws-sdk/client-s3");
const sharp = require('sharp');
const bcrypt = require('bcryptjs');
// const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const {
    S3
} = require("@aws-sdk/client-s3");
const AWS = require("aws-sdk");
const {v4 : uuidv4} = require('uuid')
const customlog=require("../controller/loggerController")
const fs = require("fs");
// const Story = require('../model/storyModel');
const Admin=require('../model/adminModel')
// const Admin=require('../model/adminModel')
// const Admin=require('../model/adminModel')
// const Admin=require('../model/adminModel')
// const Admin=require('../model/adminModel')
// const Admin=require('../model/adminModel')

type s3params= {
    Bucket: string,
    Key: string,
    Body: Buffer,
    ContentType: string,
    ACL: string
}

type product = {
    name: string,
    imageName: string,
    price: number,
    sizes_available: string,
    cloth_category: string,
    caption: string,
    productDetails: string,
    hashtags: string[],
    avatar: string,
    copyright: string,
    imageUrl: string,
    location: string,
}

type post={
    caption: string,
    imageName: string,   
    hashtags: string[],
    taggedOwner: string[],
    avatar: string,
    imageUrl: string,
    owner: string,
    location: string,
}

type zigyUserType={
    name: string,
    email: string,
    phone: number,
    product: {
    productId: String
    designUrl: String
    }[]
}

cloudiConfig;

const BUCKET_NAME=process.env.BUCKET_NAME;
const BUCKET_REGION=process.env.BUCKET_REGION;    
const ACCESS_KEY=process.env.ACCESS_KEY;
const SECRET_ACCESS_KEY=process.env.SECRET_ACCESS_KEY;



const s3=new S3({
    credentials:{
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
    region:BUCKET_REGION
})


exports.uploadProduct = async (req : any, res: any) => {
    try {
      let user = await User.findById(req.user._id);
      let hashtagsArr = req.body.hashtags.split("#");
      hashtagsArr.shift();
  
      const newId = uuidv4();
      console.log(newId);
      const objectToHash = {
        uuid: newId,
        productName: req.body.name
      };
      let imageName = await bcrypt.hash(JSON.stringify(objectToHash), 10);
      imageName = imageName.replaceAll('/', '');
      console.log(imageName);

      if (
        req.file.mimetype !== "image/jpeg" &&
        req.file.mimetype !== "image/png" &&
        req.file.mimetype !== "image/gif" &&
        req.file.mimetype !== "image/jpg" && 
        req.file.mimetype !== "image/webp"
      ) {
        return res.status(200).json({ Error: "Invalid file type" });
      }
  
  
      const productObject : {

        name : any;
        imageName: any;
        price:any;
        sizes_available:any;
        cloth_category:any;
        caption:any;
        productDetails:any;
        hashtags:any;
        avatar:any;
        copyright:any;
        imageUrl?: string;
        location:any;

      }  = {
        name: req.body.name,
        imageName: imageName,
        price: req.body.price,
        sizes_available: req.body.sizes,
        cloth_category: req.body.cloth_category,
        caption: req.body.caption,
        productDetails: req.body.productDetails,
        hashtags: hashtagsArr,
        avatar: user._id,
        copyright: req.body.copyright,
        imageUrl:'',
        location: req.body.location,
      }
  
    //   const params = {
    //     Bucket: BUCKET_NAME + `/main/user/${req.user.UID}/upload/product`,
    //     Key: imageName,
    //     Body: buffer,
    //     ContentType: req.file.mimetype,
    //     ACL: 'public-read'
    //   };
  
    //   await s3.putObject(params).promise();
    //   product.imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/main/user/${req.user.UID}/upload/product/${imageName}`;
  
    cloudinary.uploader.upload(
        req.file.path,
        { resource_type: "image" },
        async (err: any, result: any) => {
        if (err) {
          customlog.log('error', 'error while uploading the product');
          throw err;
        } else {
          productObject.imageUrl = result.secure_url;
          const newProductDoc = await Product.create(productObject);
          if (newProductDoc) {
            console.log(newProductDoc);
            user.products.push(newProductDoc._id);
            await user.save();
            const productId = newProductDoc._id;
            res.json({ msg: "product added", productId });
          }
        }
      })
  
      customlog.log('info', 'route: /temporary-token msg: success');
    } catch (err:any) {
      console.log(err);
      customlog.log('error', 'error while uploading the product');
      res.send({
        success: false,
        msg: err.message || "Error occurred while uploading the product",
      });
    }
  }
  

//get all posts to home page or all posts 
exports.getAllPosts = async (req: any, res: any) => {
    try{
        const call=Number(req.params.call);
        const number=Number(req.params.number);
        const posts=await Post.find();
        console.log(posts.slice(call*number,(call+1)*number));
        res.json(posts.slice(call*number,(call+1)*number));
        customlog.log('info','route: /posts/:number/:call msg: success');
    }
    catch(err:any){
        customlog.log('error','error while fetching post');
        res.status(500).send({
            message: err.message || "Error Occurred while retriving all posts information"
        })
    }
}

//get particular product info
exports.getPostInfo = async (req: any, res: any) => {
  try {
    const postId = req.params.id;
    
    const post = await Post.findById(postId)
      .populate({
        path: 'owner',
        model: 'User',
        select: 'name ProfileUrl',
      })
      .populate({
        path: 'likes',
        model: 'User',
        select: 'name ProfileUrl',
      })
      .populate({
        path: 'taggedOwner',
        model: 'User',
        select: 'name ProfileUrl',
      })
      .populate({
        path: 'comments.user',
        model: 'User',
        select: 'name avatar ProfileUrl',
      })
      .populate({
        path: 'comments.replies.personReplying',
        model: 'User',
        select: 'name avatar ProfileUrl',
      });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
    customlog.log('info', 'route: /post/info/:id msg: success');
  } catch (error) {
    customlog.log('error', 'error while fetching post info');
    // res.status(500).json({ error: error.message });
  }
};



// exports.uploadPost = async (req: any, res: any) => {
//     try {
//       let hashtagsArr = req.body.hashtags.split("#");
//       hashtagsArr.shift();
//       const user = await User.findById(req.user._id);
//       console.log(req.body);
//       const newId = uuidv4();
//       const objectToHash = {
//         uuid: newId,
//         productName: req.body.caption,
//       };
//       let imageName = await bcrypt.hash(JSON.stringify(objectToHash), 10);
//       imageName = imageName.replaceAll("/", "");
//       console.log(imageName);
// exports.uploadPost = async (req: any, res: any) => {
//     try {
//       let hashtagsArr = req.body.hashtags.split("#");
//       hashtagsArr.shift();
//       const user = await User.findById(req.user._id);
//       console.log(req.body);
//       const newId = uuidv4();
//       const objectToHash = {
//         uuid: newId,
//         productName: req.body.caption,
//       };
//       let imageName = await bcrypt.hash(JSON.stringify(objectToHash), 10);
//       imageName = imageName.replaceAll("/", "");
//       console.log(imageName);
  
//       if (
//         req.file.mimetype !== "image/jpeg" &&
//         req.file.mimetype !== "image/png" &&
//         req.file.mimetype !== "image/gif" &&
//         req.file.mimetype !== "image/jpg" && 
//         req.file.mimetype !== "image/webp"
//       ) {
//         return res.status(200).json({ Error: "Invalid file type" });
//       }
//       if (
//         req.file.mimetype !== "image/jpeg" &&
//         req.file.mimetype !== "image/png" &&
//         req.file.mimetype !== "image/gif" &&
//         req.file.mimetype !== "image/jpg" && 
//         req.file.mimetype !== "image/webp"
//       ) {
//         return res.status(200).json({ Error: "Invalid file type" });
//       }
  
//       const postObject: {
//         caption: any;
//         imageName: any;
//         hashtags: any;
//         taggedOwner: any;
//         avatar: any;
//         owner: any;
//         location: any;
//         imageUrl?: string;
//       } = {
//         caption: req.body.caption,
//         imageName: imageName,
//         hashtags: hashtagsArr,
//         taggedOwner: JSON.parse(req.body.taggedOwner),
//         avatar: req.user._id,
//         owner: req.user._id,
//         location: req.body.location,
//       };
//       const postObject: {
//         caption: any;
//         imageName: any;
//         hashtags: any;
//         taggedOwner: any;
//         avatar: any;
//         owner: any;
//         location: any;
//         imageUrl?: string;
//       } = {
//         caption: req.body.caption,
//         imageName: imageName,
//         hashtags: hashtagsArr,
//         taggedOwner: JSON.parse(req.body.taggedOwner),
//         avatar: req.user._id,
//         owner: req.user._id,
//         location: req.body.location,
//       };
  
//       cloudinary.uploader.upload(
//         req.file.path,
//         { resource_type: "image" },
//         async (err: any, result: any) => {
//           if (err) {
//             console.error("Error while uploading post to Cloudinary:", err);
//             res.send({
//               success: false,
//               msg: err.message || "Error occurred while uploading post",
//             });
//           } else {
//             postObject.imageUrl = result.secure_url;
//             const newPostDoc = await Post.create(postObject);
//             if (newPostDoc) {
//               console.log(newPostDoc);
//               user.posts.push(newPostDoc._id);
//               await user.save();
//               res.json({ msg: "post added" });
//               customlog.log("info", "route: /post/upload msg: success");
//             }
//           }
//         }
//       );
//     } catch (err: any) {
//       console.error("Error while uploading post:", err);
//       res.send({
//         success: false,
//         msg: err.message || "Error occurred while uploading post",
//       });
//     }
//   };
//       cloudinary.uploader.upload(
//         req.file.path,
//         { resource_type: "image" },
//         async (err: any, result: any) => {
//           if (err) {
//             console.error("Error while uploading post to Cloudinary:", err);
//             res.send({
//               success: false,
//               msg: err.message || "Error occurred while uploading post",
//             });
//           } else {
//             postObject.imageUrl = result.secure_url;
//             const newPostDoc = await Post.create(postObject);
//             if (newPostDoc) {
//               console.log(newPostDoc);
//               user.posts.push(newPostDoc._id);
//               await user.save();
//               res.json({ msg: "post added" });
//               customlog.log("info", "route: /post/upload msg: success");
//             }
//           }
//         }
//       );
//     } catch (err: any) {
//       console.error("Error while uploading post:", err);
//       res.send({
//         success: false,
//         msg: err.message || "Error occurred while uploading post",
//       });
//     }
//   };

  
// updated cloudinary
// exports.uploadPost = async (req: any, res: any) => {
//     try {
//       let hashtagsArr = req.body.hashtags.split("#");
//       hashtagsArr.shift();
//       const user = await User.findById(req.user._id);
//       console.log(req.body);
//       const newId = uuidv4();
//       const objectToHash = {
//         uuid: newId,
//         productName: req.body.caption,
//       };
//       let imageName = await bcrypt.hash(JSON.stringify(objectToHash), 10);
//       imageName = imageName.replaceAll("/", "");
//       console.log(imageName);
  
//       // AWS.config.update({
//       //   accessKeyId: "YOUR_AWS_ACCESS_KEY_ID",
//       //   secretAccessKey: "YOUR_AWS_SECRET_ACCESS_KEY",
//       //   region: "YOUR_AWS_REGION",
//       // });
  
//       // const s3 = new AWS.S3();
  
//       if (
//         req.file.mimetype !== "image/jpeg" &&
//         req.file.mimetype !== "image/png" &&
//         req.file.mimetype !== "image/gif" &&
//         req.file.mimetype !== "image/jpg"
//       ) {
//         return res.status(200).json({ Error: "Invalid file type" });
//       }
  
//       const fileContent = fs.readFileSync(req.file.path);
  
//       // const params = {
//       //   Bucket: "canverro-bucket-test",
//       //   Key: `uploads/${Date.now()}-${req.file.originalname}`, // Use the original filename or generate a unique filename here
//       //   Body: fileContent,
//       //   ACL: "public-read", // Set the ACL to make the file publicly accessible
//       // };
  
//       // try {
//       //   await s3.upload(params).promise();
  
//       fs.unlinkSync(req.file.path);
  
//       let postObject: {
//         caption: any;
//         imageName: any;
//         hashtags: any;
//         taggedOwner: any;
//         avatar: any;
//         owner: any;
//         location: any;
//         imageUrl?: string; // Add the optional 'imageUrl' property of type 'string'
//       } = {
//         caption: req.body.caption,
//         imageName: imageName,
//         hashtags: hashtagsArr,
//         taggedOwner: JSON.parse(req.body.taggedOwner),
//         avatar: req.user._id,
//         owner: req.user._id,
//         location: req.body.location,
//       };
  
//       cloudinary.uploader.upload_stream(
//         {
//           resource_type: "image",
//           timeout : 120000,
//         },
//         async (err: any, result: any) => {
//           if (err) {
//             customlog.log("error", "error while uploading post");
//             console.error("Error while uploading post to Cloudinary:", err);
//             res.send({
//               success: false,
//               msg: err.message || "Error occurred while uploading post",
//             });
//           } else {
//             postObject.imageUrl = result.secure_url;
//             const newPostDoc = await Post.create(postObject);
//             if (newPostDoc) {
//               console.log(newPostDoc);
//               user.posts.push(newPostDoc._id);
//               await user.save();
//               res.json({ msg: "post added" });
//               customlog.log("info", "route: /post/upload msg: success");
//             }
//           }
//         }
//       );
  
//     } catch (err: any) {
//       console.error("Error while uploading post:", err);
//       res.send({
//         success: false,
//         msg: err.message || "Error occurred while uploading post",
//       });
//     }
//   };
  
exports.likeandUnlikePost = async (req: any, res: any) => {
    try {
        const post = await Post.findById(req.params.id);
        const user = await User.findById(req.user._id);
        // const user = await User.findById(req.user._id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            })
        }
        if (post.likes.includes(req.user._id)) {
            try{
            const indexPost = post.likes.indexOf(req.user._id);
            const indexUser = user.likedPost.indexOf(req.params.id);
            // console.log(req.user._id);
            post.likes.splice(indexPost, 1);
            user.likedPost.splice(indexUser, 1);
            // post.likes.pull(user._id)
            await post.save();
            await user.save();
            customlog.log('info','route: /post/like/:id msg: success');
            return res.status(200).json({
                success: true,
                message: "unliked",
            })
        }
        catch(err){
            customlog.log('error','error while liking/unliking post');
            res.json({
                err:err
            })
        }
        } else {
            post.likes.push(req.user._id);
            user.likedPost.push(req.params.id);
            await post.save();
            await user.save();
            console.log(user);
            customlog.log('info','route: /post/like/:id msg: success');
            res.status(200).json({
                success: true,
                message: "liked",
            })
        }
    } catch (err) {
        customlog.log('error','error while liking/unliking post');
        res.json({error:err})
    }
}

exports.deletePost = async (req: any, res: any) => {
    try {

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            })
        }

        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            })
        }

        await post.remove();

        const user = await User.findById(req.user._id);
        const index = await user.posts.indexOf(req.params.id);
        user.posts.splice(index, 1);
        await user.save();
        customlog.log('info','route: /post/:id(delete) msg: success');
        res.status(200).json({
            success: true,
            message: "Post deleted",
        })
    } catch (err: any) {
        customlog.log('error','error deleting post');
        res.status(500).json({
            success: false,
            message: err.message || "Error Occurred while deleting post",
        })
    }
}
/**
 * Folloe User and Folliwings
 */
exports.subscribeUser = async (req: any, res: any) => {
    try {
        const userToSubscribe = await User.findById(req.params.id);
        const loggedUser = await User.findById(req.user._id);
        if (!userToSubscribe) {
            return res.status(
                404).json({
                    success: false,
                    message: "User not found"
                })
        }
        if (loggedUser.following.includes(userToSubscribe._id)) {
            const indexSubscribed = loggedUser.following.indexOf(userToSubscribe._id)
            loggedUser.following.splice(indexSubscribed, 1);
            userToSubscribe.followers.splice(indexSubscribed, 1);
            await loggedUser.save();
            await userToSubscribe.save();
            customlog.log('info','route: /subscribe/:id msg: success');
            res.status(200).json({
                success: true,
                message: "User Unsubscribed Successfully!!!"
            })
        } else {
            loggedUser.following.push(userToSubscribe._id);
            userToSubscribe.followers.push(loggedUser._id);
            await loggedUser.save();
            await userToSubscribe.save();
            customlog.log('info','route: /subscribe/:id msg: success');
            res.status(200).json({
                success: true,
                message: "User Subscribed Successfully!!!"
            })
        }
    } catch (err: any) {
        customlog.log('error','error subscribing user');
        res.status(500).json({
            success: false,
            message: err.message || "Error Occurred while following user"
        })
    }
}

//! Remaining Not working get Look into that
exports.getPostsOfFollowing = async (req: any, res: any) => {
    try {
        const user = await User.findById(req.user._id);
        // const post = 
        const posts = await Post.find({
            owner: {
                $in: user.following,
            },
        });
        customlog.log('info','route: /getPosts msg: success');
        res.status().json({
            success: true,
            posts,
        })
    } catch (err: any) {
        customlog.log('error','error subscribing user');
        res.status(500).json({
            success: false,
            message: err.message || "Error Occurred while getting posts of following"
        })
    }
}


exports.updateCaption = async (req: any, res: any) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            customlog.log('info','route: /updateCaption/:id msg: success');
            return res.status(404).json({
                success: false,
                message: "Post not found",
            })
        }
    } catch (err: any) {
        customlog.log('error','error updating caption');
        res.send(err.message || "Error Occurred while updating caption")
    }
}



exports.uploadZigy = async (req:any, res:any) => {
    try {
        // console.log(newuser);
        let usercheck=await zigyUser.findOne({email:req.body.email});
        let newuser: zigyUserType ={
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            product: []
        }
        if(usercheck){
            newuser=usercheck
        }
        const newId = uuidv4();
        const objectToHash = {
            uuid: newId,
            productId: req.body.productId
        };
        let imageName=await bcrypt.hash(JSON.stringify(objectToHash),10);
        imageName=imageName.replaceAll('/','');

        const buffer= await sharp(req.file.buffer).resize({height:1920,width:1080,fit:"contain"}).toBuffer();
        const params: s3params={
            Bucket:BUCKET_NAME+`/main/zigy/user/${newuser.email}/upload/design`,
            Key: imageName,
            Body: buffer,
            ContentType: req.file.mimetype,
            ACL:'public-read'
        }
        await s3.putObject(params);
        let imageUrl=`https://${BUCKET_NAME}.s3.amazonaws.com/main/zigy/user/${newuser.email}/upload/design/${imageName}`;
        if(!newuser.product){
            newuser.product=[{
                productId: req.body.productId,
                designUrl: imageUrl
            }]
        }
        else{
            newuser.product.push({
                productId: req.body.productId,
                designUrl: imageUrl
            })    
        };
        const newZigyDoc=await zigyUser.create(newuser)
        if (newZigyDoc) { 
            console.log(newZigyDoc);
        }        
        res.json({msg:"design added for zigy"});
        customlog.log('info','route: /uploadZigy msg: success');
    } catch (err: any) {
        customlog.log('error','error while uploading the desing in zigy');
        res.send({
            success: false,
            msg: err.message || "Error Occurred while uploading desing in zigy",
        });
    }
}
exports.removeFiles = async (req: any, res: any) => {
    fs.rmdir('uploads/', { recursive: true }, (err: NodeJS.ErrnoException | null) => {
      if (err && err.code === 'ENOENT') {
        // Directory doesn't exist
        console.info("Directory doesn't exist, won't remove it.");
      } else if (err) {
        // Other errors, e.g. maybe we don't have enough permission
        console.error("Error occurred while trying to remove directory", err);
      } else {
        console.info("Directory removed");
      }
    });
  };
  

  exports.savedDesign = async (req:any,res:any) => {
    const user_id=req.body._id;
    const design_id = req.params.id;

        try{
            const user= await User.findById(user_id)
           
            if(!user.savedDesign.includes(design_id)){
               await user.updateOne({$push: {savedDesign:design_id}})
            
               res.status(200).json({"msg":"design saved successfully"})
            }
            else{
              return res.status(403).json({"msg":"design already saved"})
            }
        }
        catch{
            res.status(200).json({"msg":"failed"})
        } 
    }

    exports.unSaveDesign = async (req:any,res:any) => {
        const user_id=req.body._id;
        const design_id = req.params.id;
    
            try{
                const user= await User.findById(user_id)
               
                if(user.savedDesign.includes(design_id)){
                   await user.updateOne({$push: {savedDesign:design_id}})
                
                   res.status(200).json({"msg":"design saved successfully"})
                }
                else{
                  return res.status(403).json({"msg":"design already saved"})
                }
            }
            catch{
                res.status(200).json({"msg":"failed"})
            }
      
          
        }
exports.uploadPost = async (req : any, res: any) => {
    try {
      let user = await User.findById(req.user._id);
      console.log(user)
      let hashtagsArr = req.body.hashtags.split("#");
      hashtagsArr.shift();
  
      const newId = uuidv4();
      console.log(newId);
      const objectToHash = {
        uuid: newId,
        // postName: req.body.name
        // postName: req.body.name
        // postName: req.body.name
        // postName: req.body.name
        // postName: req.body.name
        // postName: req.body.name
        // postName: req.body.name
      };
      let imageName = await bcrypt.hash(JSON.stringify(objectToHash), 10);
      imageName = imageName.replaceAll('/', '');
      console.log(imageName);

      if (
        req.file.mimetype !== "image/jpeg" &&
        req.file.mimetype !== "image/png" &&
        req.file.mimetype !== "image/gif" &&
        req.file.mimetype !== "image/jpg" && 
        req.file.mimetype !== "image/webp"
      ) {
        return res.status(200).json({ Error: "Invalid file type" });
      }
  
  
  
     const postObject: {
        caption: any;
        imageName: any;
        hashtags: any;
        taggedOwner: any;
        avatar: any;
        owner: any;
        location: any;
        imageUrl?: string;
      } = {
        caption: req.body.caption,
        imageName: imageName,
        hashtags: hashtagsArr,
        taggedOwner: JSON.parse(req.body.taggedOwner),
        avatar: req.user._id,
        owner: req.user._id,
        location: req.body.location,
        imageUrl:""
      };
  
  
  
    cloudinary.uploader.upload(
        req.file.path,
        { resource_type: "image" },
        async (err: any, result: any) => {
        if (err) {
          customlog.log('error', 'error while uploading the post');
          throw err;
        } else {
          postObject.imageUrl = result.secure_url;
          const newPostDoc = await Post.create(postObject);
          if (newPostDoc) {
            console.log(newPostDoc);
            user.posts.push(newPostDoc._id);
            await user.save();
            const postId = newPostDoc._id;
            res.json({ msg: "product added", postId });
          }
        }
      })
  
      customlog.log('info', 'route: /temporary-token msg: success');
    } catch (err:any) {
      console.log(err);
      customlog.log('error', 'error while uploading the post');
      res.send({
        success: false,
        msg: err.message || "Error occurred while uploading the post",
      });
    }
  }
  // profilePictureController.js
//   const multer = require('multer');
// const path = require('path');


// // Configure multer to store uploaded files in a directory (e.g., "uploads").
// const storage = multer.diskStorage({
//   destination: (req:any, file:any, cb:any) => {
//     cb(null, 'uploads');
//   },
//   filename: (req:any, file:any, cb:any) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage: storage });

// // Middleware for handling profile picture uploads.
// function uploadProfilePicture(req:any, res:any, next:any) {
//   const username = req.body.username;
//   const profilePictureUrl = req.file ? req.file.path : null;
// console.log(profilePictureUrl)
//   if (!username || !profilePictureUrl) {
//     return res.status(400).json({ error: 'Missing username or profile picture' });
//   }

//   // You can save the profilePictureUrl in your database or storage system.
//   res.json({ message: 'Profile picture uploaded successfully', profilePictureUrl });
// }

// module.exports = {
//   uploadProfilePicture,
// };

exports.uploadProfilePicture = async (req: any, res: any) => {
    try {
      const { username, ProfileUrl } = req.body;
  
      // Validate the request data (e.g., check if username and imageUrl are present)
      if (!username || !ProfileUrl) {
        return res.status(400).json({ error: 'Missing username or image URL' });
      }
  
      // Check if the username already exists in the database
      const existingUser = await User.findOne({ where: { username } });
  
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      // Update the user's imageUrl
      await User.updateOne({ username }, { $set: { ProfileUrl } });
  
      // Respond with a success message and the updated data
      return res.json({ message: 'User data updated successfully', username, ProfileUrl });
    } catch (error) {
      console.error('Error updating user data:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };

//   exports.getUserProfile = async (req: any, res: any) => {
//     try {
//         const { username } = req.params;
    
//         // Validate the presence of the username
//         if (!username) {
//           return res.status(400).json({ error: 'Missing username' });
//         }
    
//         // Check if the user exists in the database
//         const existingUser = await User.findOne({ where: { username } });
    
//         if (!existingUser) {
//           return res.status(404).json({ error: 'User not found' });
//         }
//     console.log(existingUser.ProfileUrl)
//         // Respond with the user's profile data
//         return res.json({ username, ProfileUrl: existingUser.ProfileUrl });
//       } catch (error) {
//         console.error('Error retrieving user data:', error);
//         return res.status(500).json({ error: 'Internal server error' });
//       }
//     }
    
    exports.getUserProfile = async(req:any,res:any)=>{
        try{
            let userId = req.user._id;
            let userData = await User.findById(userId);
            res.json(userData.ProfileUrl);
            console.log(userData.ProfileUrl);
            customlog.log('info','route: /profilePicture msg: success');
        }catch(err){
            customlog.log('error','error while retrieving the ProfileUrl ');
            res.json({error: err});
        }
    }
    // const path = require('path');
    // const multer = require('multer');
    // const Story = require('../model/storyModel'); // Import your Story model here
    
    // // Configure multer to handle file uploads
    // const storage = multer.diskStorage({
    //   destination: (req:any, file:any, cb:any) => {
    //     cb(null, 'uploads/');
    //   },
    //   filename: (req:any, file:any, cb:any) => {
    //     cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    //   },
    // });
    
    // const upload = multer({ storage });
    
    // // Define the uploadStory function
    // exports.uploadStory = async (req:any, res:any) => {
    //   try {
    //     const { username } = req.body;
    //     const mediaUrl = req.file.filename;
    
    //     const newStory = new Story({ username, mediaUrl });
    //     const savedStory = await newStory.save();
    
    //     res.status(201).json(savedStory);
    //     customlog.log('info', 'route: /uploadStory msg: success');
    //   } catch (err) {
    //     console.error(err);
    //     customlog.log('error', 'error ');
    //     res.status(500).json({ error: err });
    //   }
    // };
 
// Define the API endpoint
// exports.getallProfileImages= async (req:any, res:any) => {
//   try {
//     const userId = req.params.id;

//     // Find the user by their ID
//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     // Get the IDs of the user's followers
//     const followerIds = user.following;
//     console.log(userId,user.following,followerIds)
// let stories=[];
// for (let i=0;i<followerIds.length;i++){
//     let currentUserId=followerIds[i];
//     let userIdd = [userId, ...user.following.map((id:any) => id.toString())];
//     console.log(userIdd)
//     let currentUser=await User.findById(userIdd)
//     // console.log(currentUser,currentUser.schema.obj.stories)
//     let currentUserStories=currentUser.stories
//     console.log(currentUserStories)
// }
//     // Find the followers and retrieve their usernames and profile URLs
//     // const followers = await User.find({ _id: { $in: followerIds } }, { username: 1, ProfileUrl: 1 });

//     // res.json(followers);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// };


exports.getallProfileImages= async (req:any, res:any) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Get an array of user IDs that the user is following, including their own ID
      const followingIds = [userId, ...user.following.map((id:any) => id.toString())];
  console.log(followingIds)
 
//     //   res.json(posts);
//     const stories = [];

//     // Loop through users in followingIds and collect their stories
//     for (const followingId of followingIds) {
//         const followingUser = await User.findById(followingId);
//         if (followingUser && followingUser.stories) { // Check if stories is defined
            
//           stories.push(...followingUser.stories);
//         }
//       }
 
  
//       // Sort the collected stories by createdAt
//       stories.sort((a, b) => b.createdAt - a.createdAt);
  
//       res.json(stories);
const storiesWithUsernames = [];

// Loop through users in followingIds and collect their stories with usernames
for (const followingId of followingIds) {
    const followingUser = await User.findById(followingId);
    if (followingUser && followingUser.stories) {
        const { username } = followingUser; // Get the username of the following person
        const storiesWithUsername = followingUser.stories.map((story:any) => ({
            content: story.content,
            createdAt: story.createdAt,
            expirationDate:story.expirationDate,
            username, // Include the username in the story object
        }));
        storiesWithUsernames.push(...storiesWithUsername);
    }
}

// Sort the collected stories by createdAt
storiesWithUsernames.sort((a, b) => b.createdAt - a.createdAt);

res.json(storiesWithUsernames);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };

  exports.searchProduct=async (req:any, res:any) => {
   try{ let products = await Product.find({
    $or: [
      { name: { $regex: req.params.key, $options: "i" } },
      { caption: { $regex: req.params.key, $options: "i" } },
      { productDetails: { $regex: req.params.key, $options: "i" } },
      { description: { $regex: req.params.key, $options: "i" } },
      { colour_available: { $regex: req.params.key, $options: "i" } },
      { cloth_category: { $regex: req.params.key, $options: "i" } },
      { fabric_available: { $regex: req.params.key, $options: "i" } },
      { location: { $regex: req.params.key, $options: "i" } },
      { hashtags: { $regex: req.params.key, $options: "i" } },
      {pooled_user: { $exists: true, $ne: [] }},
    ],
  });
    res.json({ products });
    customlog.log("info", "route: /search/:data msg: success");
  } catch (err) {
    customlog.log("error", "error searching");
    res.json({ error: err });
  }
};
exports.searchPost=async (req:any, res:any) => {
    try{ let posts = await Post.find({
        $or: [
          { caption: { $regex: req.params.key, $options: "i" } },
          { location: { $regex: req.params.key, $options: "i" } },
          { hashtags: { $regex: req.params.key, $options: "i" } },
         
        ],
      });
     res.json({  posts });
     customlog.log("info", "route: /search/:data msg: success");
   } catch (err) {
     customlog.log("error", "error searching");
     res.json({ error: err });
   }
 };
 exports.searchUser=async (req:any, res:any) => {
    try{ let user = await User.find({
        $or: [
          { name: { $regex: req.params.key, $options: "i" } },
          { username: { $regex: req.params.key, $options: "i" } },
        //   { email: { $regex: req.params.key, $options: "i" } },
        ],
      });
     res.json({  user });
     customlog.log("info", "route: /search/:data msg: success");
   } catch (err) {
     customlog.log("error", "error searching");
     res.json({ error: err });
   }
 };
 exports.reportPost=async (req:any, res:any) => {
  const { postId } = req.params;
  const { reason } = req.body; // Get the reason from the request body

  try{ const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'post not found' });
    }

    // Check if the post is already reported
    if (post.reported) {
      return res.status(400).json({ error: 'post already reported' });
    }
    post.reported = true;
    post.reportReason = reason; // Set the report reason
    await post.save();

    res.json({ message: 'post reported successfully' });
   customlog.log("info", "route: /reportPost/:postId msg: success");
 } catch (err) {
   customlog.log("error", "error reporting");
   res.json({ error: err });
 }
};
exports.hidePost=async (req:any, res:any) => {
  const { postId } = req.params;
  // const { reason } = req.body; // Get the reason from the request body

  try{ const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ error: 'post not found' });
    }

    // Check if the post is already hidePosted
    if (post.hide) {
      return res.status(400).json({ error: 'post already hidden' });
    }
    post.hide = true;
    // post.hidePostReason = reason; // Set the hidePost reason
    await post.save();

    res.json({ message: 'post hidden successfully' });
   customlog.log("info", "route: /hidePost/:postId msg: success");
 } catch (err) {
   customlog.log("error", "error hidding post");
   res.json({ error: err });
 }
};
exports.favorites = async (req:any,res:any) => {
  const user_id=req.body._id;
  const post_id = req.params.id;

      try{
          const user= await User.findById(user_id)
         
          if(!user.favorites.includes(post_id)){
             await user.updateOne({$push: {favorites:post_id}})

             res.status(200).json({"msg":"post added to favorites successfully"})
          }
          else{
            return res.status(403).json({"msg":"post already added to favorites"})
          }
      }
      catch{
          res.status(200).json({"msg":"failed"})
      }
  }
  exports.topHashtagsforPosts = async (req: any, res: any) => {
    try {
      const topHashtags = await Post.aggregate([
        { $unwind: '$hashtags' },
        {
          $group: {
            _id: '$hashtags',
            count: { $sum: 1 },
            imageUrls: { $push: '$imageUrl' }, // Collect image URLs for each hashtag
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]);
  
      // Extract the first three image URLs for each hashtag
      topHashtags.forEach((hashtag:any) => {
        if (hashtag.imageUrls.length > 3) {
          hashtag.imageUrls = hashtag.imageUrls.slice(0, 3);
        }
      });
  
      res.json(topHashtags);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  exports.topHashtagsforProducts = async (req: any, res: any) => {
    try {
      const topHashtags = await Product.aggregate([
        { $unwind: '$hashtags' },
        {
          $group: {
            _id: '$hashtags',
            count: { $sum: 1 },
            imageUrls: { $push: '$imageUrl' }, // Collect image URLs for each hashtag
          },
        },
        { $sort: { count: -1 } },
        { $limit: 15 },
      ]);
  
      // Extract the first three image URLs for each hashtag
      topHashtags.forEach((hashtag:any) => {
        if (hashtag.imageUrls.length > 3) {
          hashtag.imageUrls = hashtag.imageUrls.slice(0, 3);
        }
      });
  
      res.json(topHashtags);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  
  // exports.uploadPost = async (req: any, res: any) => {
  //   try {
  //     const user = await User.findById(req.user._id);
  
  //     const hashtagsArr = req.body.hashtags.split("#");
  //     hashtagsArr.shift();
  
  //     const newId = uuidv4();
  //     const objectToHash = {
  //       uuid: newId,
  //       postName: req.body.caption, // Use caption instead of name
  //     };
  
  //     const imageName = await bcrypt.hash(JSON.stringify(objectToHash), 10);
  //     const imageNameWithoutSlashes = imageName.replaceAll('/', '');
  
  //     if (
  //       req.file.mimetype !== "image/jpeg" &&
  //       req.file.mimetype !== "image/png" &&
  //       req.file.mimetype !== "image/gif" &&
  //       req.file.mimetype !== "image/jpg" &&
  //       req.file.mimetype !== "image/webp"
  //     ) {
  //       return res.status(200).json({ Error: "Invalid file type" });
  //     }
  
  //     const postObject: {
  //       caption: any;
  //       imageName: any;
  //       hashtags: any;
  //       taggedOwner: any;
  //       avatar: any;
  //       owner: any;
  //       location: any;
  //       imageUrl: string; // Add imageUrl with initial value as an empty string
  //     } = {
  //       caption: req.body.caption,
  //       imageName: imageNameWithoutSlashes,
  //       hashtags: hashtagsArr,
  //       taggedOwner: JSON.parse(req.body.taggedOwner),
  //       avatar: req.user._id,
  //       owner: req.user._id,
  //       location: req.body.location,
  //       imageUrl: '', // Initialize imageUrl as an empty string
  //     };
  
  //     cloudinary.uploader.upload(
  //       req.file.path,
  //       { resource_type: "image" },
  //       async (err: any, result: any) => {
  //         if (err) {
  //           customlog.log('error', 'error while uploading the post');
  //           throw err;
  //         } else {
  //           postObject.imageUrl = result.secure_url;
  //           const newPostDoc = await Post.create(postObject);
  //           if (newPostDoc) {
  //             user.posts.push(newPostDoc._id);
  //             await user.save();
  //             const postId = newPostDoc._id;
  //             res.json({ msg: "post added", postId });
  //           }
  //         }
  //       });
  //   } catch (err: any) {
  //     console.log(err);
  //     customlog.log('error', 'error while uploading the post');
  //     res.send({
  //       success: false,
  //       msg: err.message || "Error occurred while uploading the post",
  //     });
  //   }
  // };
//   exports.productDetails=async (req:any, res:any) => {
//     try {
//       const productId = req.params.productId;
//       const product = await Product.findById(productId);
  
//       if (!product) {
//         return res.status(404).json({ message: 'Product not found' });
//       }
  
//       res.json(product);
      
//    customlog.log("info", "route: /productDetails/:productId msg: success");
//  } catch (err) {
//    customlog.log("error", "error finding post");
//    res.json({ error: err });
//  }
// };
exports.productDetails = async (req: any, res: any) => {
  try {
      const productId = req.params.productId;
      const product = await Product.findById(productId);

      if (!product) {
          return res.status(404).json({ message: 'Product not found' });
      }
      
      // Assuming the pool ID is passed as a parameter
      const pool = await Pool.findOne({ product: productId });

      // Assuming the user ID is available in the `avatar` field
      const userId = product.avatar;

      // Retrieve the user details
      const user = await User.findById(userId, 'name ProfileUrl');

      // Return the product, pool, and user details
      res.json({ product, pool, user });

      customlog.log("info", "route: /productDetails/:productId msg: success");
  } catch (err) {
      customlog.log("error", "error finding post");
      res.json({ error: err });
  }
};





// Import necessary modules and models
// ...

// Corrected type definition for commentDetails
interface CommentDetails {
  comment: any;
  user: {
    name: any;
    profilePic: any;
    _id: any; // Include user ID
  };
  replies?: Array<{
    _id: any;
    username: any;
    profileUrl: any;
  }>;
}

// Updated postDetails API
// Import necessary modules and models
// ...

// // Corrected type definition for commentDetails
// interface CommentDetails {
//   comment: any;
//   user: {
//     name: any;
//     profilePic: any;
//     _id: any; // Include user ID
//   };
//   replies?: Array<{
//     _id: any;
//     username: any;
//     profileUrl: any;
//   }>;
// }

// Updated postDetails API
// Updated postDetails API
exports.postDetails = async (req: any, res: any) => {
  try {
    const postId = req.params.postId;
    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Fetch user details using the userId from the post
    const user = await User.findById(post.avatar);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Include user details in the response
    const response: any = {
      post,
      user: {
        name: user.name,
        profilePic: user.ProfileUrl,  // Assuming avatarId is the field containing the profile picture ID
        _id: user._id, // Include user ID
      },
    };

    // Include details about comments and their replies
    response.commentsDetails = await Promise.all(post.comments.map(async (comment: any) => {
      const commentUser = await User.findById(comment.user);
      const commentDetails: CommentDetails = {
        comment,
        user: {
          name: commentUser ? commentUser.name : '',
          profilePic: commentUser ? commentUser.ProfileUrl : '',
          _id: commentUser ? commentUser._id : '', // Include user ID
        },
      };

      if (comment.replies && comment.replies.length > 0) {
        const repliesDetails = await Promise.all(comment.replies.map(async (reply: any) => {
          const replyUser = await User.findById(reply.personReplying);
          return {
            _id: replyUser ? replyUser._id : '',
            username: replyUser ? replyUser.username : '',
            profileUrl: replyUser ? replyUser.ProfileUrl : '',
          };
        }));
        commentDetails.replies = repliesDetails;
      }

      return commentDetails;
    }));

    // Include details about tagged owners
    response.taggedOwnersDetails = await Promise.all(post.taggedOwner.map(async (taggedOwner: any) => {
      const ownerUser = await User.findById(taggedOwner._id);
      return {
        _id: ownerUser ? ownerUser._id : '',
        username: ownerUser ? ownerUser.username : '',
        profileUrl: ownerUser ? ownerUser.ProfileUrl : '',
      };
    }));

    res.json(response);

    customlog.log("info", "route: /postDetails/:postId msg: success");
  } catch (err) {
    customlog.log("error", "Error finding post");
    res.status(500).json({ error: err });
  }
};


//API 1:Create a Pool
exports.createPool= async (req:any, res:any) => {
  const {
    title,
    creator,
    product,
    minOrders,
    timeDuration,
    lockInAmount,
    totalProductPrice,
  } = req.body;

  try {
    const pool = new Pool({
      title,
      creator,
      product,
      minOrders,
      timeDuration,
      lockInAmount,
      totalProductPrice,
      
    });

    // Calculate the endDatetime based on timeDuration and current time
    const startDatetime = new Date();
    const endDatetime = new Date(startDatetime.getTime() + timeDuration);

    pool.startDatetime = startDatetime;
    pool.endDatetime = endDatetime;

    // Save the pool to the database
    await pool.save();

    res.status(201).json({ pool_id: pool._id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create the pool.' });
  }
};


// API 2: View Active Pools
exports.activePool= async (req:any, res:any) => {
  try {
    const activePools = await Pool.find({ status: 'open' }).exec();
    res.json(activePools);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch active pools.' });
  }
};

// API 3: Join a Pool
exports.joinPool = async (req: any, res: any) => {
  const poolId = req.params.poolId;
  const { user, contribution } = req.body;

  try {
    const pool = await Pool.findById(poolId);

    if (!pool) {
      return res.status(404).json({ error: 'Pool not found.' });
    }

    if (pool.status !== 'open') {
      return res.status(400).json({ error: 'Pool is closed.' });
    }

    // Add the participant to the pool with their contribution
    pool.participants.push({ user, contribution });
    
    // Increase the currentPool count
    pool.currentPool += 1;

    await pool.save();

    res.json({ message: 'Successfully joined the pool.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to join the pool.' });
  }
};


// API 4: Check Pool Status
exports.statusPool= async (req:any, res:any) => {
  const poolId = req.params.poolId;

  try {
    const pool = await Pool.findById(poolId);

    if (!pool) {
      return res.status(404).json({ status: 'Pool not found.' });
    }

    res.json({ status: pool.status });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pool status.' });
  }
};

// API 5: Close/Cancel a Pool
exports.closePool= async (req:any, res:any) => {
  const poolId = req.params.poolId;

  try {
    const pool = await Pool.findById(poolId);

    if (!pool) {
      return res.status(404).json({ error: 'Pool not found.' });
    }

    if (pool.status !== 'open') {
      return res.status(400).json({ error: 'Pool is already closed.' });
    }

    // Set the pool status to 'closed'
    pool.status = 'closed';
    await pool.save();

    res.json({ message: 'Pool closed successfully.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to close the pool.' });
  }
};

// API 6: Detailed Pool Information
exports.detailsOfPool= async (req:any, res:any) => {
  const poolId = req.params.poolId;

  try {
    const pool = await Pool.findById(poolId);

    if (!pool) {
      return res.status(404).json({ error: 'Pool not found.' });
    }

    res.json(pool);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pool details.' });
  }
};




// API: Get Images of Pooled Products
exports.imagesOfPooledProducts= async (req:any, res:any) => {
  try {
    // Find open pools
    const openPools = await Pool.find({ status: 'open' }).exec();

    if (!openPools || openPools.length === 0) {
      return res.status(404).json({ error: 'No open pools found.' });
    }

    // Get product IDs from open pools
    const productIds = openPools.map((pool:any) => pool.product);

    // Find products with these IDs and retrieve imageUrl and cloth_category
    const products = await Product.find({ _id: { $in: productIds } }).select('imageUrl cloth_category _id').exec();

    if (!products || products.length === 0) {
      return res.status(404).json({ error: 'No products found for open pools.' });
    }

    // Extract imageUrl and cloth_category from products
    const productInfo = products.map((product:any) => {
      return {
        imageUrl: product.imageUrl,
        cloth_category: product.cloth_category,
        id:product._id
      };
    });

    res.json(productInfo);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch pooled product images.' });
  }
};

// exports.topcloth_categoryforProducts=async (req:any, res:any) => {
//   try {
//     const topcloth_category = await Product.aggregate([
//       { $unwind: '$cloth_category' },
//       {
//         $group: {
//           _id: '$cloth_category',
//           count: { $sum: 1 },
//           imageUrl: { $push: '$imageUrl'}
//         },
//       },
//       { $sort: { count: -1 } },
//       { $limit: 5 },
//     ]);
//     res.json(topcloth_category);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal Server Error' });
//   }
// }
exports.topcloth_categoryforProducts = async (req: any, res: any) => {
  try {
    const topcloth_category = await Product.aggregate([
      { $unwind: '$cloth_category' },
      {
        $group: {
          _id: '$cloth_category',
          count: { $sum: 1 },
          imageUrl: { $push: '$imageUrl' },
        },
      },
      {
        $project: {
          _id: 1,
          count: 1,
          imageUrl: { $arrayElemAt: ['$imageUrl', 0] }, // Select the first image URL
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);
    res.json(topcloth_category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}






// exports.uploadShopPagePosters = async (req:any, res:any) => {
//   try {
//     const { username, section } = req.body;
//     const profileImages = req.files;

//     // Check if the username already exists in the database
//     // const existingUser = await Admin.findOne({ username });

//     // if (!existingUser) {
//     //   return res.status(404).json({ error: 'User not found' });
//     // }

//     // Upload profile images to Cloudinary and store their URLs

//     // Ensure profileImages is defined and is an array
//     // if (!profileImages || !Array.isArray(profileImages)) {
//     //   return res.status(400).json({ error: 'No files uploaded or invalid file input' });
//     // }

   
//       const result = await cloudinary.uploader.upload(image1.path);
//       uploadedImages.push({ imageUrl: result.secure_url, public_id: result.public_id, section });
//     }

//     // Update the user's profileImages field with the uploaded image URLs
//     const admin = new Admin({ profileImages: uploadedImages });
//     await admin.save();


//     // Respond with a success message and the updated data
//     return res.json({ message: 'Profile pictures uploaded successfully', username, section, uploadedImages });
//   } catch (error) {
//     console.error('Error uploading profile pictures:', error);
//     return res.status(500).json({ error: 'Internal server error' });
//   }
// };

// exports.uploadShopPagePosters = async (req:any, res:any) => {
//   try{
//     let adminData = {
//     section: req.body.section,
//     photo1: req.files,
//     photo2: req.files,
//   };

//   // Upload photo1 to Cloudinary
//   cloudinary.uploader.upload(
//     req.files.photo1.path,
//     { resource_type: "image" },
//     async (err:any, result:any) => {
//       if (err) {
//         console.error('Error uploading photo1 to Cloudinary');
//         return res.status(500).json({ error: 'An error occurred while uploading photo1.' });
//       }

//       adminData.photo1 = result.secure_url;

//       cloudinary.uploader.upload(
//         req.files.photo2.path,
//         { resource_type: "image" },
//         async (err:any, result:any) => {
//           if (err) {
//             console.error('Error uploading photo2 to Cloudinary');
//             return res.status(500).json({ error: 'An error occurred while uploading photo2.' });
//           }

//           adminData.photo2 = result.secure_url;

//           // Save admin data to the database
//           const newAdminData = new Admin(adminData);
//           const savedAdminData = await newAdminData.save();

//           res.status(201).json(savedAdminData);
//         }
//       );
//     }
//     );
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while uploading admin data.' });
//   }
// };

exports.getImagesByAdmin=async(req:any,res:any)=>{
  const admin=await Admin.find()
  res.json(admin)
}

exports.searchHashtag=async (req:any, res:any) => {
  try{ let products = await Product.find({
   $or: [
    
     { hashtags: { $regex: req.params.key, $options: "i" } },
    
   ],
 });
   res.json({ products });
   customlog.log("info", "route: /search/:data msg: success");
 } catch (err) {
   customlog.log("error", "error searching");
   res.json({ error: err });
 }
};

exports.recommendedtopcloth_categoryforProducts=async (req:any, res:any) => {
  try {
    const topcloth_category = await Product.aggregate([
      { $unwind: '$cloth_category' },
      {
        $group: {
          _id: '$cloth_category',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);
    res.json(topcloth_category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}
exports.userDetails=async (req:any, res:any) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'user not found' });
    }

    res.json(user);
    
 customlog.log("info", "route: /userDetails/:userId msg: success");
} catch (err) {
 customlog.log("error", "error finding user");
 res.json({ error: err });
}
};

exports.getFollowingsInfo = async (req: any, res: any) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get an array of user IDs that the user is following, including their own ID
    const followingIds = [userId, ...user.following.map((id: any) => id.toString())];

    // Find and retrieve information about the users the main user is following
    const followingsInfo = await User.find({ _id: { $in: followingIds } }, 'username profilePic');

    res.json(followingsInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
exports.getFollowersInfo = async (req: any, res: any) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get an array of user IDs of those who are following the user
    const followerIds = user.followers.map((id: any) => id.toString());

    // Find and retrieve information about the users who are following the main user
    const followersInfo = await User.find({ _id: { $in: followerIds } }, 'username ProfileUrl');

    res.json(followersInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getFollowersAndFollowingInfo = async (req: any, res: any) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const followingIds = [userId, ...user.following.map((id: any) => id.toString())];

    // Find and retrieve information about the users the main user is following
    const followingsInfo = await User.find({ _id: { $in: followingIds } }, 'username ProfileUrl');

    // Get an array of user IDs of those who are following the user
    const followerIds = user.followers.map((id: any) => id.toString());

    // Find and retrieve information about the users who are following the main user
    const followersInfo = await User.find({ _id: { $in: followerIds } }, 'username ProfileUrl');

    res.json(followersInfo,followingsInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getColorFabricSizeOfProduct= async (req: any, res: any) => {
  try {
    const productId = req.params.productId;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Extract color, sizes, and fabric from the product
    const productInfo = {
      sizes_available: product.sizes_available,
      colour_available: product.colour_available,
      fabric_available: product.fabric_available,
    };
   
    res.json(productInfo);
    customlog.log("info", "route: /getColorFabricSizeOfProduct/:productId msg: success");
  } catch (err) {
   customlog.log("error", "error" + err);
   res.json({ error: err });
  }
  };
  exports.getAllDesignsScreenshot=async(req:any,res:any)=>{
    const design=await Design.find()
    res.json(design)
  }

  // exports.loadDashboard= async (req: any, res: any) => {
  //   try {
  //     const users=User.find({_id {$nin:[req.session.user._id]}})
  //    res.render('dashboard',{user:req.session.user, users:any})
     
  //     // res.json();
  //     customlog.log("info", "route: /loadDashboard msg: success");
  //   } catch (err) {
  //    customlog.log("error", "error" + err);
  //    res.json({ error: err });
  //   }
  //   };
  
  exports.getApparelsOfDesigns=async (req:any, res:any) => {
    try {
      const categories = await Design.distinct('apparel');
      const categoryDetails = [];
  
      for (const category of categories) {
        const designs = await Design.find({ apparel: category });
        const sizesAvailable = [...new Set(designs.map((design:any) => design.size))];
        const fabricAvailable = [...new Set(designs.map((design:any) => design.fabric))];
        const colorAvailable = [...new Set(designs.map((design:any) => design.color))];
        const productIds = designs.map((design:any) => design._id);
  
        categoryDetails.push({
          category,
          sizesAvailable,
          fabricAvailable,
          colorAvailable,
          productIds,
        });
      }

      res.json(categoryDetails);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
exports.userFollowingFollowersCount= async (req:any, res:any) => {
    try {
      const userId = req.params.userId;
  
      // Find the user by their ID
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Get the follower and following counts
      const followersCount = user.followers.length;
      const followingCount = user.following.length;
  
      return res.json({
        followersCount,
        followingCount,
      });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  exports.featured_recommended_products = async (req: any, res: any) => {
    try {
      const type = req.params.type; // Extract the type parameter from the URL
      let products = [];
  
      if (type === 'recommended') {
        // Implement a query to find recommended products (example: top 5 categories)
        products = await Product.aggregate([
          { $unwind: '$cloth_category' },
          {
            $group: {
              _id: '$_id',
              name: { $first: '$cloth_category' },
              count: { $sum: 1 },
              imageUrl: { $push: '$imageUrl' },
              discount: { $first: '$discount' },
              price: { $first: '$price' },
              avatar: { $first: '$avatar' },
            },
          },
          {
            $project: {
              _id: 1,
              name: 1,
              imageUrl: { $arrayElemAt: ['$imageUrl', 0] },
              discount: 1,
              price: 1,
              avatar: 1,
            },
          },
          { $sort: { count: -1 } },
          { $limit: 15 },
        ]);
    
      } else if (type === 'featured') {
        products = await Product.find({ isFeatured: true })
          .select('name imageUrl avatar discount price _id')
          .limit(15);
      } else if (type === 'hashtags') {
        // Find products with any hashtags (modify this part based on your specific logic)
        products = await Product.find({ hashtags: { $exists: true, $ne: [] } })
          .select('name imageUrl avatar discount price _id')
          .limit(15);
      } else {
        res.status(400).json({ message: 'Invalid product type' });
        return;
      }
  
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  exports.addCommentsToPost = async (req: any, res: any) => {
    try {
      const postId = req.params.postId;
      const { user, replyToCommentId, replyText } = req.body;
  
      // Find the post by its ID
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      if (replyToCommentId) {
        // It's a reply, find the parent comment
        const parentComment = post.comments.id(replyToCommentId);
  
        if (!parentComment) {
          return res.status(404).json({ error: 'Parent comment not found' });
        }
  
        // Calculate the time difference as a number of milliseconds
        const timeDifference = new Date().getTime() - parentComment.timeOfCommenting.getTime();
  
        // Create a new reply object with timeOfCommenting and timeDifference
        const newReply = {
          user: user,
          replyText: replyText,
          timeOfReply: new Date(),
          timeDifference: timeDifference,
        };
  
        parentComment.replies.push(newReply);
      } else {
        // It's a top-level comment
        const newComment = {
          user: user,
          commentText: replyText,
          timeOfCommenting: new Date(),
          replies: [],
        };
  
        post.comments.push(newComment);
      }
  
      // Save the post with comments or replies
      const updatedPost = await post.save();
  
      return res.json(updatedPost);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  
  
  
  exports.getComments = async (req: any, res: any) => {
    try {
      const postId = req.params.postId;
  
      // Find the post by its ID and retrieve the comments array
      const post = await Post.findById(postId);
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      return res.json(post.comments);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };
  exports.updateUser = async (req:any, res:any) => {
    try {
      const userId = req.params.userId;
  
      // Define the fields that can be updated
      const updateFields = {
        name: req.body.name,
        profilebio: req.body.profilebio,
        address: req.body.address,
        mobileNumber: req.body.mobileNumber,
        gender: req.body.gender,
        profileDesc: req.body.profileDesc,
        profileBanner: req.body.profileBanner,
        DOB: req.body.DOB,
        socialMediaHandles:req.body.socialMediaHandles
        // Add other fields that can be updated
      };
  
      // Find the user by ID and update the allowed fields
      const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });
  
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.json(updatedUser);
    } catch (err) {
      res.status(500).json({ error: 'Error updating user details' });
    }
  };
  exports.detailUser=async (req:any, res:any) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Extract the user's details
      const userDetails = {
        name: user.name,
        profilePicture: user.ProfileUrl, // Assuming avatar has a URL field
        profileDesc: user.profileDesc,
        profileBanner: user.profileBanner,
        socialMediaHandles: user.socialMediaHandles, // You should add this field to your schema
        followersCount: user.followers.length,
        followingCount: user.following.length,
        postsCount: user.posts.length,
      };
  
      res.json(userDetails);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching user details' });
    }
  };
  const HelpQuery=require('../model/HelpQuery')
exports.support= async (req:any, res:any) => {
    try {
      // Get the query details from the request body
      const { userId, name, email, query } = req.body;
  
      // Check if the user exists (you might want to add more error handling here)
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Create a new HelpQuery instance
      const newQuery = new HelpQuery({ userId, name, email, query });
  
      // Save the query to the database
      newQuery.save((err:any, savedQuery:any) => {
        if (err) {
          console.error('Error saving query:', err);
          return res.status(500).json({ message: 'Error saving query' });
        }
  
        // Respond with a confirmation message and the saved query
        res.json({ message: 'Query received and saved successfully', query: savedQuery });
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
exports.createdPostsAndSavedDesigns= async (req:any, res:any) => {
    try {
      const userId = req.params.userId;
  
      // Find all the posts and saved designs for the user
      const user = await User.findById(userId)
        .select('posts')
        .select('savedDesign');
      
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const posts = user.posts; // Array of post documents
      const savedDesigns = user.savedDesign; // Array of saved design documents
  
      // Respond with the posts and saved designs
      res.json({ posts, savedDesigns });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  exports.updatePoolSuccessFail = async (req: any, res: any) => {
    try {
      const poolId = req.body.poolId; // Assuming poolIds is an array of pool IDs in the request body
      // const poolId = req.body.poolId; // Assuming poolIds is an array of pool IDs in the request body
  
      const pool = await Pool.findById(poolId);
      // const pool = await Pool.findById(poolId);
  
      if (!pool) {
        // Handle the case where the pool with the provided ID is not found
        return res.status(404).json({ error: `Pool not found.` });
      }
      // const now = new Date().getTime(); // Get current time in milliseconds
      // const startTime = pool.startDatetime.getTime(); // Get pool start time in milliseconds
      // if (!pool) {
      //   // Handle the case where the pool with the provided ID is not found
      //   return res.status(404).json({ error: `Pool not found.` });
      // }
      const now = new Date().getTime(); // Get current time in milliseconds
      const startTime = pool.startDatetime.getTime(); // Get pool start time in milliseconds
  
 
      if (now - startTime >= pool.timeDuration) {
        // Check if the timeDuration has passed
        if (pool.participants.length >= pool.minOrders) {
          // Check if the minimum number of participants has been met
          pool.status = 'successful'; // Update the pool status
          // You can add more fields to the pool model as needed
          // pool.additionalField = 'someValue';
        } else {
          pool.status = 'failed'; // Update the pool status to 'failed'
        }
        await pool.save(); // Save the updated pool
      }
  
      return res.json({ message: 'Pool status checked and updated.' });
    } catch (error) {
      return res.status(500).json({ error: 'An error occurred while updating pool status.' });
   
    }
  
}
  
  
  exports.successRate=async (req:any, res:any) => {
    try {
      const designerId = req.params.designerId; // Get the designer's ID from the request URL
  
      // Find all the pools created by the designer
      const pools = await Pool.find({ designer: designerId });
  
      // Calculate the number of successful and failed pools
      const successfulPools = pools.filter((pool:any) => pool.status === 'successful');
      const failedPools = pools.filter((pool:any) => pool.status === 'failed');
  
      // Calculate the success rate
      const successRate = (successfulPools.length / pools.length) * 100;
  
      res.json({ designerId, successRate, successfulPools: successfulPools.length, failedPools: failedPools.length });
    } catch (error) {
      res.status(500).json({ error: 'An error occurred while calculating the success rate.' });
    }
  };
  exports.likeAndUnlikeComment = async (req: any, res: any) => {
    try {
        const post = await Post.findById(req.params.id);
        const user = await User.findById(req.body.userId);
  
        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            });
        }
  
        const commentId = req.params.commentId;
        const comment = post.comments.id(commentId);
  
        if (!comment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found",
            });
        }
  
        if (comment.likes.includes(req.body.userId)) {
            try {
                const indexComment = comment.likes.indexOf(req.body.userId);
                comment.likes.splice(indexComment, 1);
                await post.save();
                customlog.log('info', 'route: /post/likeandUnlikeComment/:id/:commentId msg: success');
                return res.status(200).json({
                    success: true,
                    message: "unliked",
                });
            } catch (err) {
                customlog.log('error', 'error while liking/unliking comment');
                console.log(err)
                res.json({
                    err: err
                });
            }
        } else {
            comment.likes.push(req.body.userId);
            await post.save();
            
            customlog.log('info', 'route: /post/likeandUnlikeComment/:id/:commentId msg: success');
            res.status(200).json({
                success: true,
                message: "liked",
            });
        }
    } catch (err) {
      console.log(err)
        customlog.log('error', 'error while liking/unliking post');
        res.json({
            error: err
        });
    }
  }
  exports.productFavorites = async (req:any,res:any) => {
    const user_id=req.body._id;
    const product_id = req.params.productId;
  
        try{
            const user= await User.findById(user_id)
           
            if(!user.productFavorites.includes(product_id)){
               await user.updateOne({$push: {productFavorites:product_id}})
  
               res.status(200).json({"msg":"product added to productFavorites successfully"})
            }
            else{
              return res.status(403).json({"msg":"product already added to productFavorites"})
            }
        }
        catch{
            res.status(200).json({"msg":"failed"})
        }
    }
   exports.addressOfUser= async (req:any, res:any) => {
      try {
        const userId = req.params.userId;
    
        // Find the user by userId and select the 'address' field
        const user = await User.findById(userId).select('address');
    
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        // Respond with user addresses
        res.json({ addresses: user.address });
      } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    };
 
      exports.addAddress = async (req: any, res: any) => {
        try {
          const { userId, addressDetails } = req.body;
      
          // Validate input
          if (!userId || !addressDetails) {
            return res.status(400).json({ message: 'Missing required parameters' });
          }
      
          // Find the user by userId
          const user = await User.findById(userId);
      
          if (!user) {
            return res.status(404).json({ message: 'User not found' });
          }
      
          // Ensure the "address" field is an array
          if (!user.address || !Array.isArray(user.address)) {
            user.address = [];
          }
      
          // Create a new address object
          const newAddress = {
            fullname: addressDetails.fullname,
            mobilenumber: addressDetails.mobilenumber,
            flathouseno: addressDetails.flathouseno,
            area: addressDetails.area,
            landmark: addressDetails.landmark,
            city: addressDetails.city,
            pin: addressDetails.pin,
            state: addressDetails.state,
            country: addressDetails.country,
          };
      
          // Add the new address to the user's address array
          user.address.push(newAddress);
      
          // Save the updated user document
          await user.save();
      
          res.json({ message: 'Address added successfully', user });
        } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ message: 'Internal Server Error' });
        }
      };
    
    
    // const axios = require('axios');
    import axios, { AxiosResponse } from 'axios';

    interface RazorpayAccountRequest {
        email: string;
        phone: string;
        type: string;
        reference_id: string;
        legal_business_name: string;
        business_type: string;
        contact_name: string;
        profile: {
            category: string;
            subcategory: string;
            addresses: {
                registered: {
                    street1: string;
                    street2: string;
                    city: string;
                    state: string;
                    postal_code: string;
                    country: string;
                };
            };
        };
        legal_info: {
            pan: string;
            gst: string;
        };
    }
    
    async function createRazorpayAccount(baseURL: string, username: string, password: string, requestBody: RazorpayAccountRequest): Promise<AxiosResponse<any>> {
        const apiUrl = `${baseURL}/v2/accounts`;
    
        const headers = {
            'Authorization': `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`,
            'Content-Type': 'application/json',
        };
    
        try {
            const response = await axios.post(apiUrl, requestBody, { headers });
            return response;
        } catch (error) {
            console.error('Error creating Razorpay account:', error);
            throw error;
        }
    }
    
    // Example usage
    const baseURL = 'https://api.razorpay.com';
    const username = "rzp_test_47pVpqQlPVsY7c";
    const password = "c6HV6oiG2abxNwtRSZjuIjiD";
    
    exports.createLinkedAccount = async (req: any, res: any) => {
        const requestPayload: RazorpayAccountRequest = {
            email: 'gaurav.kumar@example.com',
            phone: '9000090000',
            type: 'route',
            reference_id: '124124',
            legal_business_name: 'Acme Corp',
            business_type: 'partnership',
            contact_name: 'Gaurav Kumar',
            profile: {
                category: 'healthcare',
                subcategory: 'clinic',
                addresses: {
                    registered: {
                        street1: '507, Koramangala 1st block',
                        street2: 'MG Road',
                        city: 'Bengaluru',
                        state: 'KARNATAKA',
                        postal_code: '560034',
                        country: 'IN',
                    },
                },
            },
            legal_info: {
                pan: 'AAACL1234C',
                gst: '18AABCU9603R1ZM',
            },
        };
    
        try {
            const response = await createRazorpayAccount(baseURL, username, password, requestPayload);
            console.log('Response:', response.data);
            // Uncomment the following line if you want to send a success response
            // res.status(200).json({ success: true, data: response.data });
        } catch (error) {
         
            console.error('Error:', error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    };
    
    
// API endpoint for performing direct transfers
exports.transfers=async (req:any, res:any) => {
  try {
    // Extract relevant information from the request body
    const { account, amount, currency, notes, linked_account_notes } = req.body;

    // Make a request to the Razorpay API to initiate the transfer
    const razorpayResponse = await axios.post(
      'https://api.razorpay.com/v1/transfers',
      {
        account,
        amount,
        currency,
        notes,
        linked_account_notes,
      },
      {
        auth: {
          username: 'rzp_test_47pVpqQlPVsY7c', // Replace with your actual Razorpay API key
          password: 'c6HV6oiG2abxNwtRSZjuIjiD',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Handle the response from Razorpay as needed
    res.json({ success: true, razorpayResponse: razorpayResponse.data });
  } catch (error:any) {
    // Handle errors and send an appropriate response
    console.error('Error during transfer:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}

exports.fetchPayments= async (req:any, res:any) => {
  try {
   
    const LINKED_ACCOUNT_ID = 'acc_IRQWUleX4BqvYn';

    const apiUrl = 'https://api.razorpay.com/v1/payments';

    const headers = {
      'X-Razorpay-Account': LINKED_ACCOUNT_ID,
    };

    const auth = {
      // username: YOUR_KEY_ID,
      // password: YOUR_SECRET,
    };

    // const razorpayResponse = await axios.get(apiUrl, { headers, auth });

    // res.json({ success: true, razorpayResponse: razorpayResponse.data });
  } catch (error:any) {
    console.error('Error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};



// API endpoint to add a product to the cart
exports.addtocart= async (req:any, res:any) => {
  try {
    const { userId, productId, size, colour, quantity,price,discount,fabric} = req.body;

    // Find the user by userId
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Create a cart item
    const cartItem = {
      productId,
      size,
      colour,
      quantity,
      price,
      discount,fabric
    };

    // Add the cart item to the user's cart
    user.mycart.push(cartItem);

    // Save the user with the updated cart
    await user.save();

    res.json({ success: true, message: 'Product added to the cart successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error });
  }
}


// Add a new route for removing a product from the cart
exports.removefromcart=async (req:any, res:any) => {
  try {
    const { userId, productId } = req.body;

    // Find the user by userId
    const user = await User.findOne({ _id: userId });

    // Check if the user and the product exist in the cart
    const productIndex = user.mycart.findIndex((item:any) => item.productId === productId);

    if (productIndex !== -1) {
      // Remove the product from the cart
      user.mycart.splice(productIndex, 1);

      // Save the updated user data
      await user.save();

      res.json({ success: true, message: 'Product removed from the cart successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found in the cart' });
    }
  } catch (error:any) {
    console.error('Error removing product from the cart:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}


// exports.getAllCartProducts= async (req:any, res:any) => {
//   try {
//     const userId = req.params.userId;

//     const user = await User.findById(userId).populate('mycart');

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const cartProducts = await Promise.all(
//       user.mycart.map(async (cartItem:any) => {
//         const productDetails = await Product.findById(cartItem.productid);

//         if (!productDetails) {
//           return null;
//         }

//         return {
//           productId: productDetails._id,
//           name: productDetails.name,
//           price: productDetails.price,
//           description: productDetails.description,
//           imageUrl: productDetails.imageUrl,
//           sizes_available: productDetails.sizes_available,
//           colour_available: productDetails.colour_available,
          
//         };
//       })
//     );

//     // Filter out null values (products not found)
//     const validCartProducts = cartProducts.filter((product) => product !== null);

//     res.json({ cartProducts: validCartProducts });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// }
// exports.getAllCartProducts = async (req: any, res: any) => {
//   try {
//     const userId = req.params.userId;

//     const user = await User.findById(userId);

//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const cartProducts = await Promise.all(
//       user.mycart.map(async (cartItem: any) => {
//         // Assuming productId is a string
//         const productDetails = {
//           name: cartItem.productId, // Modify this based on your actual product details
//           price: 0, // Replace with the actual price
//           description: 'Product description', // Replace with the actual description
//           imageUrl: 'Product image URL', // Replace with the actual image URL
//           sizes_available: [], // Replace with the actual available sizes
//           colour_available: [], // Replace with the actual available colors
//         };

//         return {
//           productId: cartItem.productId,
//           name: productDetails.name,
//           price: productDetails.price,
//           description: productDetails.description,
//           imageUrl: productDetails.imageUrl,
//           sizes_available: productDetails.sizes_available,
//           colour_available: productDetails.colour_available,
//         };
//       })
//     );

//     res.json({ cartProducts });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };
exports.getAllCartProducts = async (req: any, res: any) => {
  try {
    const userId = req.params.userId;

    const user = await User.findById(userId).populate('mycart.productId');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const cartProducts = user.mycart.map((cartItem: any) => {
      if (!cartItem.productId) {
        return null; // Skip if productId is not available
      }

      return {
        productId: cartItem.productId._id,
        name: cartItem.productId.name,
        price: cartItem.productId.price,
        description: cartItem.productId.description,
        imageUrl: cartItem.productId.imageUrl,
        sizes_available: cartItem.productId.sizes_available,
        colour_available: cartItem.productId.colour_available,
      };
    });

    // Filter out null values (products not found)
    const validCartProducts = cartProducts.filter((product:any) => product !== null);

    res.json({ cartProducts: validCartProducts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getSavedDesigns = async (req: any, res: any) => {
  const userId = req.params.userId;

  try {
    const user = await User.findById(userId).populate('savedDesign');
    if (user) {
      res.json(user.savedDesign);
      customlog.log('info', 'route: /getSavedDesigns msg: success');
    } else {
      res.status(404).json({ msg: 'User not found!' });
      customlog.log('info', 'route: /getSavedDesigns msg: error');
    }
  } catch (err) {
    res.status(500).json({ msg: 'Failed to get saved designs!' });
    customlog.log('info', 'route: /getSavedDesigns msg: error');
  }
};

const Coupon = require('../model/coupon'); 
// API to add a new coupon by admin
exports.addCoupon= async (req:any, res:any) => {
  try {
    // Extract coupon details from the request body
    const { code, discountPercentage, expiryDate } = req.body;

    // Create a new coupon
    const newCoupon = new Coupon({
      code,
      discountPercentage,
      expiryDate,
    });

    // Save the coupon to the database
    const savedCoupon = await newCoupon.save();

    res.status(201).json({ success: true, coupon: savedCoupon });
  } catch (error) {
    console.error('Error adding coupon:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
exports.applyCoupon= async (req:any, res:any) => {
  try {
    // Extract coupon code from the request body
    const { couponCode } = req.body;

    // Find the coupon in the database based on the provided code
    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
      return res.json({ success: false, message: 'Coupon not found' });
    }

    // Implement your logic to apply the coupon (e.g., calculate discounted price)

    res.json({ success: true, message: 'Coupon applied successfully' });
  } catch (error) {
    console.error('Error applying coupon:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
exports.getAllCoupons = async (req:any, res:any) => {
  try {
    const coupons = await Coupon.find();
    res.json({ success: true, coupons });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
// likeCommentController.js
// const PostDB = require('./path/to/your/postModel'); // Update the path accordingly

exports.likeComment = async (req:any,res:any) => {
  try {
    const postId=req.body.postId;
    const commentId=req.body.commentId;
    const userId=req.body.userId;
    const post = await Post.findById(postId);

    if (!post) {
      return { success: false, message: 'Post not found' };
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return { success: false, message: 'Comment not found' };
    }

    // Check if the user has already liked the comment
    if (comment.likes.includes(userId)) {
      return { success: false, message: 'Comment already liked by the user' };
    }

    // Add the user to the likes array
    comment.likes.push(userId);

    // Save the updated post
    await post.save();

    return { success: true, message: 'Comment liked successfully' };
  } catch (error) {
    console.error(error);
    return { success: false, message: 'An error occurred while liking the comment' };
  }
};

exports.followAndUnfollowUser = async (req: any, res: any) => {
  try {
      const targetUserId = req.params.userId;
      const user = await User.findById(req.body.userId);

      if (!targetUserId) {
          return res.status(400).json({
              success: false,
              message: "Target user ID not provided",
          });
      }

      const targetUser = await User.findById(targetUserId);

      if (!targetUser) {
          return res.status(404).json({
              success: false,
              message: "Target user not found",
          });
      }

      // Check if the user is already following the target user
      const isFollowing = user.following.includes(targetUserId);

      if (isFollowing) {
          // If following, unfollow the target user
          const indexFollowing = user.following.indexOf(targetUserId);
          user.following.splice(indexFollowing, 1);

          // Remove the follower from the target user's followers list
          const indexFollower = targetUser.followers.indexOf(req.body.userId);
          targetUser.followers.splice(indexFollower, 1);

          await user.save();
          await targetUser.save();

          customlog.log('info', 'route: /user/follow/:userId msg: Unfollowed');
          return res.status(200).json({
              success: true,
              message: "Unfollowed",
          });
      } else {
          // If not following, follow the target user
          user.following.push(targetUserId);

          // Add the follower to the target user's followers list
          targetUser.followers.push(req.body.userId);

          await user.save();
          await targetUser.save();

          customlog.log('info', 'route: /user/follow/:userId msg: Followed');
          res.status(200).json({
              success: true,
              message: "Followed",
          });
      }
  } catch (err) {
      customlog.log('error', 'error while following/unfollowing user');
      res.json({ error: err });
  }
};


exports.addReview=async (req:any, res:any) => {
  try {
      const productId = req.params.productId;
      const { user, comment, rating } = req.body;

      // Check if the product exists
      const product = await Product.findById(productId);
      if (!product) {
          return res.status(404).json({ error: 'Product not found' });
      }

      // Add the review
      const review = {
          user: user,
          comment: comment,
          rating: rating,
          createdAt: new Date(),
      };

      product.review.push(review);
      product.rating.push({ user: user, rating: rating });

      // Save the updated product
      await product.save();

      res.status(201).json({ message: 'Review and rating added successfully', product: product });
  } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

