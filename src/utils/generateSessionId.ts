// const crypto= require('crypto-js');

// module.exports.generateSessionId(userIds:any) {
//     // if (userIds.length < 2) {
//     //   throw new Error('At least 2 user IDs are required for a session.');
//     // }
  
//     // Concatenate the user IDs
//     const concatenatedIds = userIds.join('-');
  
//     // Calculate a hash of the concatenated IDs
//     const sessionId = crypto.SHA256(concatenatedIds).toString();
  
//     return sessionId;
//   }