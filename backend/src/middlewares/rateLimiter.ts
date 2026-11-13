import rateLimit from 'express-rate-limit';
import { AppError } from '../errors/AppError.js';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return (req.headers['cf-connecting-ip'] as string) || req.ip || 'unknown-ip';
  },
  handler: (_req, _res, next) => {
    next(new AppError('Too many authentication attempts. Please try again in 15 minutes.', 429, 'RATE_LIMIT_EXCEEDED'));
  },
});

export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 180, // 180 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return (req.headers['cf-connecting-ip'] as string) || req.ip || 'unknown-ip';
  },
  handler: (_req, _res, next) => {
    next(new AppError('API rate limit exceeded. Please slow down.', 429, 'RATE_LIMIT_EXCEEDED'));
  },
});

