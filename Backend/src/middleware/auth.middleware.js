const jwt = require('jsonwebtoken');
const User = require('../model/auth.model'); 

const verifyToken = async (req, res, next) => {
  try {
    // 1. Extract the token from cookies 

    const token = req.cookies.token; 
    
    if (!token) {
      return res.status(401).json({ message: "No token provided in cookies" });
    }

    // 2. Verify token (no need to split "Bearer" anymore, it's just the raw token)
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    
    // 3. Attach user to request
    req.user = await User.findById(decoded.id || decoded._id); 

    if (!req.user) return res.status(401).json({ message: "User not found" });

    next(); 
  } catch (error) {
    console.error("JWT Verification Error:", error.message); 
    return res.status(401).json({ message: "Invalid Token" });
  }
};

const verifyAdmin = async (req, res, next) => {
  try {
     const token = req.cookies.token; 
    
    if (!token) {
      return res.status(401).json({ message: "No token provided in cookies" });
    }

    
    const decoded = jwt.verify(token, process.env.JWT_KEY);

    if(!decoded.role === 'user'){
      return res.status(401).json({ message: "User not authorized" });

    }
    next()
  } catch (error) {
    console.log(error);
    
  }
}

module.exports = { verifyToken, verifyAdmin }; 
