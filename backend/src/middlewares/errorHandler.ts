import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError.js';
import { sendError } from '../utils/responseEnvelope.js';
import { logger } from '../utils/logger.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error(`[AppError ${err.code}] ${err.message}`, err, { path: req.path, method: req.method });
    } else {
      logger.warn(`[AppError ${err.code}] ${err.message}`, { path: req.path, method: req.method, details: err.details });
    }

    sendError(res, err.statusCode, err.code, err.message, err.details);
    return;
  }

  // Unhandled internal server error
  logger.error(`[UnhandledException] ${err.message}`, err, {
    path: req.path,
    method: req.method,
  });

  // Never leak internal stack traces to the client in production
  sendError(
    res,
    500,
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'production'
      ? 'An unexpected internal error occurred'
      : err.message
  );
}

