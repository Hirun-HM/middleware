const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }
    
    req.user = user;
    next();
  });
};

const authorizeClient = (req, res, next) => {
  if (req.user.type !== 'client') {
    return res.status(403).json({
      success: false,
      error: 'Client access required'
    });
  }
  next();
};

const authorizeDriver = (req, res, next) => {
  if (req.user.type !== 'driver') {
    return res.status(403).json({
      success: false,
      error: 'Driver access required'
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  authorizeClient,
  authorizeDriver
};
