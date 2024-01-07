import { isNumber } from "lodash";

export {};

const mongoose = require('mongoose');
var userSchema = new mongoose.Schema({
    googleId:{
        type: String,
        default:"",
    },
    accessToken:{
        type:String,
        default:"",
    },
    refreshToken:{
        type:String,
        default:"",
    },
    name: {
        type: String,
        // required: true
    },
    username: {
        type: String,
        // unique:true,
        // required: true
    },
    profilebio: {
        type:String,
    },
    address: {
        type: [{
            _id: {
                type: mongoose.Schema.Types.ObjectId,
                default: new mongoose.Types.ObjectId(),
              },
          fullname: {
            type: String,
            default: "",
          },
          mobilenumber: {
            type: Number,
          },
          flathouseno: {
            type: String,
            default: "",
          },
        //   area: {
        //     type: String,
        //     default: "",
        //   },
        //   landmark: {
        //     default: "",
        //   },
          area: {
            type: String,
            default: "",
          },
          landmark: {
            type: String,
            default: "",
          },
        //   city: {
        //     default: "",
        //   },
          city: {
            type: String,
            default: "",
          },
          pin: {
            default: "",
          },
        //   pin: {
        //     type: Number,
        //     default: null,
        //   },
        //   state: {
        //     default: null,
        //   },
          state: {
            type: String,
            default: "",
          },
        //   country: {
        //     default: "",
        //   },
          country: {
            type: String,
            default: "",
          },
        }],
        default: [], // Set default value as an empty array
      },    
    typeOfLogin:{
        type:String,
    },
    ProfileUrl:{
        type:String,
        default:"",
    },
    profileDesc:{
        type:String,
        default:"",
    },
    profileBanner:{
        type:String,
        default:"",
    },
    UID: {
        type: String,
        // required: true
    },
    DOB:{
        type:Date,
        default:null,
    },
    mobileNumber:{
        type:Number,
        default:null,
    },
    gender:{
        type:String,
        default:"",
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    password2: {
        type: String,
        select: false
    },
    role:{
        type:String,
        enum: ['admin','user','dev'],
        default:"user",
    },
    token: {
        type: String,
        // required: true,
    }
    ,
    avatar: {
        public_id: String,
        url: String
    },
    is_online:{
        type:String,
        default:'0',

    },
    socialMediaHandles: {
        instagram: {
          type: String,
          default: '',
        },
        twitter: {
          type: String,
          default: '',
        },
        pinterest: {
          type: String,
          default: '',
        },
        youtube: {
            type: String,
            default: '',
          },
      },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "postModel"
    }],
    products: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductModle"
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel"
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel"
    }],
    stories: [
        {
          content: { type: String, required: true },
          createdAt: { type: Date, default: Date.now },
          expirationDate: { type: Date, required: true, default: () => new Date(+new Date() + 24 * 60 * 60 * 1000) }, // Set expiration date to 24 hours from creation
  
        },
      ],
    savedDesign: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
    }],
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel"
    }],
    productFavorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "productModel"
    }],
    // productFavorites: [{
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "productModel"
    // }],
    likedPost: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "postModel"
    }],
    likedProduct: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "productModel"
    }],
    wishList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "productModel"
    }],
    pooled_design: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "productModel",
        },
      ],
    myOrders: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductModle"
    }],  
    total_sales: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "orderModel"
    }],  
    mycart: [
        {
            productId:{
                type: mongoose.Schema.Types.ObjectId, // assuming your product ID is of type ObjectId
                ref: 'products', 
            },
            size:{
                type:String,
                default:"" 
            },
            colour:{
                type:String,
                default:""
            },
            quantity:{
                type:Number
            },
            price:{
                type:String,
                default:""
            },
            discount:{
                type:String,
                default:""
            },
            fabric:{
                type:String,
                default:""
            }
        
    },]
    
}, {
    timestamps: true
})

const userDB = mongoose.model('userDB', userSchema);

module.exports = userDB;
