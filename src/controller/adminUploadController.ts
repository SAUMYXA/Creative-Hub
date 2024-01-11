// const cloudinary = require("cloudinary");
// const uploadMiddleware = require("../middleware/multer");
// const fs = require("fs");
// const Admin = require("../model/adminModel");

// // Define a function to handle the POST request
// const handleAdminUpload = async (req:any, res:any) => {
//   const uploader = async (path:any) => await cloudinary.uploads(path, 'Images');
  
//   try {
//     // Your POST request handling logic here
//     const urls = [];
//     const files = req.files;

//     for (const file of files) {
//       const { path } = file;
//       const newPath = await uploader(path);
//       urls.push(newPath);
//       fs.unlinkSync(path);
//     }

//     const adminData = {
//       section: req.body.section,
//       photo1: urls[0].url,
//       photo2: urls[1].url,
//     };

//     const savedAdminData = await Admin.create(adminData);
//     res.status(201).json({
//       message: 'Images Uploaded Successfully',
//       data: savedAdminData,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while uploading images and saving data.' });
//   }
// };
// module.exports = {
//   handleAdminUpload, // Export the handleAdminUpload function
// };
