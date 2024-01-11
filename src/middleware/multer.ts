

// const multer = require('multer');
// const path = require('path');

// module.exports = multer({
//     storage: multer.memoryStorage(),
    
//     fileFilter: (req: any, file: any, cb: any) => {
//         let ext = path.extname(file.originalname);
//         if (ext !== `.jpg` && ext !== `.jpeg` && ext !== `.png`&& ext !== `.blend`&& ext !== `.fbx`&& ext !== `.glb`&& ext !== `.gltf`&& ext !== `.mtl`&& ext !== `.obj`&& ext !== `.x3d`) {
//             cb(new Error('Invalid file type'), false);
//             return;
//         }
//         cb(null, true);
//     }
// })

// const { S3Client } = require('@aws-sdk/client-s3');
// const { S3 } = require('@aws-sdk/client-s3');
// const { v4: uuidv4 } = require('uuid');
// const { createHash } = require('crypto');
// const multer = require('multer');
// const multerS3 = require('multer-s3');
// const { Readable } = require('stream');

// const s3Client = new S3Client({
//   region: 'eu-north-1',
//   credentials: {
//     accessKeyId: 'AKIA3XSFQO2UGER7OQOY',
//     secretAccessKey: 'CIWFUXm9US5S/thU0eFiGwK5UxLR2NwVtdYLjNR5',
//   },
// });

// const upload = multer({
//     storage: multerS3({
//       s3: s3Client,
//       bucket: 'YOUR_S3_BUCKET_NAME',
//       acl: 'public-read',
//       metadata: function (req: Request, file:any, cb:any) {
//         cb(null, { fieldName: file.fieldname });
//       },
//       key: function (req: Request, file :any, cb:any) {
//         const caption = (req.body as { caption?: string })?.caption;
//         if (caption) {
//           const objectToHash = {
//             uuid: uuidv4(),
//             productName: caption,
//           };
//           const hash = createHash('md5').update(JSON.stringify(objectToHash)).digest('hex');
//           const key = `${hash}/${Date.now().toString()}`;
//           cb(null, key);
//         } else {
//           cb(new Error('Caption is missing.'));
//         }
//       },
//     }),
//   });
  
//   export default upload;

const multer = require("multer");
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req: any, file: any, cb: (arg0: null, arg1: string) => void) {
    cb(null, "uploads/"); // specify the destination directory
  },
  filename: function (req: any, file: { fieldname: string; originalname: string; }, cb: (arg0: null, arg1: string) => void) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + "-" + file.originalname); // specify the filename
  },
});
const fileFilter = function (req: any, file: { mimetype: string; }, cb: (arg0: Error | null, arg1: boolean) => void) {
  // const fileExtension = path.extname(file.originalname).toLowerCase();
  // only accept jpeg, png, and gif files
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/gif"  ||
    file.mimetype === "image/svg+xml" ||
    file.mimetype === "model/gltf-binary" 
  ) {
    
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};
const upload = multer({
  storage: storage, // specify the storage engine to use
  fileFilter: fileFilter, // specify the file filter function
  limits: {
    // fileSize: 1024 * 1024, // specify the maximum file size in bytes
  },
});

module.exports = upload;
