import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'zod';
import { ValidationError, NotFoundError, AppError } from './errors/AppError.js';
import { validateRequest } from './middlewares/validateRequest.js';

describe('Core Error & Validation Suite', () => {
  it('should instantiate ValidationError with code and details', () => {
    const error = new ValidationError('Invalid payload', [{ field: 'email', issue: 'Invalid email' }]);
    assert.equal(error.statusCode, 400);
    assert.equal(error.code, 'VALIDATION_ERROR');
    assert.equal(error.details?.length, 1);
    assert.equal(error.details[0].field, 'email');
  });

  it('should instantiate NotFoundError with 404', () => {
    const error = new NotFoundError('Item not found');
    assert.equal(error.statusCode, 404);
    assert.equal(error.code, 'NOT_FOUND');
  });

  it('validateRequest middleware should pass valid payload', (t, done) => {
    const schema = z.object({
      name: z.string().min(2),
    });
    const middleware = validateRequest({ body: schema });
    const req = { body: { name: 'Valid' } } as any;
    const res = {} as any;
    middleware(req, res, (err) => {
      assert.equal(err, undefined);
      done();
    });
  });

  it('validateRequest middleware should catch invalid payload and pass ValidationError', (t, done) => {
    const schema = z.object({
      amount: z.number().positive(),
    });
    const middleware = validateRequest({ body: schema });
    const req = { body: { amount: -50 } } as any;
    const res = {} as any;
    middleware(req, res, (err) => {
      assert.ok(err instanceof ValidationError);
      assert.equal(err.code, 'VALIDATION_ERROR');
      assert.equal(err.details?.[0].field, 'amount');
      done();
    });
  });
});

