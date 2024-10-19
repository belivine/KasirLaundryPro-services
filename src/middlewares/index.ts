import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Skip authentication for specific routes if needed
  if (req.path.startsWith('/api/auth') || req.path.startsWith('/api/docs') || req.path.startsWith('/api/transaction/invoice') || req.path.startsWith('/api/auth/signup/token')) {
    return next();
  }

  const token = req.cookies.auth_token || req.headers['authorization'];
  const crToken = req.headers['cron-job-token'];
  const crPrivateToken = process.env.crToken;
  
  if (req.path.startsWith('/user/delete-temp-files')) {
    if (crToken == crPrivateToken) {
      return next();
    } else {
      return res.status(401).json({ message: 'Akses ditolak. Token tidak sesuai' });
    }
  } 

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak sesuai' });
  }

  try {
    const secretKey = process.env.JWT_SECRET || 'secret_key'; // Replace 'secret_key' with your secret key
    const decoded = jwt.verify(token, secretKey) as { id: string };
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ message: 'Token tidak ditemukan' });
  }
};

export default authMiddleware;
