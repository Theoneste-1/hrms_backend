import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger.js';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
  code?: string;
}

export class CustomError extends Error implements AppError {
  public statusCode: number;
  public isOperational: boolean;
  public code?: string;

  constructor(message: string, statusCode: number = 500, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.code = code;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let { statusCode = 500, message, code } = error;

  // Log the error
  logger.error('Error occurred:', {
    error: {
      message: error.message,
      stack: error.stack,
      statusCode,
      code,
    },
    request: {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: (req as any).user?.id,
      companyId: (req as any).user?.companyId,
    },
  });

  // Handle specific error types
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      code,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
    timestamp: new Date().toISOString(),
    path: req.url,
    method: req.method,
  });
};

export const createError = (message: string, statusCode: number = 500, code?: string): CustomError => {
  return new CustomError(message, statusCode, code);
};

export const createValidationError = (message: string): CustomError => {
  return new CustomError(message, 400, 'VALIDATION_ERROR');
};

export const createNotFoundError = (message: string = 'Resource not found'): CustomError => {
  return new CustomError(message, 404, 'NOT_FOUND');
};

export const createUnauthorizedError = (message: string = 'Unauthorized'): CustomError => {
  return new CustomError(message, 401, 'UNAUTHORIZED');
};

export const createForbiddenError = (message: string = 'Forbidden'): CustomError => {
  return new CustomError(message, 403, 'FORBIDDEN');
};

export const createConflictError = (message: string = 'Conflict'): CustomError => {
  return new CustomError(message, 409, 'CONFLICT');
};
