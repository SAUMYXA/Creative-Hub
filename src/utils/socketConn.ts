// const generateSessionId=require('../utils/generateSessionId')
// const express=require('express')
// const app = express();
// const bodyparser = require("body-parser");
// const tableName = 'ChatSessionsTable';
// const socketConn = async(io:any)=>{
//     const userIds = req.body.userIds
//   const sessionId = generateSessionId(userIds);
//   const participants = [userIds];
//   // const sessionId = generateSessionId(userIds);
//   // const chatNamespace = io.of(`/chat/${sessionId}`) as any
//   // Define the chat session data to save in DynamoDB
//   const chatSession = {
//     sessionId,
//     participants,
//     messages: [],
//     // Add more properties as needed
//   };

//   // Save chat session data in DynamoDB
//   saveChatSessionToDynamoDB(chatSession, () => {
//     // Create a WebSocket namespace for the chat session
//     const chatNamespace = io.of(`/chat/${sessionId}`); // Set up Socket.io namespace

//     // Handle socket events for the chat session
//     chatNamespace.on('connection', (socket:any) => {
//       console.log('A user connected to the chat session');

//       socket.on('message', (message:any) => {
//         // Broadcast the message to all users in the chat session
//         chatNamespace.emit('message', message);

//         // Save the message to DynamoDB
//         saveMessageToDynamoDB(sessionId, message);
//       });

//       socket.on('disconnect', () => {
//         console.log('A user disconnected from the chat session');
//       });
//     });

//     res.json({ sessionId });
//   });
// });
// // io.on('connection', (socket:any) => {
// //   console.log('A user connected via WebSocket');

// //   // Handle WebSocket events here, if needed
// // });
// // Function to save chat session data to DynamoDB
// function saveChatSessionToDynamoDB(chatSession:any, callback:any) {
//   // const timestamp = Date.now().toString();
//   const params = {
//     TableName: tableName,
//     Item: {
//       SessionID: chatSession.sessionId,
//       Participants: chatSession.participants,
//       Messages: chatSession.messages,
//       Timestamp: chatSession.sessionId,
//       // Add more attributes as needed
//     },
//   };

//   dynamoDB.put(params, (err:any, data:any) => {
//     if (err) {
//       console.error('Error saving chat session to DynamoDB:', err);
//     } else {
//       console.log('Chat session saved to DynamoDB');
//       callback();
//     }
//   });
// }

// // Function to save a message to DynamoDB
// function saveMessageToDynamoDB(sessionId:any, message:any) {
//   const params = {
//     TableName: tableName,
//     key: { SessionID: sessionId },
//     UpdateExpression: 'SET #messages = list_append(#messages, :msg)',
//     ExpressionAttributeNames: { '#messages': 'Messages' },
//     ExpressionAttributeValues: { ':msg': [message] },
//   };

//   dynamoDB.update(params, (err:any, data:any) => {
//     if (err) {
//       console.error('Error saving message to DynamoDB:', err);
//       // console.log(Key)
//     } else {
//       console.log('Message saved to DynamoDB');
//     }
//   });
// }
// }