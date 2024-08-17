import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Skip authentication for specific routes if needed
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/docs')) {
    return next();
  }

  const token = req.cookies.auth_token || req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'secret_key'; // Replace 'secret_key' with your secret key
    const decoded = jwt.verify(token, secretKey) as { id: string };
    req.userId = decoded.id;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

export default authMiddleware;
