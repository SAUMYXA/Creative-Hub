// const multer = require("multer");
// const path = require("path");

// const storage = multer.diskStorage({
//   destination: function (req: any, file: any, cb: (arg0: null, arg1: string) => void) {
//     cb(null, "uploads/"); // specify the destination directory
//   },
//   filename: function (req: any, file: { fieldname: string; originalname: string }, cb: (arg0: null, arg1: string) => void) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname); // specify the filename
//   },
// });

// const glbFileFilter = function (req: any, file: { originalname: string }, cb: (arg0: Error | null, arg1: boolean) => void) {
//   // Extract the file extension from the original file name
//   const fileExtension = path.extname(file.originalname).toLowerCase();

//   if (fileExtension === '.glb') {
//     cb(null, true);
//   } else {
//     cb(new Error("Invalid file type. Only .glb files are allowed."), false);
//   }
// };

// const uploadGlb = multer({
//   storage: storage,
//   fileFilter: glbFileFilter, // use the glbFileFilter for .glb files
//   limits: {
//     // fileSize: 1024 * 1024, // specify the maximum file size in bytes
//   },
// });

// module.exports = uploadGlb;
