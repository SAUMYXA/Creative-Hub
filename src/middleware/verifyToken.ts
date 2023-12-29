export {}
const jwt = require('jsonwebtoken');

function verifyToken(req: any, res: any, next: any) {
  const token = req.headers.authorization; // Assuming the token is sent in the Authorization header

  if (!token) {
    return res.status(401).json({ message: 'Token is missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ message: 'Token is invalid' });
    }
    // Set the user property on the request object
    req.user = decoded;
    next();
  });
}

module.exports = verifyToken;
