export {};
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const bodyparser = require("body-parser");
const path = require("path"); // inbuilt module
const passport = require("passport");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("src/docs/api.yaml");
const apiDocsAuth = require("./middleware/apiDocsAuth");
const AWS = require("aws-sdk");
// Connecting the Database
const connectDB = require("./database/connection");

//cors

// Starting the server
const app = express();
// const  http=require('http').Server(app)
// const io=require("socket.io")(http)

// const usp=io.of('/user-namespace');
// usp.on('connection',function(socket:any){
// console.log('user connected');
// socket.on('disconnect',function(){
//   console.log('user disconnected')
// })
// })
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));
// const socketIO = require("socket.io");

const http = require("http");
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:5000",
//     methods: ["GET", "POST"],
//   },
// });

//io connect that worked
// io.on("connection", (socket:any) => {
//   console.log(`User Connected: ${socket.id}`);

//   socket.on("join_room", (data:any) => {
//     socket.join(data);
//     console.log(`User with ID: ${socket.id} joined room: ${data}`);
//   });

//   socket.on("send_message", (data:any) => {
//     socket.to(data.room).emit("receive_message", data);
//   });

//   socket.on("disconnect", () => {
//     console.log("User Disconnected", socket.id);
//   });
// });
// const io: any = socketIO(server, {
//   cors: {
//     origin: "http://localhost:5000",
//     methods: ["GET", "POST"],
//   },
// });
const User = require("./model/userModel");
const ChatMessage = require("./model/chatMessageModel");
const chatSessions: { [key: string]: any } = {};


// let awsconfig = {
//   region: "ap-south-1",
//   accessKeyId: "AKIAULZF4YNQZCGNID3F", // Your AWS Access Key ID
//   secretAccessKey: "qDnTG9nl76u6upKfMOuAH3djQKu3IR2SrBX/8qtg",
// };
// AWS.config.update(awsconfig);
// const sessionId = generateSessionId(userIds);
// const chatNamespace = io.of(`/chat/${sessionId}`) as any

// io.on('connection', (socket:any) => {
//   console.log('A user connected via WebSocket');

//   // Handle WebSocket events here, if needed
//   // For example, you can add WebSocket event handlers:
//   socket.on('message', (message:any) => {
//     console.log('Received WebSocket message:', message);
//   });
// });

// const dynamoDB = new AWS.DynamoDB.DocumentClient();
// const tableName = "ChatSessionsTable"; // Replace with your DynamoDB table name
// let chatNamespace: any = null;

const crypto = require("crypto-js");

const upload = require("./middleware/multer");
// function generateSessionId(userIds: any) {
//   const concatenatedIds = userIds.join("-");

//   const sessionId = crypto.SHA256(concatenatedIds).toString();

//   return sessionId;
// }

const WebSocket = require('ws');

let awsconfig = {
    region: "ap-south-1",
    accessKeyId: "AKIAULZF4YNQZCGNID3F", // Your AWS Access Key ID
    secretAccessKey: "qDnTG9nl76u6upKfMOuAH3djQKu3IR2SrBX/8qtg",
  };
  AWS.config.update(awsconfig);
 
  const docClient = new AWS.DynamoDB.DocumentClient();

const TableName = "ChatSessionsTable";


const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

const sessions = new Map();


wss.on('connection', (socket:any, req:any) => {
  const sessionID = req.url.replace('/chat/', '');

  if (!sessions.has(sessionID)) {
    sessions.set(sessionID, { id: sessionID, sockets: new Set(), messages: [] });
  }

  const session = sessions.get(sessionID);
  session.sockets.add(socket);

  // Send the existing messages to the new socket
  session.messages.forEach((message:any) => {
    socket.send(message);
  });

  socket.on('message', (message:any) => {
    console.log('Received message:', message);
    const timestamp = new Date().toISOString(); // Add a timestamp for each message
    session.messages.push({ message, timestamp });

    // Broadcast the message to all sockets in the session
    session.sockets.forEach((clientSocket:any) => {
      if (clientSocket !== socket && clientSocket.readyState === WebSocket.OPEN) {
        clientSocket.send(message);
      }
    });

    // Store the messages in DynamoDB
    // storeMessagesInDynamoDB(sessionID, message, timestamp);
  });

  socket.on('close', () => {
    session.sockets.delete(socket);
    if (session.sockets.size === 0) {
      // Remove the session if no sockets are connected
      sessions.delete(sessionID);
    }
  });
});

