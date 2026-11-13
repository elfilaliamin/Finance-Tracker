import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service.js';
import { sendSuccess } from '../../utils/responseEnvelope.js';

const COOKIE_NAME = 'ft_auth_token';
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export class AuthController {
  private getCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: SEVEN_DAYS_MS,
      path: '/',
    };
  }

  register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, token } = await authService.register(req.body);
      res.cookie(COOKIE_NAME, token, this.getCookieOptions());
      sendSuccess(res, { user }, undefined, 201);
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { user, token } = await authService.login(req.body);
      res.cookie(COOKIE_NAME, token, this.getCookieOptions());
      sendSuccess(res, { user }, undefined, 200);
    } catch (err) {
      next(err);
    }
  };

  logout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie(COOKIE_NAME, { path: '/' });
    sendSuccess(res, { message: 'Logged out successfully' }, undefined, 200);
  };

  getCurrentUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await authService.getCurrentUser(req.userId!);
      sendSuccess(res, { user }, undefined, 200);
    } catch (err) {
      next(err);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await authService.changePassword(req.userId!, req.body);
      sendSuccess(res, { message: 'Password changed successfully' }, undefined, 200);
    } catch (err) {
      next(err);
    }
  };
}

export const authController = new AuthController();

