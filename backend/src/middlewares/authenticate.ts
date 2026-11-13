import { Request, Response, NextFunction } from 'express';
import { authService } from '../modules/auth/auth.service.js';
import { UnauthorizedError } from '../errors/AppError.js';

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userEmail?: string;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  // Extract token from httpOnly cookie or Authorization header
  const cookieToken = req.cookies?.ft_auth_token;
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  const token = cookieToken || headerToken;

  if (!token) {
    next(new UnauthorizedError('Authentication token is missing. Please log in.'));
    return;
  }

  try {
    const payload = authService.verifyToken(token);
    req.userId = payload.sub;
    req.userEmail = payload.email;
    next();
  } catch (err) {
    next(err);
  }
}

