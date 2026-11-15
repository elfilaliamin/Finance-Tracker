import * as argon2 from '@node-rs/argon2';
import jwt from 'jsonwebtoken';
import { AuthRepository, authRepository } from './auth.repository.js';
import { RegisterInput, LoginInput, ChangePasswordInput } from './auth.schemas.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../errors/AppError.js';

export interface UserSessionPayload {
  sub: string;
  email: string;
}

export class AuthService {
  private readonly jwtSecret: string;
  private readonly repository: AuthRepository;

  constructor(repository: AuthRepository = authRepository) {
    this.repository = repository;
    this.jwtSecret = process.env.JWT_SECRET || 'dev_insecure_jwt_secret_replace_in_production_min_32';
  }

  generateToken(userId: string, email: string): string {
    return jwt.sign({ sub: userId, email }, this.jwtSecret, {
      expiresIn: '7d',
    });
  }

  verifyToken(token: string): UserSessionPayload {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as UserSessionPayload;
      return decoded;
    } catch {
      throw new UnauthorizedError('Invalid or expired authentication session');
    }
  }

  async register(input: RegisterInput) {
    const existing = await this.repository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError(`An account with email '${input.email}' already exists.`);
    }

    const passwordHash = await argon2.hash(input.password);
    const user = await this.repository.createUser(
      input.email,
      passwordHash,
      input.displayName,
      input.baseCurrency
    );
    const token = this.generateToken(user.id, user.email);

    return { user, token };
  }

  async login(input: LoginInput) {
    const user = await this.repository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isMatch = await argon2.verify(user.passwordHash, input.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        createdAt: user.createdAt,
        baseCurrency: user.baseCurrency || 'MAD',
      },
      token,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new NotFoundError('User account not found');
    }
    return user;
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await this.repository.findByIdWithPassword(userId);
    if (!user) {
      throw new NotFoundError('User account not found');
    }

    const isMatch = await argon2.verify(user.passwordHash, input.currentPassword);
    if (!isMatch) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    const newHash = await argon2.hash(input.newPassword);
    await this.repository.updatePassword(userId, newHash);
  }
}

export const authService = new AuthService();