server.on('upgrade', (request:any, socket:any, head:any) => {
  wss.handleUpgrade(request, socket, head, (ws:any) => {
    wss.emit('connection', ws, request);
  });
});

app.get('/', (req:any, res:any) => {
  res.send('WebSocket server running');
});

function storeMessagesInDynamoDB(sessionId:any, message:any, timestamp:any) {
  const params = {
    TableName: TableName,
    Key: { SessionID: sessionId, Timestamp: timestamp },
    UpdateExpression: "SET #messages = list_append(if_not_exists(#messages, :empty_list), :msg)",
    ExpressionAttributeNames: { "#messages": "Messages" },
    ExpressionAttributeValues: { ":msg": [message], ":empty_list": [] },
  };

  docClient.update(params, (err:any, data:any) => {
    if (err) {
      console.error("Error saving message to DynamoDB:", err);
    } else {
      console.log("Message saved to DynamoDB");
    }
  });
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cors());
app.use(cookieParser());
// initializing the configuration of .env
dotenv.config({
  path: "Config.env",
});

// port
const PORT = process.env.PORT || 5000;

// log requests -- console logs the request response time and type
app.use(morgan("tiny"));

// mongodb connection
connectDB();
 const session = require("express-session");
app.use(
  session({
    secret: "somethingsecretgoeshere",
    resave: true,
    saveUninitialized: true,
    cookie: {
      secure: true,
    },
  })
);
// Initializes passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());

app.use(
  express.urlencoded({
    extended: true,
  })
);

// load routers
const Route = require("./routes/router");
app.use("/", Route);

