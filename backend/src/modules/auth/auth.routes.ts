import { Router } from 'express';
import { authController } from './auth.controller.js';
import { registerSchema, loginSchema, changePasswordSchema } from './auth.schemas.js';
import { validateRequest } from '../../middlewares/validateRequest.js';
import { authenticate } from '../../middlewares/authenticate.js';
import { authRateLimiter } from '../../middlewares/rateLimiter.js';

const router = Router();

router.post(
  '/register',
  authRateLimiter,
  validateRequest({ body: registerSchema }),
  authController.register
);

router.post(
  '/login',
  authRateLimiter,
  validateRequest({ body: loginSchema }),
  authController.login
);

router.post('/logout', authController.logout);

router.get('/me', authenticate, authController.getCurrentUser);

router.put(
  '/password',
  authenticate,
  validateRequest({ body: changePasswordSchema }),
  authController.changePassword
);

export default router;

