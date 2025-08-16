import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../config/logger';
import { createUnauthorizedError, createForbiddenError } from './errorHandler';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    companyId: string;
    role: string;
    permissions?: string[];
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createUnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!process.env.JWT_SECRET) {
      logger.error('JWT_SECRET not configured');
      throw createUnauthorizedError('Authentication configuration error');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
      
      // Validate required fields
      if (!decoded.id || !decoded.email || !decoded.companyId || !decoded.role) {
        throw createUnauthorizedError('Invalid token payload');
      }

      // Check if token is expired
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        throw createUnauthorizedError('Token expired');
      }

      // Set user information in request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        companyId: decoded.companyId,
        role: decoded.role,
        permissions: decoded.permissions || [],
      };

      logger.debug('User authenticated:', {
        userId: req.user.id,
        email: req.user.email,
        companyId: req.user.companyId,
        role: req.user.role,
      });

      next();
    } catch (jwtError) {
      if (jwtError instanceof Error) {
        if (jwtError.name === 'TokenExpiredError') {
          throw createUnauthorizedError('Token expired');
        } else if (jwtError.name === 'JsonWebTokenError') {
          throw createUnauthorizedError('Invalid token');
        }
      }
      throw createUnauthorizedError('Token verification failed');
    }
  } catch (error) {
    next(error);
  }
};

// Role-based access control middleware
export const requireRole = (allowedRoles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createUnauthorizedError('Authentication required');
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn('Access denied - insufficient role:', {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        endpoint: req.originalUrl,
      });
      throw createForbiddenError('Insufficient permissions');
    }

    next();
  };
};

// Permission-based access control middleware
export const requirePermission = (requiredPermission: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createUnauthorizedError('Authentication required');
    }

    if (!req.user.permissions?.includes(requiredPermission)) {
      logger.warn('Access denied - insufficient permission:', {
        userId: req.user.id,
        userPermissions: req.user.permissions,
        requiredPermission,
        endpoint: req.originalUrl,
      });
      throw createForbiddenError('Insufficient permissions');
    }

    next();
  };
};

// Company access control middleware
export const requireCompanyAccess = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    throw createUnauthorizedError('Authentication required');
  }

  // Extract company ID from request params or body
  const requestedCompanyId = req.params.companyId || req.body.companyId || req.query.companyId;
  
  if (requestedCompanyId && requestedCompanyId !== req.user.companyId) {
    logger.warn('Access denied - company mismatch:', {
      userId: req.user.id,
      userCompanyId: req.user.companyId,
      requestedCompanyId,
      endpoint: req.originalUrl,
    });
    throw createForbiddenError('Access denied to this company');
  }

  next();
};

// Self-access control middleware (users can only access their own data unless they have admin role)
export const requireSelfAccessOrRole = (allowedRoles: string[] = ['SUPER_ADMIN', 'COMPANY_ADMIN']) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw createUnauthorizedError('Authentication required');
    }

    const requestedUserId = req.params.userId || req.params.id || req.body.userId;
    
    // Allow access if user is accessing their own data
    if (requestedUserId === req.user.id) {
      return next();
    }

    // Allow access if user has required role
    if (allowedRoles.includes(req.user.role)) {
      return next();
    }

    logger.warn('Access denied - insufficient permissions for user data:', {
      userId: req.user.id,
      userRole: req.user.role,
      requestedUserId,
      endpoint: req.originalUrl,
    });
    throw createForbiddenError('Access denied to this user data');
  };
};

// Rate limiting per user middleware
export const userRateLimit = (maxRequests: number, windowMs: number) => {
  const userRequests = new Map<string, { count: number; resetTime: number }>();

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next();
    }

    const now = Date.now();
    const userKey = `${req.user.id}:${req.originalUrl}`;
    const userData = userRequests.get(userKey);

    if (!userData || now > userData.resetTime) {
      userRequests.set(userKey, { count: 1, resetTime: now + windowMs });
      return next();
    }

    if (userData.count >= maxRequests) {
      logger.warn('Rate limit exceeded for user:', {
        userId: req.user.id,
        endpoint: req.originalUrl,
        limit: maxRequests,
        windowMs,
      });
      throw createForbiddenError('Rate limit exceeded');
    }

    userData.count++;
    next();
  };
};

// Logging middleware for authenticated requests
export const logAuthenticatedRequest = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (req.user) {
    logger.info('Authenticated request:', {
      userId: req.user.id,
      email: req.user.email,
      companyId: req.user.companyId,
      role: req.user.role,
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
  }
  next();
};
