export {};

const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {

    caption: {
      type: String,
    },
    avatar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userModel",
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel",
      },
    ],
    imageName: {
      type: String,
      // required: true
    },
    taggedOwner:[{
      
_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userModel',
    },
      platform:{
        type: String,
      },
      handle:{
        type:String,
      }
    }],
    imageUrl: {
      type: String,
      // required: true,
      unique: true
    },
    hide:{
      type: Boolean,
      default: false,
    },
    reported: {
      type: Boolean,
      default: false,
    },
    reportReason: {
      type:String,},
    createdAt: {
      type: Date,
      default: Date.now,
    },
    hashtags: [{
      type: String
    }],
    owner:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"userModel",
    },
    location:{
      type: String,
    },
    allow_merch_for_design :{
      type:Boolean,
      default: false,
    } ,
    tags:{
      type:String,
    },
    credits: [{
      type:mongoose.Schema.Types.ObjectId,
      ref:"userModel",
    }],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "userModel",
        },
        commentText: {
          type: String,
          // required: true,
        },
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: "userModel",
          },
        ],
        timeOfCommenting: {
          type: Date,
          default: Date.now, // Add default value for timeOfCommenting
      },
      replies: [
        {
            personReplying: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "userModel",
            },
            replyText: {
                type: String,
                default: "", // Add default value for reply
            },
            timeOfReply: {
                type: Date,
                default: Date.now, // Add default value for timeOfReply
            },
            timeDifference: {
              type: Number, // Store the time difference in milliseconds
              default: 0, // Initialize with 0 milliseconds
            },
            },
            ],
        },
    ],
  }, {
    timestamps: true,
});

const PostDB = mongoose.model("Posts", postSchema);

module.exports = PostDB;

  // image: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'ProductModle',
    //   required: true
    // },