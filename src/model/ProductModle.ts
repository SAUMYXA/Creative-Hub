export {};

const mongoose = require('mongoose');

var ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        // required: true
    },
    caption: {
        type: String,
        // required: true
    },
    productDetails: {
        type: String,
        // required: true
    },
    imageName: {
      type: String,
      // required: true
    },
    price: {
      type: Number,
      // required: true
    },
    imageUrl: {
        type: String,
        // required: true,
        unique: true
    },
    description: {
        type: String,
    },
    sizes_available:[{
      type: String,
    }],
    colour_available: [{
        type: String,
    }],
    cloth_category: {
        type: String,
    },
    fabric_available: [{
        type: String,
    }],
    discount: {
        type: Number,
    },
    avatar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
    },
    design: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Design",
  },
    isFeatured:{
    type:Boolean,
    default:false
    },
    location:{
      type: String,
    },
    copyright: {
        type: String,
    },
    pooled: {
    type: Boolean,
    default:false
    },
    likes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "userModel",
        },
      ],
    review: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "userModel",
        },
        comment: {
          type: String,
          required: true,
        },

        rating: {
          type: Number
        },

        createdAt: {
          type: Date,
          default: Date.now
        }
      },
    ],
    rating: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "userModel",
        },
        rating: {
          type: Number,
          required: true,
        },
      },
    ],
    pooled_user: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "userModel",
        },
      ],
    hashtags: [{
      type: String
  }]
}, {
    timestamps: true
})

const productsDB = mongoose.model('products', ProductSchema);

module.exports = productsDB;
