import type { Request, Response, NextFunction } from 'express';
import { jwtService, type JwtPayload } from '../services/jwtService.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Bearer formatted token needed' });
  }

  const parts = authHeader.split(' ');
  const token = parts[1];
  if (!token) {
    return res.status(401).json({ message: 'Authentication required: Token value missing.' });
  }

  try {
    const decoded = jwtService.verifyAccessToken(token) as JwtPayload | null;
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    req.user = decoded; // Safe assignment since null is handled
    return next();
  } catch (err) {
    if ((err as any).name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired', error: (err as any).message });
    }
    return res.status(403).json({ message: 'Invalid token' });
  }
};