require('dotenv').config();
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
  console.log('Cookies received:', req.cookies?.token); // безпечний доступ
  console.log('Path:', req.path);

  let token = null;

  // 1️⃣ Перевірка Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2️⃣ Перевірка cookie
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    if (req.path.startsWith('/api')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    req.user = user;
    next();

  } catch (error) {
    console.error('JWT Verification Error:', error.message);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  next();
};

function deviceAuth(req, res, next) {
  const secret = req.headers['x-device-secret'];
  if (secret !== process.env.DEVICE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized device' });
  }
  next();
}

module.exports = {
  authMiddleware,
  adminMiddleware,
  deviceAuth
};