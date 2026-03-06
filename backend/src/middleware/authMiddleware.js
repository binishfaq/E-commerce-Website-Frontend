// backend/src/middleware/authMiddleware.js
import { verifyToken } from '../utils/generateToken.js';
import { getOne } from '../utils/db.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = verifyToken(token);

      if (!decoded) {
        return res.status(401).json({ message: 'Not authorized, invalid token' });
      }

      const user = await getOne(
        'SELECT id, firstName, lastName, email, phone, address, city, province, isAdmin FROM users WHERE id = ?',
        [decoded.id]
      );

      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin === 1) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized as admin' });
  }
};