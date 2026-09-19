const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  const tokenHeader = req.header('Authorization');

  if (!tokenHeader) {
    return res.status(401).json({ status: 'ERROR', message: 'No authentication token provided. Authorization denied.' });
  }

  const token = tokenHeader.startsWith('Bearer ') ? tokenHeader.slice(7) : tokenHeader;

  try {
    const secret = process.env.JWT_SECRET || 'supersecretcyberaijwtkey2026';
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ status: 'ERROR', message: 'Token verification failed or expired. Please re-login.' });
  }
};

module.exports = auth;
