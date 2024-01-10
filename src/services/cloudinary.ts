export {};

const cloudinary = require('cloudinary').v2;

module.exports = cloudinary.config({
    cloud_name: process.env.CLOUDNARY_CLOUD_NAME,
    api_key: process.env.CLOUDNARY_API,
    api_secret: process.env.CLOUDNARY_SECRETKEY,
    secure: true
});
// module.exports = cloudinary.config({
//     cloud_name: 'zigy-prints',
//     api_key: '812215485516999',
//     api_secret: 'nvp4hgXPgtPR5x5ce_SD53fMXmg'
//    });

// exports.uploads=(file:any,folder:any)=>{
//     return new Promise(resolve =>{
//         cloudinary.uploader.upload(file,(result:any)=>{
//             resolve({
//                 url:result.url,
//                 id:result.public_id
//             })
//         },{
//             resource_type:"auto",
//             folder:folder
//         })
//     })
// }
