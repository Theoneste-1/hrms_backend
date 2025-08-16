import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    companyId: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // For now, we'll use a simple API key approach
    // In production, you'd want to validate JWT tokens
    const apiKey = req.headers['x-api-key'] || req.headers.authorization;
    
    if (!apiKey) {
      res.status(401).json({
        success: false,
        error: {
          message: 'API key required',
          code: 'UNAUTHORIZED',
        }
      });
      return;
    }

    // Simple validation - in production, validate against database
    if (apiKey === process.env.API_KEY || apiKey === `Bearer ${process.env.API_KEY}`) {
      // Set mock user for now - in production, decode JWT or validate API key
      req.user = {
        id: 'system',
        email: 'system@hrms.com',
        companyId: 'system',
        role: 'SYSTEM',
      };
      next();
    } else {
      res.status(401).json({
        success: false,
        error: {
          message: 'Invalid API key',
          code: 'UNAUTHORIZED',
        }
      });
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Authentication error',
        code: 'AUTH_ERROR',
      }
    });
  }
};
