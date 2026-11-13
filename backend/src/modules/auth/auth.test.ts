import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as argon2 from '@node-rs/argon2';
import { AuthService } from './auth.service.js';
import { UnauthorizedError } from '../../errors/AppError.js';

describe('Auth Service Suite', () => {
  const service = new AuthService({} as any);

  it('should hash and verify passwords using Argon2id', async () => {
    const rawPassword = 'SecurePassword123!';
    const hash = await argon2.hash(rawPassword);
    assert.ok(hash.startsWith('$argon2'));

    const isValid = await argon2.verify(hash, rawPassword);
    assert.equal(isValid, true);

    const isWrong = await argon2.verify(hash, 'WrongPassword!');
    assert.equal(isWrong, false);
  });

  it('should generate and verify JWT session tokens', () => {
    const userId = '11111111-1111-1111-1111-111111111111';
    const email = 'user@test.local';

    const token = service.generateToken(userId, email);
    assert.ok(typeof token === 'string');
    assert.ok(token.length > 20);

    const payload = service.verifyToken(token);
    assert.equal(payload.sub, userId);
    assert.equal(payload.email, email);
  });

  it('should throw UnauthorizedError on invalid token signature', () => {
    assert.throws(
      () => {
        service.verifyToken('invalid.token.string');
      },
      (err: any) => err instanceof UnauthorizedError
    );
  });
});

