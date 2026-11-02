import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import logger from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(`${req.method} ${req.url} - Error: ${err.message}`, err);

  // Zod validation errors
  if (err instanceof ZodError) {
    const formatted = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formatted
    });
  }

  // Prisma Unique Constraint violation (e.g. concurrent slot booking)
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'A unique constraint was violated or the selected slot was already booked by another patient.',
        code: 'CONFLICT'
      });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'The requested record was not found or has been updated.',
        code: 'NOT_FOUND'
      });
    }
    if (err.code === 'P2034') {
      return res.status(409).json({
        success: false,
        message: 'Transaction write conflict occurred. Please retry.',
        code: 'WRITE_CONFLICT'
      });
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or malformed authentication token',
      code: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Authentication token has expired. Please log in again.',
      code: 'TOKEN_EXPIRED'
    });
  }

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}
