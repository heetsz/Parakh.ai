import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const protect = async (req, res, next) => {
      try {
            let token = null;

            if (req.cookies && req.cookies.token) {
                  token = req.cookies.token;
            } else if (
                  req.headers.authorization &&
                  req.headers.authorization.startsWith('Bearer')
            ) {
                  token = req.headers.authorization.split(' ')[1];
            }
            if (!token) {
                  return res.status(401).json({
                        message: 'Token not found, login first'
                  });
            }

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
            
            // Find the full user object using userId from token
            const user = await User.findById(decoded.userId);
            if (user) {
                  req.user = user;
            } else {
                  // Fallback to decoded token if user not found in DB
                  req.user = { _id: decoded.userId, username: decoded.username };
            }
            
            next();
      } catch (error) {
            console.error("Auth error:", error);
            console.error("Error name:", error.name);
            console.error("Error message:", error.message);
            
            let errorMessage = 'Access Denied, Invalid Token';
            
            if (error.name === 'TokenExpiredError') {
                  errorMessage = 'Token expired, please login again';
            } else if (error.name === 'JsonWebTokenError') {
                  errorMessage = 'Invalid token, please login again';
            }
            
            res.status(401).json({ 
                  success: false,
                  message: errorMessage,
                  error: error.message 
            });
      }
};