app.use(
  "/api-docs",
  apiDocsAuth,
  (req: any, res: any, next: any) => {
    const { role } = req.user;
    if (role !== "admin" && role !== "dev") {
      return res.status(403).json({ message: "Forbidden" });
    }
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

const sendMail = require("./middleware/mail");
const cloudinary = require("cloudinary");

const fs = require("fs");
const Design = require("./model/designModel"); // Import the Admin model

const Admin = require("./model/adminModel");
// // Define a route for uploading images and section

app.post(
  "/uploadImagesByAdmin",
  upload.array("image"),
  async (req: any, res: any) => {
    const uploader = (path: any) =>
      cloudinary.uploader.upload(path, { folder: "Images" });

    try {
      if (req.method === "POST") {
        const urls = [];
        const files = req.files;

        for (const file of files) {
          const { path } = file;
          const result = await uploader(path);
          urls.push(result.secure_url);
          fs.unlinkSync(path);
        }

        // Now, let's save the data along with the 'section' field in the Admin model
        const adminData = {
          section: req.body.section, // Assuming 'section' is provided in the request body
          photo1: urls[0], // Assuming you want to save the first image URL
          photo2: urls[1], // Assuming you want to save the second image URL
        };

        const savedAdminData = await Admin.create(adminData);

        res.status(201).json({
          message: "Images Uploaded Successfully",
          data: savedAdminData,
        });
      }
    } catch (error: any) {
      console.error(error);
      res
        .status(500)
        .json({
          error: "An error occurred while uploading images and saving data.",
        });
    }
  }
);
app.post(
  "/uploadDesignsScreenshots",
  upload.array("image"),
  async (req: any, res: any) => {
    const uploader = (path: any) =>
      cloudinary.uploader.upload(path, { folder: "Images" });

    try {
      if (req.method === "POST") {
        const urls = [];
        const files = req.files;

        for (const file of files) {
          const { path } = file;
          const result = await uploader(path);
          urls.push(result.secure_url);
          fs.unlinkSync(path);
        }

        // Now, let's save the data along with the 'section' field in the Admin model
        const DesignData = {
          userId: req.body.userId,
          text1: req.body.text1,
          text2: req.body.text2,
          text3: req.body.text3,
          text4: req.body.text4,
          photo1: urls[0], // Assuming you want to save the first image URL
          photo2: urls[1],
          photo3: urls[2],
          photo4: urls[3],
          photo5: urls[4],
          photo6: urls[5],
          photo7: urls[6],
          photo8: urls[7],
          photo9: urls[8],
          photo10: urls[9], // Assuming you want to save the second image URL
        };

        const savedDesignData = await Design.create(DesignData);

        res.status(201).json({
          message: "Images Uploaded Successfully",
          data: savedDesignData,
        });
      }
    } catch (error: any) {
      console.error(error);
      res
        .status(500)
        .json({
          error: "An error occurred while uploading images and saving data.",
        });
    }
  }
);
// const bcrypt = require('bcryptjs');
// const {v4 : uuidv4} = require('uuid')
// const Post=require("./model/postModel")
// const auth=require("./middleware/auth")
// app.post('/uploadpostt',auth, upload.single('image'), async (req: any, res: any) => {
//   const uploader = (path: any) => cloudinary.uploader.upload(path, { folder: 'Images' });

//   try {
//     if (req.method === 'POST') {
//       const urls = [];
//       const file = req.file;
//         const { path } = file;
//         const result = await uploader(path);
//         urls.push(result.secure_url);
//         fs.unlinkSync(path);
//         let user = await User.findById(req.user._id);
//         console.log(user)
//       let hashtagsArr = req.body.hashtags.split("#");
//       hashtagsArr.shift();

//       const newId = uuidv4();
//       console.log(newId);
//       const objectToHash = {
//         uuid: newId,
//         // postName: req.body.name
//         // postName: req.body.name
//         // postName: req.body.name
//         // postName: req.body.name
//         // postName: req.body.name
//       };
//       let imageName = await bcrypt.hash(JSON.stringify(objectToHash), 10);
//       imageName = imageName.replaceAll('/', '');
//       console.log(imageName);
//       // Now, let's save the data along with the 'section' field in the Admin model
//       const DesignData = {
//         caption: req.body.caption,
//         imageName: imageName,
//         hashtags: hashtagsArr,
//         taggedOwner: JSON.parse(req.body.taggedOwner),
//         avatar: req.user._id,
//         owner: req.user._id,
//         location: req.body.location,
//         imageUrl: urls[0], // Assuming you want to save the first image URL
//       // Assuming you want to save the second image URL
//       };

//       const savedDesignData = await Post.create(DesignData);

//       res.status(201).json({
//         message: 'Images Uploaded Successfully',
//         data: savedDesignData,
//       });
//     }
//   } catch (error: any) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while uploading images and saving data.' });
//   }
// });

// app.post('/uploadDesignsScreenshotssss',auth, upload.array('image', 50), async (req: any, res: any) => {
//   const uploader = (path: any) => cloudinary.uploader.upload(path, { folder: 'Images' });

//   try {
//     if (req.method === 'POST') {
//       const urls = [];
//       const files = req.files;

//       for (const file of files) {
//         const { path } = file;
//         const result = await uploader(path);
//         urls.push(result.secure_url);
//         fs.unlinkSync(path);
//       }

//       // Create an object to store the dynamic field names and values
//       const designPhotos: { [key: string]: string } = {};

//       // Assuming you want to save up to 50 photos (photo1, photo2, ..., photo50)
//       for (let i = 0; i < Math.min(urls.length, 50); i++) {
//         designPhotos[`photo${i + 1}`] = urls[i];
//       }

//       // Now, let's save the data along with the 'section' field in the Admin model
//       const DesignData = {
//         userId: req.body.userId,
//         apparel:req.body.apparel,
// size:req.body.size,
// fabric:req.body.fabric,
// color:req.body.color,
// gender:req.body.gender,
//         text1: req.body.text1,
//         text2: req.body.text2,
//         text3: req.body.text3,
//         text4: req.body.text4,

//         photos: urls, // Dynamically add photo fields
//       };

//       const savedDesignData = await Design.create(DesignData);

//       res.status(201).json({
//         message: 'Images Uploaded Successfully',
//         data: savedDesignData,
//       });
//     }
//   } catch (error: any) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while uploading images and saving data.' });
//   }
// });
// // const verifyToken=require("./middleware/auth")
// // app.get('/verify-token', verifyToken, (req:any, res:any) => {
// //   res.status(200).json({ message: 'Token is valid' });
// // });

// const images3D=require("./model/3dimagesModel")
// app.post('/upload3d', upload.single('image'), async (req: any, res: any) => {
//   const uploader = (path: any) => cloudinary.uploader.upload(path, { folder: 'Images' });

//   try {
//     if (req.method === 'POST') {
//       const urls = [];
//       const file = req.file;

//         const { path } = file;
//         const result = await uploader(path);
//         urls.push(result.secure_url);
//         fs.unlinkSync(path);

//       // Now, let's save the data along with the 'section' field in the Admin model
//       const DesignData = {
//        apparel:req.body.apparel,
//        photo1: urls[0]

//       };

//       const savedDesignData = await images3D.create(DesignData);

//       res.status(201).json({
//         message: 'Images Uploaded Successfully',
//         data: savedDesignData,
//       });
//     }
//   } catch (error: any) {
//     console.error(error);
//     res.status(500).json({ error: 'An error occurred while uploading images and saving data.' });
//   }
// });
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");
const Post = require("./model/postModel");
const auth = require("./middleware/auth");
app.post(
  "/uploadpostt",
  auth,
  upload.single("image"),
  async (req: any, res: any) => {
    const uploader = (path: any) =>
      cloudinary.uploader.upload(path, { folder: "Images" });

    try {
      if (req.method === "POST") {
        const urls = [];
        const file = req.file;
        const { path } = file;
        const result = await uploader(path);
        urls.push(result.secure_url);
        fs.unlinkSync(path);
        let user = await User.findById(req.user._id);
        console.log(user);
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
        };
        let imageName = await bcrypt.hash(JSON.stringify(objectToHash), 10);
        imageName = imageName.replaceAll("/", "");
        console.log(imageName);
        // Now, let's save the data along with the 'section' field in the Admin model
        const DesignData = {
          caption: req.body.caption,
          imageName: imageName,
          hashtags: hashtagsArr,
          taggedOwner: JSON.parse(req.body.taggedOwner),
          avatar: req.user._id,
          owner: req.user._id,
          location: req.body.location,
          imageUrl: urls[0], // Assuming you want to save the first image URL
          // Assuming you want to save the second image URL
        };

        const savedDesignData = await Post.create(DesignData);
           // Update user model to include the new post in the posts array
           user.posts.push(savedDesignData._id);
           await user.save();

        res.status(201).json({
          message: "Images Uploaded Successfully",
          data: savedDesignData,
        });
      }
    } catch (error: any) {
      console.error(error);
      res
        .status(500)
        .json({
          error: "An error occurred while uploading images and saving data.",
        });
    }
  }
);


app.post("/uploadstory", auth, async (req: any, res: any) => {
    const uploader = (path: any) =>
        cloudinary.uploader.upload(path, { folder: "Images" });

    try {
        if (req.method === "POST") {
            const { content } = req.body;

            // Upload to Cloudinary if there's an image file
            const urls = [];
            if (req.file) {
                const file = req.file;
                const { path } = file;
                const result = await uploader(path);
                urls.push(result.secure_url);
                fs.unlinkSync(path);
            }

            // Create a new story object
            const newStory = {
                content:urls[0],
                createdAt: Date.now(),
                expirationDate: new Date(+new Date() + 24 * 60 * 60 * 1000),
                // imageUrl: urls.length > 0 ? urls[0] : null, // Store the first image URL, if available
            };

            // Update the user's stories array
            await User.findByIdAndUpdate(req.user._id, { $push: { stories: newStory } });

            res.status(201).json({
                message: "Story Uploaded Successfully",
                data: newStory,
            });
        }
    } catch (error: any) {
        console.error(error);
        res.status(500).json({
            error: "An error occurred while uploading the story and saving data.",
        });
    }
});

app.post(
  "/uploadDesignsScreenshotssss",
  auth,
  upload.array("image", 50),
  async (req: any, res: any) => {
    const uploader = (path: any) =>
      cloudinary.uploader.upload(path, { folder: "Images" });

    try {
      if (req.method === "POST") {
        const urls = [];
        const files = req.files;

        for (const file of files) {
          const { path } = file;
          const result = await uploader(path);
          urls.push(result.secure_url);
          fs.unlinkSync(path);
        }

        // Create an object to store the dynamic field names and values
        const designPhotos: { [key: string]: string } = {};

        // Assuming you want to save up to 50 photos (photo1, photo2, ..., photo50)
        for (let i = 0; i < Math.min(urls.length, 50); i++) {
          designPhotos[`photo${i + 1}`] = urls[i];
        }

        // Now, let's save the data along with the 'section' field in the Admin model
        const DesignData = {
          userId: req.body.userId,
          apparel: req.body.apparel,
          size: req.body.size,
          fabric: req.body.fabric,
          color: req.body.color,
          gender: req.body.gender,
          text1: req.body.text1,
          text2: req.body.text2,
          text3: req.body.text3,
          text4: req.body.text4,
          photos: urls, // Dynamically add photo fields
        };

        const savedDesignData = await Design.create(DesignData);

        res.status(201).json({
          message: "Images Uploaded Successfully",
          data: savedDesignData,
        });
      }
    } catch (error: any) {
      console.error(error);
      res
        .status(500)
        .json({
          error: "An error occurred while uploading images and saving data.",
        });
    }
  }
);
const verifyToken = require("./middleware/auth");
app.get("/verify-token", verifyToken, (req: any, res: any) => {
  res.status(200).json({ message: "Token is valid" });
});
app.get("/forgot-password" , (req: any, res: any) => {
   res.render('forgot-password')
  //  res.send("Forgot Password Route");
})
const images3D = require("./model/3dimagesModel");
app.post("/upload3d", upload.single("image"), async (req: any, res: any) => {
  const uploader = (path: any) =>
    cloudinary.uploader.upload(path, { folder: "Images" });

  try {
    if (req.method === "POST") {
      const urls = [];
      const file = req.file;

      const { path } = file;
      const result = await uploader(path);
      urls.push(result.secure_url);
      fs.unlinkSync(path);

      // Now, let's save the data along with the 'section' field in the Admin model
      const DesignData = {
        apparel: req.body.apparel,
        photo1: urls[0],
      };

      const savedDesignData = await images3D.create(DesignData);

      res.status(201).json({
        message: "Images Uploaded Successfully",
        data: savedDesignData,
      });
    }
  } catch (error: any) {
    console.error(error);
    res
      .status(500)
      .json({
        error: "An error occurred while uploading images and saving data.",
      });
  }
});
//const sendMail = require("./middleware/mail");

app.get("/getkey", (req: any, res: any) =>
  res.status(200).json({ key: process.env.RAZORPAY_API_KEY })
);
// const cloudinary=require("cloudinary");
// const upload=require("./middleware/multer")
// const fs=require("fs")
// app.use('/uploadImagesByAdmin',upload.array('image'),async(req:any,res:any)=>{
//   const uploader=async(path:any)=>await cloudinary.uploads(path,'Images')
//   if(req==='Post'){
//     const urls=[]
//     const files=req.files
//     for(const file of files){
//       const {path}=file
//       const newPath= await uploader(path)
//       urls.push(newPath)
//       fs.unlinkSync(path)
//     }
//     res.status(200).json({
//       message:'Images Uploaded Successfully'
//       data:urls
//     })
//   }
// })

// const uploadProfilePicture = require("./controller/uploadController");
// app.post(
//   "/story/uploadProfilePicture",
//   uploadProfilePicture,
//   (req: any, res: any) => res.status(200).json({})
// );

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
